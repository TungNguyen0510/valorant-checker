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
import { SkinSelector } from '@/components/SkinSelector'
import { MatchHistory } from '@/components/MatchHistory'
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

  const [redirectUrl, setRedirectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const [accounts, setAccounts] = useState<storage.Account[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'store' | 'accessories' | 'nightmarket' | 'collection' | 'history'>('store')
  const [selectedWeaponForModal, setSelectedWeaponForModal] = useState<any>(null)
  const [selectedSkinIdForModal, setSelectedSkinIdForModal] = useState<string | undefined>(undefined)

  const handleSkinClick = (weapon: any, skinId: string) => {
    setSelectedWeaponForModal(weapon)
    setSelectedSkinIdForModal(skinId)
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
                toast.error('Session expired, removing account...')
                await handleDeleteAccount(activeId)
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
              toast.error('Session expired, removing account...')
              await handleDeleteAccount(first.id)
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
      await storage.setActiveAccountId(newAccount.id)
      const updatedAccounts = await storage.getAccounts()
      setAccounts(updatedAccounts)
      setActiveAccountId(newAccount.id)
      setResult(newAccount.data)
      setShowAddForm(false)
      setRedirectUrl('')
      toast.success('Account added successfully')
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
            toast.error('Session expired, removing account...')
            await handleDeleteAccount(id)
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
        toast.error('Session expired, removing account...', { id: toastId })
        await handleDeleteAccount(activeAccountId)
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
    <div className="min-h-screen bg-black text-white flex flex-col pb-2">
      <Header
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSelect={handleSelectAccount}
        onDelete={handleDeleteAccount}
        onAdd={() => setShowAddForm(true)}
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
          />
          <DashboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showNightMarket={showNightMarket}
          />
        </>
      )}

      <main className="flex-1 px-2 mt-38">
        <div className="max-w-7xl mx-auto">
          {showAddForm && (
            <InstructionSection
              redirectUrl={redirectUrl}
              setRedirectUrl={setRedirectUrl}
              handleGetInfo={handleGetInfo}
              loading={loading}
              error={error}
              onClose={() => setShowAddForm(false)}
            />
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mt-8">
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
                      onWeaponClick={(weapon) => {
                        setSelectedWeaponForModal(weapon)
                        setSelectedSkinIdForModal(undefined)
                      }}
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
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
