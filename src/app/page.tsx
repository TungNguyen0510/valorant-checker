'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InstructionSection } from '@/components/InstructionSection'
import { UserInfoSection } from '@/components/UserInfoSection'
import { FeaturedBundle } from '@/components/FeaturedBundle'
import { DailyOffers } from '@/components/DailyOffers'
import { AccessoryStore } from '@/components/AccessoryStore'
import { NightMarket } from '@/components/NightMarket'
import { WeaponLoadout } from '@/components/WeaponLoadout'
import { SkinSelector } from '@/components/SkinSelector'
import { AccountSwitcher } from '@/components/AccountSwitcher'
import { UserButton } from '@clerk/nextjs'
import * as storage from '@/utils/storage'

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

  const [redirectUrl, setRedirectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const [accounts, setAccounts] = useState<storage.Account[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedWeaponForModal, setSelectedWeaponForModal] = useState<any>(null)
  const [selectedSkinIdForModal, setSelectedSkinIdForModal] = useState<string | undefined>(undefined)

  const handleSkinClick = (weapon: any, skinId: string) => {
    setSelectedWeaponForModal(weapon)
    setSelectedSkinIdForModal(skinId)
  }

  useEffect(() => {
    async function init() {
      // Load from server-side
      const loadedAccounts = await storage.getAccounts()
      const activeId = await storage.getActiveAccountId()
      setAccounts(loadedAccounts)

      if (activeId) {
        const active = loadedAccounts.find(a => a.id === activeId)
        if (active) {
          setActiveAccountId(activeId)
          setResult(active.data)
        } else {
          setShowAddForm(true)
        }
      } else if (loadedAccounts.length === 0) {
        setShowAddForm(true)
      } else {
        setActiveAccountId(loadedAccounts[0].id)
        setResult(loadedAccounts[0].data)
        await storage.setActiveAccountId(loadedAccounts[0].id)
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

        // Accessory Store Timer
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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectAccount(id: string) {
    const account = accounts.find(a => a.id === id)
    if (account) {
      setActiveAccountId(id)
      setResult(account.data)
      await storage.setActiveAccountId(id)
      setShowAddForm(false)
    }
  }

  async function handleDeleteAccount(id: string) {
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
  }

  async function handleRefresh() {
    if (!activeAccountId) return
    try {
      setLoading(true)
      const updatedAccount = await storage.refreshAccount(activeAccountId)
      setResult(updatedAccount.data)
      const updatedAccounts = await storage.getAccounts()
      setAccounts(updatedAccounts)
    } catch (err: any) {
      setError(err.message)
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

  // Helper to get accessory duration
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

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-5xl font-bold">Valorant Checker</h1>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Accounts: {accounts.length}</span>
            <UserButton />
          </div>
        </div>

        <AccountSwitcher
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelect={handleSelectAccount}
          onAdd={() => setShowAddForm(true)}
          onDelete={handleDeleteAccount}
          playerCardsData={playerCardsData}
        />

        {showAddForm && (
          <InstructionSection
            redirectUrl={redirectUrl}
            setRedirectUrl={setRedirectUrl}
            handleGetInfo={handleGetInfo}
            loading={loading}
            error={error}
          />
        )}

        {result && (
          <div className="mt-10">
            <UserInfoSection
              result={result}
              playerCardsData={playerCardsData}
              titlesData={titlesData}
              onRefresh={handleRefresh}
              loading={loading}
            />

            <h2 className="text-2xl font-bold mb-4 mt-8 text-white">Daily Store</h2>

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

            <AccessoryStore
              accessoryOffers={accessoryOffers}
              playerCardsData={playerCardsData}
              buddiesData={buddiesData}
              spraysData={spraysData}
              titlesData={titlesData}
              remainingDuration={getAccessoryDuration()}
            />

            <NightMarket
              bonusStore={result.store?.BonusStore}
              weaponsData={weaponsData}
              onSkinClick={handleSkinClick}
            />

            <WeaponLoadout
              loadout={result.loadout}
              weaponsData={weaponsData}
              buddiesData={buddiesData}
              onWeaponClick={(weapon) => {
                setSelectedWeaponForModal(weapon)
                setSelectedSkinIdForModal(undefined)
              }}
            />

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
  )
}
