import Fastify from 'fastify';
import 'dotenv/config';
import { prismaPlugin } from './shared/database/prisma.plugin.js';
import { env } from './shared/config/env.js';

const fastify = Fastify({
  logger: true,
});

await fastify.register(prismaPlugin, {
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
});

fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' });
});

fastify.get('/health', async () => {
  await fastify.prisma.$queryRaw`SELECT 1`;
  return { status: 'ok' };
});

fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});