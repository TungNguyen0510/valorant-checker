import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from './schema';
import { valorantAccounts, userPreferences } from './schema';
import { Account } from '@/utils/storage';

// Create persistent connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });

export interface ServerAccount extends Account {
  accessToken: string;
  idToken: string;
}

export async function getAccounts(userId: string): Promise<ServerAccount[]> {
  try {
    const rows = await db
      .select()
      .from(valorantAccounts)
      .where(eq(valorantAccounts.userId, userId));
    
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      tag: r.tag,
      lastUpdated: Number(r.lastUpdated),
      accessToken: r.accessToken,
      idToken: r.idToken,
      data: r.data,
    }));
  } catch (err) {
    console.error('Postgres getAccounts error:', err);
    return [];
  }
}

export async function saveAccounts(userId: string, accounts: ServerAccount[]) {
  try {
    await db.transaction(async (tx) => {
      // 1. Fetch existing accounts for comparison
      const existing = await tx
        .select({ id: valorantAccounts.id })
        .from(valorantAccounts)
        .where(eq(valorantAccounts.userId, userId));
      
      const existingIds = existing.map((e) => e.id);
      const newIds = accounts.map((a) => a.id);
      
      // 2. Delete any accounts that were removed in the request
      const idsToDelete = existingIds.filter((id) => !newIds.includes(id));
      if (idsToDelete.length > 0) {
        await tx
          .delete(valorantAccounts)
          .where(
            and(
              eq(valorantAccounts.userId, userId),
              inArray(valorantAccounts.id, idsToDelete)
            )
          );
      }

      // 3. Upsert current accounts
      for (const account of accounts) {
        await tx
          .insert(valorantAccounts)
          .values({
            id: account.id,
            userId: userId,
            name: account.name,
            tag: account.tag,
            accessToken: account.accessToken,
            idToken: account.idToken,
            lastUpdated: account.lastUpdated,
            data: account.data,
          })
          .onConflictDoUpdate({
            target: valorantAccounts.id,
            set: {
              name: account.name,
              tag: account.tag,
              accessToken: account.accessToken,
              idToken: account.idToken,
              lastUpdated: account.lastUpdated,
              data: account.data,
            },
          });
      }
    });
  } catch (err) {
    console.error('Postgres saveAccounts error:', err);
  }
}

export async function getActiveAccountId(userId: string): Promise<string | null> {
  try {
    const row = await db
      .select({ activeAccountId: userPreferences.activeAccountId })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    
    return row[0]?.activeAccountId || null;
  } catch (err) {
    console.error('Postgres getActiveAccountId error:', err);
    return null;
  }
}

export async function setActiveAccountId(userId: string, id: string | null) {
  try {
    if (id) {
      await db
        .insert(userPreferences)
        .values({
          userId: userId,
          activeAccountId: id,
        })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: {
            activeAccountId: id,
          },
        });
    } else {
      await db
        .delete(userPreferences)
        .where(eq(userPreferences.userId, userId));
    }
  } catch (err) {
    console.error('Postgres setActiveAccountId error:', err);
  }
}
