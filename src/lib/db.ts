import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, inArray, desc, asc, like, or, sql, gte, lte } from 'drizzle-orm';
import * as schema from './schema';
import { valorantAccounts, userPreferences, shopListings } from './schema';
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

export interface GetListingsOptions {
  page: number;
  limit: number;
  search?: string;
  region?: string;
  rank?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  skins?: string[];
}

function extractAccountLevel(data: any): number {
  if (data?.accountXP?.Progress?.Level) {
    return data.accountXP.Progress.Level;
  }
  const puuid = data?.puuid;
  if (puuid && Array.isArray(data.matchDetails)) {
    for (const match of data.matchDetails) {
      if (match && Array.isArray(match.players)) {
        const me = match.players.find((p: any) => p.subject === puuid);
        if (me && typeof me.accountLevel === 'number') {
          return me.accountLevel;
        }
      }
    }
  }
  return 0;
}

export async function getListings(options: GetListingsOptions) {
  try {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, options.limit);
    const offset = (page - 1) * limit;

    const conditions = [eq(shopListings.status, 'active')];

    if (options.search) {
      const searchCond = or(
        like(valorantAccounts.name, `%${options.search}%`),
        like(valorantAccounts.tag, `%${options.search}%`)
      );
      if (searchCond) {
        conditions.push(searchCond);
      }
    }

    if (options.region) {
      conditions.push(
        eq(sql`${valorantAccounts.data}->>'affinity'`, options.region.toLowerCase())
      );
    }

    if (options.rank !== undefined) {
      conditions.push(
        eq(
          sql`(${valorantAccounts.data}->'rank'->'LatestCompetitiveUpdate'->>'TierAfterUpdate')::integer`,
          options.rank
        )
      );
    }

    if (options.skins && options.skins.length > 0) {
      conditions.push(
        sql`${valorantAccounts.data}->'ownedSkins' ?| ${options.skins}`
      );
    }

    if (options.minPrice !== undefined) {
      conditions.push(gte(shopListings.price, options.minPrice));
    }

    if (options.maxPrice !== undefined) {
      conditions.push(lte(shopListings.price, options.maxPrice));
    }

    const whereClause = and(...conditions);

    // Sorting
    let orderByClause = desc(shopListings.createdAt);
    if (options.sortBy === 'price_asc') {
      orderByClause = asc(shopListings.price);
    } else if (options.sortBy === 'price_desc') {
      orderByClause = desc(shopListings.price);
    }

    // Run both queries in parallel
    const [listingsRaw, countResult] = await Promise.all([
      db
        .select({
          id: shopListings.id,
          accountId: shopListings.accountId,
          sellerId: shopListings.sellerId,
          price: shopListings.price,
          description: shopListings.description,
          contactInfo: shopListings.contactInfo,
          status: shopListings.status,
          createdAt: shopListings.createdAt,
          accountName: valorantAccounts.name,
          accountTag: valorantAccounts.tag,
          accountData: valorantAccounts.data,
        })
        .from(shopListings)
        .innerJoin(valorantAccounts, eq(shopListings.accountId, valorantAccounts.id))
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(shopListings)
        .innerJoin(valorantAccounts, eq(shopListings.accountId, valorantAccounts.id))
        .where(whereClause)
    ]);

    const total = Number(countResult[0]?.count || 0);

    const listings = listingsRaw.map(row => {
      // Summarize account data for security (no tokens)
      const data = row.accountData as any;
      const summaryData = data ? {
        affinity: data.affinity,
        puuid: data.puuid,
        user: {
          acct: {
            game_name: data.user?.acct?.game_name,
            tag_line: data.user?.acct?.tag_line,
          }
        },
        wallet: data.wallet,
        loadout: {
          Identity: data.loadout?.Identity,
        },
        rank: data.rank ? {
          LatestCompetitiveUpdate: data.rank.LatestCompetitiveUpdate,
        } : null,
        ownedSkins: data.ownedSkins || [],
        accountLevel: extractAccountLevel(data),
        accountXP: data.accountXP || null,
        ownedSkinsCount: Array.isArray(data.ownedSkins) ? data.ownedSkins.length : 0,
      } : null;

      return {
        id: row.id,
        accountId: row.accountId,
        sellerId: row.sellerId,
        price: Number(row.price),
        description: row.description,
        contactInfo: row.contactInfo,
        status: row.status,
        createdAt: Number(row.createdAt),
        account: {
          name: row.accountName,
          tag: row.accountTag,
          data: summaryData,
        }
      };
    });

    return {
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (err) {
    console.error('Postgres getListings error:', err);
    return { listings: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getListingById(id: string) {
  try {
    const rows = await db
      .select({
        id: shopListings.id,
        accountId: shopListings.accountId,
        sellerId: shopListings.sellerId,
        price: shopListings.price,
        description: shopListings.description,
        contactInfo: shopListings.contactInfo,
        status: shopListings.status,
        createdAt: shopListings.createdAt,
        accountName: valorantAccounts.name,
        accountTag: valorantAccounts.tag,
        accountData: valorantAccounts.data,
      })
      .from(shopListings)
      .innerJoin(valorantAccounts, eq(shopListings.accountId, valorantAccounts.id))
      .where(eq(shopListings.id, id))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];
    const data = row.accountData as any;

    const safeData = data ? {
      affinity: data.affinity,
      puuid: data.puuid,
      version: data.version,
      user: {
        acct: {
          game_name: data.user?.acct?.game_name,
          tag_line: data.user?.acct?.tag_line,
        }
      },
      wallet: data.wallet,
      ownedSkins: data.ownedSkins,
      loadout: data.loadout,
      rank: data.rank,
      matchHistory: data.matchHistory,
      competitiveUpdates: data.competitiveUpdates,
      matchDetails: data.matchDetails,
      accountLevel: extractAccountLevel(data),
      accountXP: data.accountXP || null,
    } : null;

    return {
      id: row.id,
      accountId: row.accountId,
      sellerId: row.sellerId,
      price: Number(row.price),
      description: row.description,
      contactInfo: row.contactInfo,
      status: row.status,
      createdAt: Number(row.createdAt),
      account: {
        name: row.accountName,
        tag: row.accountTag,
        data: safeData,
      }
    };
  } catch (err) {
    console.error('Postgres getListingById error:', err);
    return null;
  }
}

export async function getListingByAccountId(accountId: string) {
  try {
    const rows = await db
      .select()
      .from(shopListings)
      .where(eq(shopListings.accountId, accountId))
      .limit(1);
    
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      accountId: r.accountId,
      sellerId: r.sellerId,
      price: Number(r.price),
      description: r.description,
      contactInfo: r.contactInfo,
      status: r.status,
      createdAt: Number(r.createdAt),
    };
  } catch (err) {
    console.error('Postgres getListingByAccountId error:', err);
    return null;
  }
}

export async function createListing(listing: {
  id: string;
  accountId: string;
  sellerId: string;
  price: number;
  description?: string;
  contactInfo: string;
}) {
  try {
    await db.insert(shopListings).values({
      id: listing.id,
      accountId: listing.accountId,
      sellerId: listing.sellerId,
      price: listing.price,
      description: listing.description || null,
      contactInfo: listing.contactInfo,
      status: 'active',
      createdAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.error('Postgres createListing error:', err);
    return false;
  }
}

export async function updateListingStatus(id: string, sellerId: string, status: string) {
  try {
    await db
      .update(shopListings)
      .set({ status })
      .where(and(eq(shopListings.id, id), eq(shopListings.sellerId, sellerId)));
    return true;
  } catch (err) {
    console.error('Postgres updateListingStatus error:', err);
    return false;
  }
}

export async function deleteListing(id: string, sellerId: string) {
  try {
    await db
      .delete(shopListings)
      .where(and(eq(shopListings.id, id), eq(shopListings.sellerId, sellerId)));
    return true;
  } catch (err) {
    console.error('Postgres deleteListing error:', err);
    return false;
  }
}

