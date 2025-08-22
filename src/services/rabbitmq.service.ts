import amqp from 'amqplib';
import { WebSocketServer } from 'ws';
import { QuotationWithRelations } from '../types/quotation.types.js';

export class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private wss: WebSocketServer | null = null;
  private readonly RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
  private readonly QUEUE_NAME = 'quotation_alerts';
  private readonly EXCHANGE_NAME = 'quotation_events';
  private readonly ROUTING_KEY = 'quotation.created';

  async initialize() {
    try {
      // Connect to RabbitMQ
      this.connection = await amqp.connect(this.RABBIT_URL) as unknown as amqp.Connection;
      console.log('✅ Connected to RabbitMQ');

      // Create channel
      this.channel = await (this.connection as any).createChannel() as unknown as amqp.Channel;
      console.log('✅ RabbitMQ channel created');

      // Assert exchange for quotation events
      if (this.channel) {
        await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', { durable: true });
        console.log('✅ Exchange asserted:', this.EXCHANGE_NAME);

        // Assert queue for alerts
        await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
        console.log('✅ Queue asserted:', this.QUEUE_NAME);

        // Bind queue to exchange
        await this.channel.bindQueue(this.QUEUE_NAME, this.EXCHANGE_NAME, this.ROUTING_KEY);
        console.log('✅ Queue bound to exchange');
      }

      // Initialize WebSocket server
      this.initializeWebSocket();

      // Handle connection close
      if (this.connection) {
        this.connection.on('close', () => {
          console.log('❌ RabbitMQ connection closed');
          this.reconnect();
        });

        this.connection.on('error', (error) => {
          console.error('❌ RabbitMQ connection error:', error);
          this.reconnect();
        });
      }

    } catch (error) {
      console.error('❌ Failed to initialize RabbitMQ service:', error);
      this.reconnect();
    }
  }

  private initializeWebSocket() {
    try {
      this.wss = new WebSocketServer({ port: 4001 }); // Using port 4001 to avoid conflict with Hapi
      console.log('✅ WebSocket server started on ws://localhost:4001');

      this.wss.on('connection', (ws) => {
        console.log('🔌 WebSocket client connected');

        ws.on('close', () => {
          console.log('🔌 WebSocket client disconnected');
        });

        ws.on('error', (error) => {
          console.error('❌ WebSocket error:', error);
        });
      });

      this.wss.on('error', (error) => {
        console.error('❌ WebSocket server error:', error);
      });

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket server:', error);
    }
  }

  async sendQuotationAlert(quotation: QuotationWithRelations) {
    try {
      if (!this.channel) {
        console.error('❌ RabbitMQ channel not available');
        return;
      }

      // Check if insured area is greater than 500 hectares
      if (quotation.insuredArea > 500) {
        const alertPayload = {
          type: 'HIGH_AREA_ALERT',
          timestamp: new Date().toISOString(),
          quotationId: quotation.id,
          clientName: quotation.clientName,
          insuredArea: quotation.insuredArea,
          insuredAmount: quotation.insuredAmount,
          crop: quotation.crop.name,
          state: quotation.state.name,
          text: `⚠️ Se ha registrado una solicitud de cotización con ${quotation.insuredArea.toFixed(2)} hectáreas aseguradas `,
          message: `⚠️ Se ha registrado una solicitud de cotización con ${quotation.insuredArea.toFixed(2)} hectáreas aseguradas`
        };

        // Publish to exchange
        this.channel.publish(
          this.EXCHANGE_NAME,
          this.ROUTING_KEY,
          Buffer.from(JSON.stringify(alertPayload))
        );

        console.log('🚨 High area alert sent:', alertPayload.message);

        // Send to WebSocket clients
        this.broadcastToWebSocket(alertPayload);

        // Also send to the alerts queue for processing
        this.channel.sendToQueue(
          this.QUEUE_NAME,
          Buffer.from(JSON.stringify(alertPayload))
        );

      } else {
        // Send regular quotation notification
        const notificationPayload = {
          type: 'QUOTATION_CREATED',
          timestamp: new Date().toISOString(),
          quotationId: quotation.id,
          clientName: quotation.clientName,
          insuredArea: quotation.insuredArea,
          insuredAmount: quotation.insuredAmount,
          crop: quotation.crop.name,
          state: quotation.state.name,
          text: `📋 Se ha registrado una solicitud de cotización: ${quotation.clientName} - ${quotation.insuredArea.toFixed(2)} hectáreas`,
          message: `📋 Se ha registrado una solicitud de cotización: ${quotation.clientName} - ${quotation.insuredArea.toFixed(2)} hectáreas`
        };

        // Publish to exchange
        this.channel.publish(
          this.EXCHANGE_NAME,
          this.ROUTING_KEY,
          Buffer.from(JSON.stringify(notificationPayload))
        );

        console.log('📋 Quotation notification sent:', notificationPayload.message);

        // Send to WebSocket clients
        this.broadcastToWebSocket(notificationPayload);
      }

    } catch (error) {
      console.error('❌ Failed to send quotation alert:', error);
    }
  }

  private broadcastToWebSocket(payload: any) {
    if (!this.wss) return;

    const message = JSON.stringify(payload);
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
        } catch (error) {
          console.error('❌ Failed to send WebSocket message:', error);
        }
      }
    });
  }

  async startConsumer() {
    try {
      if (!this.channel) {
        console.error('❌ RabbitMQ channel not available');
        return;
      }

      console.log('🔄 Starting RabbitMQ consumer...');

      await this.channel.consume(
        this.QUEUE_NAME,
        (msg) => {
          if (msg) {
            try {
              const content = msg.content.toString();
              const payload = JSON.parse(content);
              

              // Process the message (you can add custom logic here)
              this.processAlertMessage(payload);

              // Acknowledge the message
              this.channel?.ack(msg);
            } catch (error) {
              console.error('❌ Error processing message:', error);
              // Reject the message
              this.channel?.nack(msg, false, false);
            }
          }
        },
        { noAck: false }
      );

      console.log('✅ RabbitMQ consumer started');

    } catch (error) {
      console.error('❌ Failed to start consumer:', error);
    }
  }

  private processAlertMessage(payload: any) {
    // Add your custom alert processing logic here
    switch (payload.type) {
      case 'HIGH_AREA_ALERT':
        console.log('🚨 Processing high area alert for:', payload.clientName);
        // You could send emails, SMS, etc. here
        break;
      case 'QUOTATION_CREATED':
        console.log('📋 Processing quotation notification for:', payload.clientName);
        break;
      default:
        console.log('❓ Unknown message type:', payload.type);
    }
  }

  private async reconnect() {
    console.log('🔄 Attempting to reconnect to RabbitMQ in 5 seconds...');
    setTimeout(async () => {
      try {
        await this.initialize();
        await this.startConsumer();
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
        this.reconnect();
      }
    }, 5000);
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        console.log('✅ RabbitMQ channel closed');
      }
      if (this.connection) {
        // Use any type to avoid type conflicts
        await (this.connection as any).close();
        console.log('✅ RabbitMQ connection closed');
      }
      if (this.wss) {
        this.wss.close();
        console.log('✅ WebSocket server closed');
      }
    } catch (error) {
      console.error('❌ Error closing RabbitMQ service:', error);
    }
  }
}

export const rabbitMQService = new RabbitMQService();
