import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/lib/hash.js';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const userEmail = 'user@example.com';

  const adminPwd = await hashPassword('Admin1234!');
  const userPwd = await hashPassword('User1234!');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      role: Role.ADMIN,
    },
  });

  // Create admin password
  await prisma.userPassword.upsert({
    where: { userId: adminUser.id },
    update: { password: adminPwd },
    create: {
      password: adminPwd,
      userId: adminUser.id,
    },
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      role: Role.USER,
    },
  });

  // Create regular user password
  await prisma.userPassword.upsert({
    where: { userId: regularUser.id },
    update: { password: userPwd },
    create: {
      password: userPwd,
      userId: regularUser.id,
    },
  });

  console.log('Seed listo: admin=admin@example.com / user=user@example.com');
  const crops = [
    { name: 'Maíz' },
    { name: 'Trigo' },
    { name: 'Sorgo' },
    { name: 'Cebada' },
    { name: 'Arroz' },
  ];

  for (const crop of crops) {
    await prisma.crop.upsert({
      where: { name: crop.name },
      update: {},
      create: crop,
    });
  }

  // Semillas para estados
  const states = [
    { name: 'Aguascalientes' },
    { name: 'Baja California' },
    { name: 'Baja California Sur' },
    { name: 'Campeche' },
    { name: 'Chiapas' },
    { name: 'Chihuahua' },
    { name: 'Ciudad de México' },
    { name: 'Coahuila' },
    { name: 'Colima' },
    { name: 'Durango' },
    { name: 'Estado de México' },
    { name: 'Guanajuato' },
    { name: 'Guerrero' },
    { name: 'Hidalgo' },
    { name: 'Jalisco' },
    { name: 'Michoacán' },
    { name: 'Morelos' },
    { name: 'Nayarit' },
    { name: 'Nuevo León' },
    { name: 'Oaxaca' },
    { name: 'Puebla' },
    { name: 'Querétaro' },
    { name: 'Quintana Roo' },
    { name: 'San Luis Potosí' },
    { name: 'Sinaloa' },
    { name: 'Sonora' },
    { name: 'Tabasco' },
    { name: 'Tamaulipas' },
    { name: 'Tlaxcala' },
    { name: 'Veracruz' },
    { name: 'Yucatán' },
    { name: 'Zacatecas' },
  ];

  for (const state of states) {
    await prisma.state.upsert({
      where: { name: state.name },
      update: {},
      create: state,
    });
  }

  console.log('🌱 Seed completado con cultivos y estados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
