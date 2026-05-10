import { Redis } from '@upstash/redis';
import { Account } from '@/utils/storage';

const redis = Redis.fromEnv();

export interface ServerAccount extends Account {
  accessToken: string;
  idToken: string;
}

const getAccountsKey = (userId: string) => `user:${userId}:accounts`;
const getActiveKey = (userId: string) => `user:${userId}:active_id`;

export async function getAccounts(userId: string): Promise<ServerAccount[]> {
  try {
    const data = await redis.get<ServerAccount[]>(getAccountsKey(userId));
    return data || [];
  } catch (err) {
    console.error('Upstash Redis getAccounts error:', err);
    return [];
  }
}

export async function saveAccounts(userId: string, accounts: ServerAccount[]) {
  try {
    await redis.set(getAccountsKey(userId), accounts);
  } catch (err) {
    console.error('Upstash Redis saveAccounts error:', err);
  }
}

export async function getActiveAccountId(userId: string): Promise<string | null> {
  try {
    return await redis.get<string>(getActiveKey(userId));
  } catch {
    return null;
  }
}

export async function setActiveAccountId(userId: string, id: string | null) {
  try {
    if (id) {
      await redis.set(getActiveKey(userId), id);
    } else {
      await redis.del(getActiveKey(userId));
    }
  } catch (err) {
    console.error('Upstash Redis setActiveAccountId error:', err);
  }
}
