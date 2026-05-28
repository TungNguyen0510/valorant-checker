'use client'

import React, { useState, useEffect, use } from 'react'
import { Header } from '@/components/Header'
import { useQuery } from '@tanstack/react-query'
import * as storage from '@/utils/storage'
import Link from 'next/link'
import { OwnedSkinsGrid } from '@/components/OwnedSkinsGrid'
import { BaseDialog } from '@/components/BaseDialog'
import { ArrowLeft, User, DollarSign, Calendar, MessageSquare, Info, ShieldAlert, Award, Hash, Compass } from 'lucide-react'

// Tab type definition
type TabId = 'details' | 'skins' | 'agents' | 'cards' | 'buddies' | 'sprays'

interface ShopDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { id } = use(params)
  const [myAccounts, setMyAccounts] = useState<any[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)

  // Tab and contact dialog states
  const [activeTab, setActiveTab] = useState<TabId>('details')
  const [showContactDialog, setShowContactDialog] = useState(false)

  // Search queries for new tabs
  const [agentSearch, setAgentSearch] = useState('')
  const [cardSearch, setCardSearch] = useState('')
  const [buddySearch, setBuddySearch] = useState('')
  const [spraySearch, setSpraySearch] = useState('')

  // Load user accounts for Header Switcher
  useEffect(() => {
    async function init() {
      try {
        const loaded = await storage.getAccounts()
        const active = await storage.getActiveAccountId()
        setMyAccounts(loaded)
        setActiveAccountId(active || (loaded[0]?.id || null))
      } catch (e) {
        console.error(e)
      }
    }
    init()
  }, [])

  // 1. Fetch static Valorant API assets
  const { data: weaponsData } = useQuery({
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

  // 2. Fetch Shop Listing details
  const { data: listing, isLoading: isLoadingListing, error: listingError } = useQuery({
    queryKey: ['shopListingDetail', id],
    queryFn: async () => {
      const res = await fetch(`/api/shop/${id}`)
      if (!res.ok) throw new Error('Listing not found')
      return res.json()
    }
  })

  if (isLoadingListing || !weaponsData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-t-[#FF4655] border-r-transparent border-b-[#FF4655]/10 border-l-transparent animate-spin" />
          <div className="absolute inset-4 bg-[#FF4655] rotate-45 animate-pulse rounded-[2px]" />
        </div>
        <span className="text-[10px] font-black tracking-[0.25em] text-[#FF4655] uppercase animate-pulse">
          LOADING ACCOUNT SPECIFICATION...
        </span>
      </div>
    )
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black text-white uppercase italic">Listing Not Found</h2>
        <p className="text-zinc-500 text-xs font-semibold">This listing might have been removed or does not exist.</p>
        <Link href="/shop" className="mt-4 px-6 py-2 bg-[#FF4655] hover:bg-[#ff5e6a] text-white text-xs font-black uppercase transition-all">
          Back to Shop
        </Link>
      </div>
    )
  }

  const account = listing.account
  const detailData = account.data || {}

  // Extract exact level
  const accountLevel = (() => {
    if (detailData.accountLevel) return detailData.accountLevel
    if (detailData.accountXP?.Progress?.Level) {
      return detailData.accountXP.Progress.Level
    }
    const puuid = detailData.puuid
    if (puuid && Array.isArray(detailData.matchDetails)) {
      for (const match of detailData.matchDetails) {
        if (match && Array.isArray(match.players)) {
          const me = match.players.find((p: any) => p.subject === puuid)
          if (me && me.accountLevel) {
            return me.accountLevel
          }
        }
      }
    }
    return 'N/A'
  })()

  // Filter exact owned skins
  const ownedWeaponSkins = (() => {
    if (!weaponsData || !detailData.ownedSkins) return []
    const list: any[] = []
    weaponsData.forEach((weapon: any) => {
      weapon.skins?.forEach((skin: any) => {
        if (!skin || !skin.displayName) return
        if (skin.displayName.includes('Standard') || skin.displayName === 'Melee') return

        const isOwned = skin.levels?.some((level: any) =>
          detailData.ownedSkins.some((ownedUuid: string) => ownedUuid.toLowerCase() === level.uuid.toLowerCase())
        )
        if (isOwned) {
          list.push(skin)
        }
      })
    })
    return list
  })()

  // Filter exact owned agents
  const defaultAgentUuids = new Set([
    'add6443c-41bd-43e4-bb32-f02edd7dd8a9', // Jett
    '117ed9e3-49f3-4315-ad36-ff4015c0b82a', // Phoenix
    '5685d5a9-584a-4458-ae47-31c8856b3e3f', // Sage
    'ded3520f-4264-bfed-de78-a0b777be2014', // Sova
    '9f0f7139-440a-9137-f0a7-809f194c515b'  // Brimstone
  ])
  const ownedAgents = (() => {
    if (!agentsData || !detailData.ownedSkins) return []
    return agentsData.filter((agent: any) => {
      const uuidLower = agent.uuid.toLowerCase()
      if (defaultAgentUuids.has(uuidLower)) return true
      return detailData.ownedSkins?.some((id: string) => id.toLowerCase() === uuidLower)
    })
  })()

  // Filter exact owned cards
  const ownedCards = (() => {
    if (!playerCardsData || !detailData.ownedSkins) return []
    return playerCardsData.filter((card: any) => {
      const uuidLower = card.uuid.toLowerCase()
      const isStandard = card.displayName === 'Standard' || card.displayName?.includes('Standard')
      if (isStandard) return true
      return detailData.ownedSkins?.some((id: string) => id.toLowerCase() === uuidLower)
    })
  })()

  // Filter exact owned buddies
  const ownedBuddies = (() => {
    if (!buddiesData || !detailData.ownedSkins) return []
    return buddiesData.filter((buddy: any) => {
      const buddyUuid = buddy.uuid.toLowerCase()
      const levelUuids = buddy.levels?.map((l: any) => l.uuid.toLowerCase()) || []
      return detailData.ownedSkins?.some((id: string) => {
        const lowerId = id.toLowerCase()
        return lowerId === buddyUuid || levelUuids.includes(lowerId)
      })
    })
  })()

  // Filter exact owned sprays
  const ownedSprays = (() => {
    if (!spraysData || !detailData.ownedSkins) return []
    return spraysData.filter((spray: any) => {
      const sprayUuid = spray.uuid.toLowerCase()
      const levelUuids = spray.levels?.map((l: any) => l.uuid.toLowerCase()) || []
      return detailData.ownedSkins?.some((id: string) => {
        const lowerId = id.toLowerCase()
        return lowerId === sprayUuid || levelUuids.includes(lowerId)
      })
    })
  })()

  const filteredAgents = ownedAgents.filter((agent: any) =>
    agent.displayName.toLowerCase().includes(agentSearch.toLowerCase().trim())
  )

  const filteredCards = ownedCards.filter((card: any) =>
    card.displayName.toLowerCase().includes(cardSearch.toLowerCase().trim())
  )

  const filteredBuddies = ownedBuddies.filter((buddy: any) =>
    buddy.displayName.toLowerCase().includes(buddySearch.toLowerCase().trim())
  )

  const filteredSprays = ownedSprays.filter((spray: any) =>
    spray.displayName.toLowerCase().includes(spraySearch.toLowerCase().trim())
  )

  const rankTier = detailData.rank?.LatestCompetitiveUpdate?.TierAfterUpdate || 0
  const rankInfo = competitiveTiersData?.[competitiveTiersData.length - 1]?.tiers?.find(
    (t: any) => t.tier === rankTier
  )
  const playerCardId = detailData.loadout?.Identity?.PlayerCardID
  const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)
  const listedDate = new Date(listing.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-body">
      <Header
        accounts={myAccounts}
        activeAccountId={activeAccountId}
        onSelect={(id) => {
          setActiveAccountId(id)
          storage.setActiveAccountId(id)
        }}
        playerCardsData={playerCardsData || []}
      />

      <main
        className="flex-1 px-4 py-8 mt-16 bg-cover bg-center bg-no-repeat min-h-[calc(100vh-64px)] relative"
        style={{ backgroundImage: "url('https://pbs.twimg.com/media/FfM55w5WIAAxH06?format=jpg&name=large')" }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-0" />

        <div className="max-w-[1480px] mx-auto relative z-10 pt-4 pb-16">

          {/* Back button */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shop</span>
          </Link>

          {/* Account Profile Header Widget */}
          <div className="bg-[#0f1923]/90 border border-zinc-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative">
            <div className="flex items-center gap-5 w-full md:w-auto">
              {card?.smallArt || card?.displayIcon ? (
                <img src={card.smallArt || card.displayIcon} alt="" className="w-16 h-16 rounded border border-zinc-800 object-cover" />
              ) : (
                <div className="w-16 h-16 bg-white/5 border border-zinc-800 flex items-center justify-center font-bold text-white text-xl uppercase rounded">
                  {account.name?.[0]}
                </div>
              )}

              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-3xl font-black uppercase text-white truncate max-w-[280px]">
                    {account.name}
                    <span className="text-zinc-500 font-bold text-sm md:text-base ml-1">#{account.tag}</span>
                  </h1>
                  <span className="px-2 py-0.5 bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-[9px] font-black uppercase tracking-widest leading-none rounded-sm">
                    {listing.status === 'active' ? 'Active' : listing.status === 'sold' ? 'Sold' : 'Cancelled'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-[#FF4655]" /> Region: <span className="text-white font-black">{detailData.affinity || 'AP'}</span></span>
                  <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5 text-[#FF4655]" /> Level: <span className="text-white font-black">{accountLevel}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
              {/* Price */}
              <div className="flex flex-col md:text-right">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Asking Price</span>
                <span className="text-2xl md:text-4xl font-heading font-black text-[#FF4655] italic tracking-tight">
                  {listing.price.toLocaleString('vi-VN')} đ
                </span>
              </div>

              {/* Action Button */}
              {listing.status === 'active' && (
                <button
                  onClick={() => setShowContactDialog(true)}
                  className="bg-[#FF4655] hover:bg-[#ff5e6a] text-white px-8 py-4 font-black uppercase tracking-wider text-xs md:text-sm transition-all rounded-none shadow-[4px_4px_0px_0px_rgba(255,70,85,0.3)] hover:shadow-none cursor-pointer"
                >
                  CONTACT SELLER TO BUY
                </button>
              )}
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#FF4655]" />
            <div className="absolute top-0 left-0 w-[2px] h-8 bg-[#FF4655]" />
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap border-b border-zinc-800 mb-8 bg-[#0f1923]/40">
            {[
              { id: 'details', label: 'LISTING DETAILS' },
              { id: 'skins', label: `OWNED SKINS (${ownedWeaponSkins.length})` },
              { id: 'agents', label: `OWNED AGENTS (${ownedAgents.length})` },
              { id: 'cards', label: `OWNED CARDS (${ownedCards.length})` },
              { id: 'buddies', label: `OWNED BUDDIES (${ownedBuddies.length})` },
              { id: 'sprays', label: `OWNED SPRAYS (${ownedSprays.length})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`px-6 py-4 text-xs font-black uppercase tracking-wider transition-all duration-300 relative border-b-2 cursor-pointer ${isActive
                    ? 'text-white border-[#FF4655] bg-white/2'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/1'
                    }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Contents */}
          <div className="min-h-[500px]">

            {/* 1. Tab Details */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Description Box */}
                  <div className="bg-[#0f1923] border border-zinc-800 p-6 md:p-8 flex flex-col gap-4 relative">
                    <h3 className="text-lg font-black uppercase italic text-white border-b border-zinc-800 pb-3">
                      DETAILED DESCRIPTION
                    </h3>
                    {listing.description ? (
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {listing.description}
                      </p>
                    ) : (
                      <p className="text-zinc-500 italic text-sm">The seller has not provided an additional description.</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* Stats Box */}
                  <div className="bg-[#0f1923] border border-zinc-800 p-6 flex flex-col gap-4 relative">
                    <h3 className="text-base font-black uppercase italic text-white border-b border-zinc-800 pb-3">
                      LISTING METADATA
                    </h3>
                    <div className="flex flex-col gap-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#FF4655]" /> Seller:</span>
                        <span className="text-white font-black truncate max-w-[150px]" title={listing.sellerId}>ID: {listing.sellerId.substring(0, 10)}...</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#FF4655]" /> Date Listed:</span>
                        <span className="text-white font-black">{listedDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-[#FF4655]" /> Current Rank:</span>
                        <div className="flex items-center gap-1.5">
                          {rankInfo?.smallIcon && (
                            <img src={rankInfo.smallIcon} alt="" className="w-5 h-5" />
                          )}
                          <span className="text-white font-black">{rankInfo?.tierName || 'Unranked'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-zinc-800/60 pt-3">
                        <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-[#FF4655]" /> Listing Status:</span>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase leading-none rounded ${listing.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          }`}>
                          {listing.status === 'active' ? 'Active' : listing.status === 'sold' ? 'Sold' : 'Cancelled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Tab Skins */}
            {activeTab === 'skins' && (
              <div className="animate-in fade-in duration-300">
                <OwnedSkinsGrid
                  weaponsData={weaponsData}
                  ownedSkins={detailData.ownedSkins || []}
                  contractsData={contractsData}
                  onSkinClick={() => { }}
                  skinPricesData={skinPricesData}
                />
              </div>
            )}
            {/* 3. Tab Agents */}
            {activeTab === 'agents' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6 relative w-full md:w-96 group">
                  <input
                    type="text"
                    placeholder="Search owned agents..."
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2.5 pl-10 pr-8 text-xs text-zinc-300 placeholder:text-zinc-655 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-inner focus:bg-zinc-950"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-teal-400 transition-colors pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  {agentSearch && (
                    <button
                      onClick={() => setAgentSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2055/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {filteredAgents.length === 0 ? (
                  <div className="bg-[#0f1923]/40 border border-zinc-900 py-16 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-555 text-xs font-bold uppercase tracking-wider">No agents found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
                    {filteredAgents.map((agent: any) => (
                      <div
                        key={agent.uuid}
                        className="bg-[#0f1923]/60 border border-zinc-800 hover:border-teal-500/50 p-2 flex items-center justify-center transition-all duration-300 relative group aspect-square rounded-md overflow-hidden"
                        title={agent.displayName}
                      >
                        <img
                          src={agent.displayIcon}
                          alt={agent.displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Tab Cards */}
            {activeTab === 'cards' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6 relative w-full md:w-96 group">
                  <input
                    type="text"
                    placeholder="Search owned player cards..."
                    value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2.5 pl-10 pr-8 text-xs text-zinc-300 placeholder:text-zinc-655 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-inner focus:bg-zinc-950"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-teal-400 transition-colors pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  {cardSearch && (
                    <button
                      onClick={() => setCardSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {filteredCards.length === 0 ? (
                  <div className="bg-[#0f1923]/40 border border-zinc-900 py-16 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-555 text-xs font-bold uppercase tracking-wider">No player cards found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {filteredCards.map((card: any) => (
                      <div
                        key={card.uuid}
                        className="bg-[#0f1923]/60 border border-zinc-800 hover:border-teal-500/50 p-2 flex items-center justify-center transition-all duration-300 relative group aspect-square rounded-md overflow-hidden"
                        title={card.displayName}
                      >
                        <img
                          src={card.displayIcon}
                          alt={card.displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Tab Buddies */}
            {activeTab === 'buddies' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6 relative w-full md:w-96 group">
                  <input
                    type="text"
                    placeholder="Search owned buddies..."
                    value={buddySearch}
                    onChange={(e) => setBuddySearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2.5 pl-10 pr-8 text-xs text-zinc-300 placeholder:text-zinc-655 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-inner focus:bg-zinc-950"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-teal-400 transition-colors pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  {buddySearch && (
                    <button
                      onClick={() => setBuddySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {filteredBuddies.length === 0 ? (
                  <div className="bg-[#0f1923]/40 border border-zinc-900 py-16 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-555 text-xs font-bold uppercase tracking-wider">No buddies found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
                    {filteredBuddies.map((buddy: any) => (
                      <div
                        key={buddy.uuid}
                        className="bg-[#0f1923]/60 border border-zinc-800 hover:border-teal-500/50 hover:bg-teal-500/5 p-4 flex flex-col items-center justify-center text-center transition-all duration-300 relative group aspect-square"
                      >
                        <div className="size-16 relative flex items-center justify-center mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                          <img
                            src={buddy.displayIcon}
                            alt={buddy.displayName}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[9px] text-zinc-400 font-bold tracking-wide truncate w-full px-1 mt-1 group-hover:text-white transition-colors" title={buddy.displayName}>
                          {buddy.displayName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. Tab Sprays */}
            {activeTab === 'sprays' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6 relative w-full md:w-96 group">
                  <input
                    type="text"
                    placeholder="Search owned sprays..."
                    value={spraySearch}
                    onChange={(e) => setSpraySearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2.5 pl-10 pr-8 text-xs text-zinc-300 placeholder:text-zinc-655 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-inner focus:bg-zinc-950"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-teal-400 transition-colors pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  {spraySearch && (
                    <button
                      onClick={() => setSpraySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {filteredSprays.length === 0 ? (
                  <div className="bg-[#0f1923]/40 border border-zinc-900 py-16 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-555 text-xs font-bold uppercase tracking-wider">No sprays found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
                    {filteredSprays.map((spray: any) => (
                      <div
                        key={spray.uuid}
                        className="bg-[#0f1923]/60 border border-zinc-800 hover:border-teal-500/50 hover:bg-teal-500/5 p-4 flex flex-col items-center justify-center text-center transition-all duration-300 relative group aspect-square"
                      >
                        <div className="size-16 relative flex items-center justify-center mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                          <img
                            src={spray.displayIcon || spray.fullIcon}
                            alt={spray.displayName}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[9px] text-zinc-400 font-bold tracking-wide truncate w-full px-1 mt-1 group-hover:text-white transition-colors" title={spray.displayName}>
                          {spray.displayName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Simulated purchase contact dialog */}
      <BaseDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        title="SELLER CONTACT METHOD"
        description="Valorant Checker Marketplace"
        maxWidth="md"
      >
        <div className="p-6 md:p-8 flex flex-col gap-5 bg-[#0f1923]">

          <div className="p-4 bg-teal-500/10 border border-teal-500/30 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-555 font-bold uppercase tracking-widest">SELLER CONTACT DETAILS</span>
              <span className="text-white text-base font-black selection:bg-teal-500 selection:text-white">
                {listing.contactInfo}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#FF4655]/10 border border-[#FF4655]/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#FF4655] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-555 font-bold uppercase tracking-widest">SAFE TRANSACTION NOTICE</span>
              <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                Please contact the seller directly using the details provided above to negotiate and finalize the transaction. Valorant Checker does not act as an escrow mediator and is not liable for account disputes occurring outside our system. Transact with caution!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowContactDialog(false)}
            className="w-full py-3 bg-[#FF4655] hover:bg-[#ff5e6a] text-white font-bold uppercase tracking-wider text-xs transition-all rounded-none cursor-pointer"
          >
            I UNDERSTAND AND AGREE
          </button>
        </div>
      </BaseDialog>
    </div>
  )
}
