'use client'

import { Header } from '@/components/Header'
import { DashboardTabs } from '@/components/DashboardTabs'
import { useQuery } from '@tanstack/react-query'
import { InstructionSection } from '@/components/InstructionSection'
import { UserInfoSection } from '@/components/UserInfoSection'
import { FeaturedBundle } from '@/components/FeaturedBundle'
import { DailyOffers } from '@/components/DailyOffers'
import { AccessoryStore } from '@/components/AccessoryStore'
import { NightMarket } from '@/components/NightMarket'
import { WeaponLoadout } from '@/components/WeaponLoadout'
import { OwnedSkinsGrid } from '@/components/OwnedSkinsGrid'
import { SkinSelector } from '@/components/SkinSelector'
import { PlayerCardSelector } from '@/components/PlayerCardSelector'
import { MatchHistory } from '@/components/MatchHistory'
import { VirtualWeaponLoadout } from '@/components/VirtualWeaponLoadout'
import { VirtualSkinSelector } from '@/components/VirtualSkinSelector'
import { VirtualPlayerCardSelector } from '@/components/VirtualPlayerCardSelector'
import { BaseDialog } from '@/components/BaseDialog'
import * as storage from '@/utils/storage'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function HomePage() {
  const { data: weaponsData, isLoading: isLoadingWeapons } = useQuery({
    queryKey: ['weapons'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/weapons')
      const json = await res.json()
      return json.data
    }
  })

  const { data: skinPricesData } = useQuery({
    queryKey: ['skinPrices'],
    queryFn: async () => {
      try {
        const res = await fetch('https://vinfo-api.com/json/weaponSkins')
        const json = await res.json()
        const priceMap: Record<string, number> = {}
        if (Array.isArray(json)) {
          json.forEach((skin: any) => {
            if (skin.id && skin.price) {
              const vpPrice = skin.price['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']
              if (typeof vpPrice === 'number') {
                priceMap[skin.id.toLowerCase()] = vpPrice
              }
            }
          })
        }
        return priceMap
      } catch (e) {
        console.error('Failed to fetch weapon skin prices:', e)
        return {}
      }
    }
  })


  const { data: bundlesData, isLoading: isLoadingBundles } = useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/bundles')
      const json = await res.json()
      return json.data
    }
  })

  const { data: playerCardsData } = useQuery({
    queryKey: ['playerCards'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/playercards')
      const json = await res.json()
      return json.data
    }
  })

  const { data: buddiesData } = useQuery({
    queryKey: ['buddies'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/buddies')
      const json = await res.json()
      return json.data
    }
  })

  const { data: spraysData } = useQuery({
    queryKey: ['sprays'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/sprays')
      const json = await res.json()
      return json.data
    }
  })

  const { data: titlesData } = useQuery({
    queryKey: ['titles'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/playertitles')
      const json = await res.json()
      return json.data
    }
  })

  const { data: mapsData } = useQuery({
    queryKey: ['maps'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/maps')
      const json = await res.json()
      return json.data
    }
  })

  const { data: competitiveTiersData } = useQuery({
    queryKey: ['competitiveTiers'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/competitivetiers')
      const json = await res.json()
      return json.data
    }
  })

  const { data: gameModesData } = useQuery({
    queryKey: ['gameModes'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/gamemodes')
      const json = await res.json()
      return json.data
    }
  })

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
      const json = await res.json()
      return json.data
    }
  })

  const { data: contractsData } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/contracts')
      const json = await res.json()
      return json.data
    }
  })

  const [redirectUrl, setRedirectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const [accounts, setAccounts] = useState<storage.Account[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [reauthAccountId, setReauthAccountId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'store' | 'accessories' | 'nightmarket' | 'collection' | 'history' | 'skins' | 'builder'>('store')
  const [selectedWeaponForModal, setSelectedWeaponForModal] = useState<any>(null)
  const [selectedSkinIdForModal, setSelectedSkinIdForModal] = useState<string | undefined>(undefined)
  const [showPlayerCardModal, setShowPlayerCardModal] = useState(false)

  // Virtual loadout states
  const [virtualLoadout, setVirtualLoadout] = useState<any>(null)
  const [selectedVirtualWeaponForModal, setSelectedVirtualWeaponForModal] = useState<any>(null)
  const [showVirtualPlayerCardModal, setShowVirtualPlayerCardModal] = useState(false)
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false)

  const handleSkinClick = (weapon: any, skinId: string) => {
    setSelectedWeaponForModal(weapon)
    setSelectedSkinIdForModal(skinId)
  }

  // Load virtual loadout from local storage on client side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('valorant_virtual_loadout')
      if (saved) {
        try {
          setVirtualLoadout(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse virtual loadout', e)
        }
      } else {
        const defaultLoadout = {
          Guns: [],
          Identity: {
            PlayerCardID: '9fb348bc-41a1-47ec-a943-43b5088e2db6', // Standard card
            PlayerName: 'VIRTUAL_USER',
            PlayerTag: 'VIRTUAL'
          }
        }
        setVirtualLoadout(defaultLoadout)
        localStorage.setItem('valorant_virtual_loadout', JSON.stringify(defaultLoadout))
      }
    }
  }, [])

  const handleEquipVirtualSkin = (
    skinId: string,
    chromaId: string,
    levelId: string,
    buddyId: string | null,
    buddyLevelId: string | null
  ) => {
    if (!virtualLoadout || !selectedVirtualWeaponForModal) return
    const weaponId = selectedVirtualWeaponForModal.uuid

    const newGuns = [...(virtualLoadout.Guns || [])]
    const existingIdx = newGuns.findIndex((g: any) => g.ID.toLowerCase() === weaponId.toLowerCase())

    const gunData = {
      ID: weaponId,
      SkinID: skinId,
      ChromaID: chromaId,
      LevelID: levelId,
      CharmID: buddyId,
      CharmLevelID: buddyLevelId
    }

    if (existingIdx >= 0) {
      newGuns[existingIdx] = gunData
    } else {
      newGuns.push(gunData)
    }

    const updatedLoadout = {
      ...virtualLoadout,
      Guns: newGuns
    }

    setVirtualLoadout(updatedLoadout)
    localStorage.setItem('valorant_virtual_loadout', JSON.stringify(updatedLoadout))
    toast.success(`Equipped skin for ${selectedVirtualWeaponForModal.displayName} virtually!`)
  }

  const handleEquipVirtualIdentity = (cardId: string, name: string, tag: string) => {
    if (!virtualLoadout) return

    const updatedLoadout = {
      ...virtualLoadout,
      Identity: {
        PlayerCardID: cardId,
        PlayerName: name,
        PlayerTag: tag
      }
    }

    setVirtualLoadout(updatedLoadout)
    localStorage.setItem('valorant_virtual_loadout', JSON.stringify(updatedLoadout))
    toast.success('Equipped player identity virtually!')
  }

  const handleResetVirtualLoadout = () => {
    setShowResetConfirmModal(true)
  }

  const performResetVirtualLoadout = () => {
    const defaultLoadout = {
      Guns: [],
      Identity: {
        PlayerCardID: '9fb348bc-41a1-47ec-a943-43b5088e2db6', // Standard card
        PlayerName: 'VIRTUAL_USER',
        PlayerTag: 'VIRTUAL'
      }
    }
    setVirtualLoadout(defaultLoadout)
    localStorage.setItem('valorant_virtual_loadout', JSON.stringify(defaultLoadout))
    toast.success('Inventory Builder loadout reset to standard default!')
  }

  useEffect(() => {
    async function init() {
      const loadedAccounts = await storage.getAccounts()
      const activeId = await storage.getActiveAccountId()
      setAccounts(loadedAccounts)

      if (activeId) {
        let active = loadedAccounts.find(a => a.id === activeId)
        if (active) {
          setActiveAccountId(activeId)
          if (active.data && !active.data.store) {
            setLoading(true)
            try {
              const full = await storage.getAccount(activeId)
              setResult(full.data)
              setAccounts(prev => prev.map(a => a.id === activeId ? full : a))
            } catch (err: any) {
              if (err.status === 401) {
                toast.error('Session expired. Please re-authenticate.')
                setReauthAccountId(activeId)
                setShowAddForm(true)
              } else {
                setError(err.message)
              }
            } finally {
              setLoading(false)
            }
          } else {
            setResult(active.data)
          }
        } else {
          setShowAddForm(true)
        }
      } else if (loadedAccounts.length === 0) {
        setShowAddForm(true)
      } else {
        const first = loadedAccounts[0]
        setActiveAccountId(first.id)
        if (first.data && !first.data.store) {
          setLoading(true)
          try {
            const full = await storage.getAccount(first.id)
            setResult(full.data)
            setAccounts(prev => prev.map(a => a.id === first.id ? full : a))
          } catch (err: any) {
            if (err.status === 401) {
              toast.error('Session expired. Please re-authenticate.')
              setReauthAccountId(first.id)
              setShowAddForm(true)
            } else {
              setError(err.message)
            }
          } finally {
            setLoading(false)
          }
        } else {
          setResult(first.data)
        }
        await storage.setActiveAccountId(first.id)
      }
    }
    init()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setResult((prev: any) => {
        if (!prev || !prev.store) return prev
        const next = JSON.parse(JSON.stringify(prev))
        if (next.store?.SkinsPanelLayout?.SingleItemOffersRemainingDurationInSeconds > 0) {
          next.store.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds -= 1
        }
        if (next.store?.FeaturedBundle?.Bundles) {
          next.store.FeaturedBundle.Bundles.forEach((b: any) => {
            if (b.DurationRemainingInSeconds > 0) {
              b.DurationRemainingInSeconds -= 1
            }
          })
        }
        if (next.store?.BonusStore?.BonusStoreRemainingDurationInSeconds > 0) {
          next.store.BonusStore.BonusStoreRemainingDurationInSeconds -= 1
        }
        const accStorePaths = [next.store?.AccessoryStorePanel, next.store?.AccessoryStore]
        accStorePaths.forEach(obj => {
          if (!obj) return
          for (const k in obj) {
            if (k.toLowerCase().includes('durationinseconds') && typeof obj[k] === 'number' && obj[k] > 0) {
              obj[k] -= 1
            }
          }
        })
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function extractAccessToken(url: string) {
    try {
      const hash = url.split('#')[1]
      if (!hash) throw new Error('Missing URL hash')
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const idToken = params.get('id_token')
      if (!accessToken) throw new Error('Missing access token')
      return { accessToken, idToken }
    } catch (err: any) {
      throw new Error('Invalid redirect URL')
    }
  }

  async function handleGetInfo() {
    try {
      setLoading(true)
      setError('')
      const { accessToken, idToken } = extractAccessToken(redirectUrl)
      const newAccount = await storage.saveAccount(accessToken, idToken || '')

      const updatedAccounts = await storage.getAccounts()
      setAccounts(updatedAccounts)

      if (reauthAccountId) {
        if (newAccount.id !== reauthAccountId) {
          toast.warning(`Re-authenticated with a different account: ${newAccount.name}#${newAccount.tag}`, { duration: 5000 })
        } else {
          toast.success('Account re-authenticated successfully')
        }
      } else {
        toast.success('Account added successfully')
      }

      await storage.setActiveAccountId(newAccount.id)
      setActiveAccountId(newAccount.id)
      setResult(newAccount.data)
      setShowAddForm(false)
      setReauthAccountId(null)
      setRedirectUrl('')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Failed to add account')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectAccount(id: string) {
    const account = accounts.find(a => a.id === id)
    if (account) {
      setActiveAccountId(id)
      if (account.data && !account.data.store) {
        setLoading(true)
        try {
          const full = await storage.getAccount(id)
          setResult(full.data)
          setAccounts(prev => prev.map(a => a.id === id ? full : a))
        } catch (err: any) {
          if (err.status === 401) {
            toast.error('Session expired. Please re-authenticate.')
            setReauthAccountId(id)
            setShowAddForm(true)
          } else {
            setError(err.message)
            toast.error(err.message || 'Failed to load account details')
          }
        } finally {
          setLoading(false)
        }
      } else {
        setResult(account.data)
      }
      await storage.setActiveAccountId(id)
      setShowAddForm(false)
    }
  }

  async function handleDeleteAccount(id: string) {
    try {
      await storage.deleteAccount(id)
      const updated = await storage.getAccounts()
      setAccounts(updated)
      if (activeAccountId === id) {
        if (updated.length > 0) {
          await handleSelectAccount(updated[0].id)
        } else {
          setActiveAccountId(null)
          setResult(null)
          setShowAddForm(true)
        }
      }
      toast.success('Account removed')
    } catch (err: any) {
      toast.error('Failed to remove account')
    }
  }

  async function handleRefresh() {
    if (!activeAccountId) return
    const toastId = toast.loading('Refreshing account data...')
    try {
      setLoading(true)
      const updatedAccount = await storage.refreshAccount(activeAccountId)
      setResult(updatedAccount.data)
      const updatedAccounts = await storage.getAccounts()
      setAccounts(updatedAccounts)
      toast.success('Data updated', { id: toastId })
    } catch (err: any) {
      if (err.status === 401) {
        toast.error('Session expired. Please re-authenticate.', { id: toastId })
        setReauthAccountId(activeAccountId)
        setShowAddForm(true)
      } else {
        setError(err.message)
        toast.error(err.message || 'Refresh failed', { id: toastId })
      }
    } finally {
      setLoading(false)
    }
  }

  const offers = result?.store?.SkinsPanelLayout?.SingleItemOffers || []
  const accessoryOffers =
    result?.store?.AccessoryStorePanel?.AccessoryStoreOffers ||
    result?.store?.AccessoryStorePanel?.Offers ||
    result?.store?.AccessoryStorePanel?.AccessoryStoreItems ||
    result?.store?.AccessoryStore?.AccessoryStoreOffers ||
    []

  const getAccessoryDuration = () => {
    if (!result) return 0
    const accPaths = [result.store?.AccessoryStorePanel, result.store?.AccessoryStore]
    for (const obj of accPaths) {
      if (!obj) continue
      for (const k in obj) {
        if (k.toLowerCase().includes('durationinseconds') && typeof obj[k] === 'number' && obj[k] > 0) {
          return obj[k]
        }
      }
    }
    return 0
  }

  const showNightMarket = !!result?.store?.BonusStore

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSelect={handleSelectAccount}
        onDelete={handleDeleteAccount}
        onAdd={() => {
          setReauthAccountId(null)
          setShowAddForm(true)
        }}
        playerCardsData={playerCardsData}
      />

      {result && (
        <>
          <UserInfoSection
            result={result}
            playerCardsData={playerCardsData}
            titlesData={titlesData}
            onRefresh={handleRefresh}
            loading={loading}
            onPlayerCardClick={() => setShowPlayerCardModal(true)}
          />
          <DashboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showNightMarket={showNightMarket}
          />
        </>
      )}

      <main
        className="flex-1 px-4 py-8 mt-38 relative overflow-hidden bg-cover bg-center bg-no-repeat min-h-[calc(100vh-152px)]"
        style={{ backgroundImage: "url('https://pbs.twimg.com/media/FfM55w5WIAAxH06?format=jpg&name=large')" }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-none" />
        <div className="max-w-[1480px] mx-auto relative z-10">
          {showAddForm && (
            <InstructionSection
              redirectUrl={redirectUrl}
              setRedirectUrl={setRedirectUrl}
              handleGetInfo={handleGetInfo}
              loading={loading}
              error={error}
              onClose={() => {
                setShowAddForm(false)
                setReauthAccountId(null)
                setRedirectUrl('')
                setError('')
              }}
              title={reauthAccountId ? "Re-authenticate Account" : "Add Valorant Account"}
              submitText={reauthAccountId ? "Re-authenticate" : "Add Account"}
              reauthAccountName={reauthAccountId ? (() => {
                const acc = accounts.find(a => a.id === reauthAccountId)
                return acc ? `${acc.name}#${acc.tag}` : undefined
              })() : undefined}
            />
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className={`mt-8 ${activeTab === 'collection' ? 'lg:mt-2' : ''}`}>
                {activeTab === 'store' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    <FeaturedBundle
                      bundles={result.store?.FeaturedBundle?.Bundles}
                      bundlesData={bundlesData}
                      isLoadingBundles={isLoadingBundles}
                      weaponsData={weaponsData}
                      onSkinClick={handleSkinClick}
                    />
                    <DailyOffers
                      offers={offers}
                      weaponsData={weaponsData}
                      isLoadingWeapons={isLoadingWeapons}
                      remainingDuration={result.store?.SkinsPanelLayout?.SingleItemOffersRemainingDurationInSeconds || 0}
                      storeOffers={result.store?.SkinsPanelLayout?.SingleItemStoreOffers}
                      onSkinClick={handleSkinClick}
                    />
                  </div>
                )}

                {activeTab === 'accessories' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <AccessoryStore
                      accessoryOffers={accessoryOffers}
                      playerCardsData={playerCardsData}
                      buddiesData={buddiesData}
                      spraysData={spraysData}
                      titlesData={titlesData}
                      remainingDuration={getAccessoryDuration()}
                    />
                  </div>
                )}

                {activeTab === 'nightmarket' && showNightMarket && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <NightMarket
                      bonusStore={result.store?.BonusStore}
                      weaponsData={weaponsData}
                      onSkinClick={handleSkinClick}
                    />
                  </div>
                )}

                {activeTab === 'collection' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <WeaponLoadout
                      loadout={result.loadout}
                      weaponsData={weaponsData}
                      buddiesData={buddiesData}
                      playerCardsData={playerCardsData}
                      user={result.user}
                      ownedSkins={result.ownedSkins}
                      contractsData={contractsData}
                      onWeaponClick={(weapon) => {
                        setSelectedWeaponForModal(weapon)
                        setSelectedSkinIdForModal(undefined)
                      }}
                      onPlayerCardClick={() => setShowPlayerCardModal(true)}
                      skinPricesData={skinPricesData}
                    />
                  </div>
                )}
                {activeTab === 'builder' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <VirtualWeaponLoadout
                      loadout={virtualLoadout}
                      weaponsData={weaponsData}
                      buddiesData={buddiesData}
                      playerCardsData={playerCardsData}
                      onWeaponClick={(weapon) => {
                        setSelectedVirtualWeaponForModal(weapon)
                      }}
                      onPlayerCardClick={() => setShowVirtualPlayerCardModal(true)}
                      onReset={handleResetVirtualLoadout}
                      skinPricesData={skinPricesData}
                    />
                  </div>
                )}
                {activeTab === 'skins' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <OwnedSkinsGrid
                      weaponsData={weaponsData}
                      ownedSkins={result.ownedSkins}
                      contractsData={contractsData}
                      onSkinClick={handleSkinClick}
                      skinPricesData={skinPricesData}
                    />
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <MatchHistory
                      puuid={result.puuid}
                      rankData={result.rank}
                      matchHistory={result.matchHistory}
                      competitiveUpdates={result.competitiveUpdates}
                      matchDetails={result.matchDetails}
                      mapsData={mapsData}
                      competitiveTiersData={competitiveTiersData}
                      gameModesData={gameModesData}
                      agentsData={agentsData}
                    />
                  </div>
                )}
              </div>

              {selectedWeaponForModal && (
                <SkinSelector
                  weapon={selectedWeaponForModal}
                  ownedSkins={result.ownedSkins}
                  loadout={result.loadout}
                  onClose={() => {
                    setSelectedWeaponForModal(null)
                    setSelectedSkinIdForModal(undefined)
                  }}
                  initialSkinId={selectedSkinIdForModal}
                />
              )}

              {showPlayerCardModal && playerCardsData && (
                <PlayerCardSelector
                  playerCards={playerCardsData}
                  ownedCards={result.ownedSkins}
                  equippedCardId={result.loadout?.Identity?.PlayerCardID}
                  gameName={result.user?.acct?.game_name}
                  onClose={() => setShowPlayerCardModal(false)}
                />
              )}

              {selectedVirtualWeaponForModal && (
                <VirtualSkinSelector
                  weapon={selectedVirtualWeaponForModal}
                  loadout={virtualLoadout}
                  buddiesData={buddiesData}
                  onClose={() => {
                    setSelectedVirtualWeaponForModal(null)
                  }}
                  onEquip={handleEquipVirtualSkin}
                />
              )}

              {showVirtualPlayerCardModal && playerCardsData && (
                <VirtualPlayerCardSelector
                  playerCards={playerCardsData}
                  equippedCardId={virtualLoadout?.Identity?.PlayerCardID}
                  initialName={virtualLoadout?.Identity?.PlayerName}
                  initialTag={virtualLoadout?.Identity?.PlayerTag}
                  onClose={() => setShowVirtualPlayerCardModal(false)}
                  onEquip={handleEquipVirtualIdentity}
                />
              )}

              <BaseDialog
                isOpen={showResetConfirmModal}
                onClose={() => setShowResetConfirmModal(false)}
                title="Reset Inventory Builder Loadout"
                description="Confirm Action"
                maxWidth="md"
              >
                <div className="p-6 md:p-8 flex flex-col items-center gap-5 bg-[#0f1923]">
                  <div className="w-12 h-12 rounded-full border border-[#FF4655]/20 bg-[#FF4655]/10 flex items-center justify-center text-[#FF4655]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="m15 9-6 6" /><path d="m9 9 6 6" /><rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    </svg>
                  </div>
                  <p className="text-zinc-300 text-xs font-bold text-center uppercase tracking-wider leading-relaxed max-w-sm">
                    Are you sure you want to reset your inventory builder loadout? This will revert all weapons, skins, buddies, player card and custom name/tag back to defaults.
                  </p>
                  <div className="w-full h-px bg-zinc-800 my-2" />
                  <div className="flex gap-3 w-full max-w-xs justify-center">
                    <button
                      onClick={() => setShowResetConfirmModal(false)}
                      className="flex-1 py-2 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:border-zinc-700 hover:text-white transition-all rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        performResetVirtualLoadout()
                        setShowResetConfirmModal(false)
                      }}
                      className="flex-1 py-2 bg-[#FF4655] hover:bg-[#ff5865] active:scale-95 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded shadow-lg shadow-[#FF4655]/20"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </BaseDialog>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
