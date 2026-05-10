export interface Account {
  id: string; // puuid
  name: string; // game_name
  tag: string; // tag_line
  lastUpdated: number;
  data: any; // Entire JSON result from /api/info
}

export async function getAccounts(): Promise<Account[]> {
  try {
    const res = await fetch('/api/accounts');
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('getAccounts error:', err);
    return [];
  }
}

export async function saveAccount(accessToken: string, idToken: string): Promise<Account> {
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, idToken }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save account');
  }
  return res.json();
}

export async function refreshAccount(id: string): Promise<Account> {
  const res = await fetch(`/api/accounts/${id}/refresh`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to refresh account');
  }
  return res.json();
}

export async function deleteAccount(id: string) {
  try {
    await fetch(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('deleteAccount error:', err);
  }
}

export async function getActiveAccountId(): Promise<string | null> {
  try {
    const res = await fetch('/api/accounts/active');
    if (!res.ok) return null;
    const data = await res.json();
    return data.id;
  } catch (err) {
    console.error('getActiveAccountId error:', err);
    return null;
  }
}

export async function setActiveAccountId(id: string | null) {
  try {
    await fetch('/api/accounts/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch (err) {
    console.error('setActiveAccountId error:', err);
  }
}


