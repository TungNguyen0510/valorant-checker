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
  if (cachedVersion) return cachedVersion
  const resp = await fetch('https://valorant-api.com/v1/version', { next: { revalidate: 3600 } })
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
  if (!resp.ok) throw new Error('Failed to fetch user info')
  return resp.json()
}

async function getEntitlements(accessToken: string) {
  const resp = await fetch('https://entitlements.auth.riotgames.com/api/token/v1', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    cache: 'no-store',
  })
  if (!resp.ok) throw new Error('Failed to fetch entitlements')
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
  try { json = JSON.parse(text) } catch {}
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
    try { data = JSON.parse(text) } catch {}
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

export async function getValorantData(accessToken: string, idToken: string) {
  const [user, entitlements, version] = await Promise.all([
    getUser(accessToken),
    getEntitlements(accessToken),
    getValorantVersion(),
  ])

  const puuid = user.sub
  let affinity = ''
  try { affinity = await getAffinity(accessToken, idToken) } catch {}

  let storefront = await fetchStorefront(puuid, accessToken, entitlements, version, affinity)
  
  if (!storefront.ok) {
    for (const region of ['ap', 'eu', 'na', 'kr']) {
      const res = await fetchStorefront(puuid, accessToken, entitlements, version, region)
      if (res.ok) {
        affinity = region
        storefront = res
        break
      }
    }
  }

  if (!storefront.ok) throw new Error('Failed to fetch storefront')

  const [wallet, entitlementsRes, loadout] = await Promise.all([
    fetchWallet(puuid, accessToken, entitlements, version, affinity),
    fetchEntitlements(puuid, accessToken, entitlements, version, affinity),
    fetchPlayerLoadout(puuid, accessToken, entitlements, version, affinity),
  ])

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
  }
}
