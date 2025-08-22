Levanta PostgreSQL

docker compose up -d

Instala dependencias

npm i

Genera cliente de Prisma y aplica migración

npm run prisma:generate
npm run prisma:migrate

Seed de usuarios (admin y user)

npm run seed

Arranca el server
