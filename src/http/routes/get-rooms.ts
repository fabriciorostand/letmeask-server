import { count, eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    try {
      const results = await db
        .select({
          id: schema.rooms.id,
          name: schema.rooms.name,
          createdAt: schema.rooms.created_at,
          questionsCount: count(schema.questions.id).as('questionsCount'),
        })
        .from(schema.rooms)
        .leftJoin(
          schema.questions,
          eq(schema.questions.room_id, schema.rooms.id)
        )
        .groupBy(schema.rooms.id, schema.rooms.name, schema.rooms.created_at)
        .orderBy(schema.rooms.created_at);

      return results.map((room) => ({
        ...room,
        questionsCount: Number(room.questionsCount),
      }));
    } catch (error) {
      console.error('Erro na rota /rooms:', error);
      throw error;
    }
  });
};