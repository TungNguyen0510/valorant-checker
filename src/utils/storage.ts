export interface Account {
  id: string; // puuid
  name: string; // game_name
  tag: string; // tag_line
  lastUpdated: number;
  data: any; // Entire JSON result from /api/info
}

export async function getAccounts(): Promise<Account[]> {
  try {
    const res = await fetch(`/api/accounts?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('getAccounts error:', err);
    return [];
  }
}

export async function getAccount(id: string): Promise<Account> {
  const res = await fetch(`/api/accounts/${id}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.error || 'Failed to fetch account');
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export async function saveAccount(accessToken: string, idToken: string): Promise<Account> {
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, idToken }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.error || 'Failed to save account');
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export async function refreshAccount(id: string): Promise<Account> {
  const res = await fetch(`/api/accounts/${id}/refresh`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.error || 'Failed to refresh account');
    (error as any).status = res.status;
    throw error;
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
    const res = await fetch(`/api/accounts/active?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
      },
    });
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


