import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const games = pgTable('games', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const prompts = pgTable('prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  text: text('text').notNull(),
  correctAnswer: text('correct_answer').notNull(), // 'truth' or 'lie'
  order: integer('order').notNull(),
  timeLimit: integer('time_limit').default(15).notNull(), // seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});