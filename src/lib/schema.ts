import { pgTable, text, bigint, jsonb, index } from 'drizzle-orm/pg-core';

export const valorantAccounts = pgTable('valorant_accounts', {
  id: text('id').primaryKey(), // puuid
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  tag: text('tag').notNull(),
  accessToken: text('access_token').notNull(),
  idToken: text('id_token').notNull(),
  lastUpdated: bigint('last_updated', { mode: 'number' }).notNull(),
  data: jsonb('data').notNull(),
}, (table) => [
  index('idx_user_id').on(table.userId),
]);

export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id').primaryKey(),
  activeAccountId: text('active_account_id').references(() => valorantAccounts.id, { onDelete: 'set null' }),
});

export const shopListings = pgTable('shop_listings', {
  id: text('id').primaryKey(),
  accountId: text('account_id').references(() => valorantAccounts.id, { onDelete: 'cascade' }).notNull(),
  sellerId: text('seller_id').notNull(),
  price: bigint('price', { mode: 'number' }).notNull(),
  description: text('description'),
  contactInfo: text('contact_info').notNull(),
  status: text('status').notNull().default('active'), // 'active', 'sold', 'cancelled'
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
}, (table) => [
  index('idx_listing_seller_id').on(table.sellerId),
  index('idx_listing_status').on(table.status),
]);

