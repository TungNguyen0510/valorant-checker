const CLIENT_PLATFORM = Buffer.from(
  JSON.stringify({
    platformType: 'PC',
    platformOS: 'Windows',
    platformOSVersion: '10.0.19045.1.256.64bit',
    platformChipset: 'Unknown',
  })
).toString('base64')

let cachedVersion = ''

async function getValorantVersion() {
  if (cachedVersion && process.env.NODE_ENV === 'production') return cachedVersion
  const resp = await fetch('https://valorant-api.com/v1/version', { 
    next: process.env.NODE_ENV === 'production' ? { revalidate: 3600 } : { revalidate: 0 } 
  })
  if (!resp.ok) throw new Error('Failed to fetch Valorant version')
  const json = await resp.json()
  cachedVersion = json.data.riotClientVersion
  return cachedVersion
}

async function getUser(accessToken: string) {
  const resp = await fetch('https://auth.riotgames.com/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to fetch user info: ${resp.status} ${text}`);
  }
  return resp.json()
}

async function getEntitlements(accessToken: string) {
  const resp = await fetch('https://entitlements.auth.riotgames.com/api/token/v1', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    cache: 'no-store',
  })
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to fetch entitlements: ${resp.status} ${text}`);
  }
  const json = await resp.json()
  return json.entitlements_token
}

async function getAffinity(accessToken: string, idToken: string) {
  const resp = await fetch('https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
    cache: 'no-store',
  })
  const text = await resp.text()
  let json: any = {}
  try { json = JSON.parse(text) } catch { }
  const affinity = json?.affinities?.live
  if (!affinity) throw new Error(`Failed to get affinity: ${text}`)
  return affinity
}

async function fetchStorefront(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  try {
    const resp = await fetch(`https://pd.${affinity}.a.pvp.net/store/v3/storefront/${puuid}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Riot-Entitlements-JWT': entitlements,
        'X-Riot-ClientPlatform': CLIENT_PLATFORM,
        'X-Riot-ClientVersion': version,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    })
    const text = await resp.text()
    let data: any = text
    try { data = JSON.parse(text) } catch { }
    return { ok: resp.ok, status: resp.status, data }
  } catch (err: any) {
    return { ok: false, status: 500, data: { error: err.message } }
  }
}

async function fetchWallet(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/store/v1/wallet/${puuid}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: 'no-store',
  })
  return resp.ok ? resp.json() : null
}

async function fetchEntitlements(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/store/v1/entitlements/${puuid}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: 'no-store',
  })
  return resp.ok ? resp.json() : null
}

async function fetchPlayerLoadout(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/personalization/v2/players/${puuid}/playerloadout`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: 'no-store',
  })
  return resp.ok ? resp.json() : null
}

async function fetchRank(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/mmr/v1/players/${puuid}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: 'no-store',
  })
  return resp.ok ? resp.json() : null
}

async function fetchMatchHistory(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/match-history/v1/history/${puuid}?startIndex=0&endIndex=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: 'no-store',
  })
  return resp.ok ? resp.json() : null
}

async function fetchCompetitiveUpdates(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/mmr/v1/players/${puuid}/competitiveupdates?startIndex=0&endIndex=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: 'no-store',
  })
  return resp.ok ? resp.json() : null
}

async function fetchAccountXP(puuid: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/account-xp/v1/players/${puuid}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: 'no-store',
  })
  return resp.ok ? resp.json() : null
}

async function fetchMatchDetails(matchId: string, accessToken: string, entitlements: string, version: string, affinity: string) {
  const resp = await fetch(`https://pd.${affinity}.a.pvp.net/match-details/v1/matches/${matchId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlements,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version,
    },
    cache: process.env.NODE_ENV === 'production' ? 'force-cache' : 'no-store',
  })
  return resp.ok ? resp.json() : null
}

export async function getValorantData(accessToken: string, idToken: string) {
  const [user, entitlements, version] = await Promise.all([
    getUser(accessToken),
    getEntitlements(accessToken),
    getValorantVersion(),
  ])

  const puuid = user.sub
  let affinity = ''
  try {
    affinity = await getAffinity(accessToken, idToken)
    const regionMap: Record<string, string> = {
      'vn': 'ap', 'th': 'ap', 'ph': 'ap', 'my': 'ap', 'sg': 'ap', 'tw': 'ap', 'jp': 'ap', 'id': 'ap',
      'kr': 'kr',
      'eu': 'eu', 'tr': 'eu', 'ru': 'eu',
      'na': 'na', 'us': 'na', 'ca': 'na',
      'br': 'br',
      'latam': 'latam', 'mx': 'latam', 'cl': 'latam', 'ar': 'latam',
    }
    affinity = regionMap[affinity.toLowerCase()] || affinity
  } catch (err: any) {
    console.warn('Failed to get affinity from Riot Geo API:', err.message);
  }

  let storefront = await fetchStorefront(puuid, accessToken, entitlements, version, affinity)

  if (!storefront.ok) {
    console.warn(`Failed to fetch storefront for affinity ${affinity}, status: ${storefront.status}. Trying other regions...`);
    for (const region of ['ap', 'eu', 'na', 'kr', 'latam', 'br']) {
      if (region === affinity) continue
      const res = await fetchStorefront(puuid, accessToken, entitlements, version, region)
      if (res.ok) {
        console.info(`Found working region: ${region}`);
        affinity = region
        storefront = res
        break
      }
    }
  }

  if (!storefront.ok) {
    console.error('All regions failed for storefront fetch. Last error data:', storefront.data);
    throw new Error(`Failed to fetch storefront: ${storefront.status} ${JSON.stringify(storefront.data)}`)
  }

  const [wallet, entitlementsRes, loadout, rank, matchHistory, competitiveUpdates, accountXP] = await Promise.all([
    fetchWallet(puuid, accessToken, entitlements, version, affinity),
    fetchEntitlements(puuid, accessToken, entitlements, version, affinity),
    fetchPlayerLoadout(puuid, accessToken, entitlements, version, affinity),
    fetchRank(puuid, accessToken, entitlements, version, affinity),
    fetchMatchHistory(puuid, accessToken, entitlements, version, affinity),
    fetchCompetitiveUpdates(puuid, accessToken, entitlements, version, affinity),
    fetchAccountXP(puuid, accessToken, entitlements, version, affinity).catch(() => null),
  ])

  // Fetch match details for the last 30 matches
  const matchDetails = await Promise.all(
    (matchHistory?.History || []).map((m: any) =>
      fetchMatchDetails(m.MatchID, accessToken, entitlements, version, affinity)
    )
  )

  let ownedSkins: string[] = []
  if (entitlementsRes?.EntitlementsByTypes) {
    ownedSkins = entitlementsRes.EntitlementsByTypes.flatMap((type: any) =>
      type.Entitlements.map((item: any) => item.ItemID)
    )
  }

  return {
    affinity,
    puuid,
    version,
    user,
    store: storefront.data,
    wallet,
    ownedSkins,
    loadout,
    rank,
    matchHistory,
    competitiveUpdates,
    matchDetails,
    accountXP,
  }
}
