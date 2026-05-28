'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Header } from '@/components/Header'
import { useQuery } from '@tanstack/react-query'
import * as storage from '@/utils/storage'
import Link from 'next/link'
import { Search, Filter, X, Tag, Sparkles } from 'lucide-react'
import { TIER_ICONS, TIER_RANKS } from '@/constants/valorant'

// Rank mapping from tier index
const RANK_TIERS = [
  { tier: 0, name: 'Unranked' },
  { tier: 3, name: 'Iron 1' },
  { tier: 4, name: 'Iron 2' },
  { tier: 5, name: 'Iron 3' },
  { tier: 6, name: 'Bronze 1' },
  { tier: 7, name: 'Bronze 2' },
  { tier: 8, name: 'Bronze 3' },
  { tier: 9, name: 'Silver 1' },
  { tier: 10, name: 'Silver 2' },
  { tier: 11, name: 'Silver 3' },
  { tier: 12, name: 'Gold 1' },
  { tier: 13, name: 'Gold 2' },
  { tier: 14, name: 'Gold 3' },
  { tier: 15, name: 'Platinum 1' },
  { tier: 16, name: 'Platinum 2' },
  { tier: 17, name: 'Platinum 3' },
  { tier: 18, name: 'Diamond 1' },
  { tier: 19, name: 'Diamond 2' },
  { tier: 20, name: 'Diamond 3' },
  { tier: 21, name: 'Ascendant 1' },
  { tier: 22, name: 'Ascendant 2' },
  { tier: 23, name: 'Ascendant 3' },
  { tier: 24, name: 'Immortal 1' },
  { tier: 25, name: 'Immortal 2' },
  { tier: 26, name: 'Immortal 3' },
  { tier: 27, name: 'Radiant' }
]

interface SkinListItem {
  uuid: string
  displayName: string
  displayIcon: string
  contentTierUuid?: string
}

interface AccessoryListItem {
  uuid: string
  displayName: string
  displayIcon: string
  type: 'buddy' | 'card' | 'spray'
}

export default function ShopPage() {
  const [myAccounts, setMyAccounts] = useState<any[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)

  // Applied filters (used for query)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [rank, setRank] = useState<number | undefined>(undefined)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest')
  const [selectedSkins, setSelectedSkins] = useState<SkinListItem[]>([])
  const [selectedAccessories, setSelectedAccessories] = useState<AccessoryListItem[]>([])

  // Form input/temporary states (only applied on clicking Search button)
  const [searchInput, setSearchInput] = useState('')
  const [regionInput, setRegionInput] = useState('')
  const [rankInput, setRankInput] = useState<number | undefined>(undefined)
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [selectedSkinsInput, setSelectedSkinsInput] = useState<SkinListItem[]>([])
  const [selectedAccessoriesInput, setSelectedAccessoriesInput] = useState<AccessoryListItem[]>([])

  // Custom Dropdowns open/close state
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false)
  const [isRankDropdownOpen, setIsRankDropdownOpen] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [skinSearchQuery, setSkinSearchQuery] = useState('')
  const [isSkinDropdownOpen, setIsSkinDropdownOpen] = useState(false)
  const [visibleSkinsCount, setVisibleSkinsCount] = useState(20)

  const [accessorySearchQuery, setAccessorySearchQuery] = useState('')
  const [isAccessoryDropdownOpen, setIsAccessoryDropdownOpen] = useState(false)
  const [visibleAccessoriesCount, setVisibleAccessoriesCount] = useState(20)

  // Dropdown Refs for click outside handling
  const skinDropdownRef = useRef<HTMLDivElement>(null)
  const skinInputRef = useRef<HTMLInputElement>(null)
  const accessoryDropdownRef = useRef<HTMLDivElement>(null)
  const accessoryInputRef = useRef<HTMLInputElement>(null)
  const regionDropdownRef = useRef<HTMLDivElement>(null)
  const rankDropdownRef = useRef<HTMLDivElement>(null)
  const sortDropdownRef = useRef<HTMLDivElement>(null)

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

  // Close all custom dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (skinDropdownRef.current && !skinDropdownRef.current.contains(target)) {
        setIsSkinDropdownOpen(false)
      }
      if (accessoryDropdownRef.current && !accessoryDropdownRef.current.contains(target)) {
        setIsAccessoryDropdownOpen(false)
      }
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(target)) {
        setIsRegionDropdownOpen(false)
      }
      if (rankDropdownRef.current && !rankDropdownRef.current.contains(target)) {
        setIsRankDropdownOpen(false)
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setIsSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch Valorant API Static Assets
  const { data: weaponsData } = useQuery({
    queryKey: ['weapons'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/weapons')
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

  const { data: competitiveTiersData } = useQuery({
    queryKey: ['competitiveTiers'],
    queryFn: async () => {
      const res = await fetch('https://valorant-api.com/v1/competitivetiers')
      const json = await res.json()
      return json.data
    }
  })

  // Parse all unique skins from weaponsData
  const allSkins = useMemo(() => {
    if (!weaponsData) return []
    const list: SkinListItem[] = []
    const seen = new Set<string>()

    weaponsData.forEach((weapon: any) => {
      weapon.skins?.forEach((skin: any) => {
        if (!skin || !skin.displayName) return
        if (skin.displayName.includes('Standard') || skin.displayName === 'Melee') return
        const normalized = skin.displayName.toLowerCase()
        if (seen.has(normalized)) return
        seen.add(normalized)

        list.push({
          uuid: skin.uuid,
          displayName: skin.displayName,
          displayIcon: skin.chromas?.[0]?.displayIcon || skin.displayIcon || skin.levels?.[0]?.displayIcon,
          contentTierUuid: skin.contentTierUuid
        })
      })
    })
    return list.sort((a, b) => {
      const rankA = a.contentTierUuid ? (TIER_RANKS[a.contentTierUuid] || 0) : 0
      const rankB = b.contentTierUuid ? (TIER_RANKS[b.contentTierUuid] || 0) : 0

      if (rankB !== rankA) {
        return rankB - rankA
      }
      return a.displayName.localeCompare(b.displayName)
    })
  }, [weaponsData])

  // Parse all unique accessories (buddies, cards, sprays)
  const allAccessories = useMemo(() => {
    const list: AccessoryListItem[] = []

    if (buddiesData) {
      buddiesData.forEach((buddy: any) => {
        if (!buddy || !buddy.displayName) return
        list.push({
          uuid: buddy.uuid,
          displayName: buddy.displayName,
          displayIcon: buddy.displayIcon,
          type: 'buddy'
        })
      })
    }

    if (playerCardsData) {
      playerCardsData.forEach((card: any) => {
        if (!card || !card.displayName) return
        list.push({
          uuid: card.uuid,
          displayName: card.displayName,
          displayIcon: card.smallArt || card.displayIcon,
          type: 'card'
        })
      })
    }

    if (spraysData) {
      spraysData.forEach((spray: any) => {
        if (!spray || !spray.displayName) return
        list.push({
          uuid: spray.uuid,
          displayName: spray.displayName,
          displayIcon: spray.displayIcon || spray.fullIcon,
          type: 'spray'
        })
      })
    }

    return list.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [buddiesData, playerCardsData, spraysData])

  // Filter skins based on input query and exclusion of already selected
  const filteredSkins = useMemo(() => {
    const query = skinSearchQuery.toLowerCase().trim()
    return allSkins.filter(
      (skin) =>
        skin.displayName.toLowerCase().includes(query) &&
        !selectedSkinsInput.some((s) => s.uuid === skin.uuid)
    )
  }, [allSkins, skinSearchQuery, selectedSkinsInput])

  // Slice filtered skins for client-side infinite scroll rendering
  const displayedSkins = useMemo(() => {
    return filteredSkins.slice(0, visibleSkinsCount)
  }, [filteredSkins, visibleSkinsCount])

  // Reset visible count when search query or dropdown open state changes
  useEffect(() => {
    setVisibleSkinsCount(20)
  }, [skinSearchQuery, isSkinDropdownOpen])

  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 30) {
      if (visibleSkinsCount < filteredSkins.length) {
        setVisibleSkinsCount((prev) => prev + 20)
      }
    }
  }

  // Filter accessories based on input query and exclusion of already selected
  const filteredAccessories = useMemo(() => {
    const query = accessorySearchQuery.toLowerCase().trim()
    return allAccessories.filter(
      (acc) =>
        acc.displayName.toLowerCase().includes(query) &&
        !selectedAccessoriesInput.some((a) => a.uuid === acc.uuid)
    )
  }, [allAccessories, accessorySearchQuery, selectedAccessoriesInput])

  // Slice filtered accessories for client-side infinite scroll rendering
  const displayedAccessories = useMemo(() => {
    return filteredAccessories.slice(0, visibleAccessoriesCount)
  }, [filteredAccessories, visibleAccessoriesCount])

  // Reset visible count when search query or dropdown open state changes
  useEffect(() => {
    setVisibleAccessoriesCount(20)
  }, [accessorySearchQuery, isAccessoryDropdownOpen])

  const handleAccessoryDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 30) {
      if (visibleAccessoriesCount < filteredAccessories.length) {
        setVisibleAccessoriesCount((prev) => prev + 20)
      }
    }
  }

  // Comma-separated selected skins and accessories string for API request
  const selectedSkinsParam = useMemo(() => {
    const allSelectedUuids = [
      ...selectedSkins.map((s) => s.uuid),
      ...selectedAccessories.map((a) => a.uuid)
    ]
    return allSelectedUuids.join(',')
  }, [selectedSkins, selectedAccessories])

  // Fetch Listings with skin filters
  const { data: shopData, isLoading: isLoadingListings } = useQuery({
    queryKey: ['shopListings', page, search, region, rank, minPrice, maxPrice, sortBy, selectedSkinsParam],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '9')
      if (search) params.append('search', search)
      if (region) params.append('region', region)
      if (rank !== undefined) params.append('rank', rank.toString())
      if (minPrice) params.append('minPrice', minPrice.replace(/,/g, ''))
      if (maxPrice) params.append('maxPrice', maxPrice.replace(/,/g, ''))
      if (selectedSkinsParam) params.append('skins', selectedSkinsParam)
      params.append('sortBy', sortBy)

      const res = await fetch(`/api/shop?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch listings')
      return res.json()
    }
  })

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearch(searchInput)
    setRegion(regionInput)
    setRank(rankInput)
    setMinPrice(minPriceInput)
    setMaxPrice(maxPriceInput)
    setSelectedSkins(selectedSkinsInput)
    setSelectedAccessories(selectedAccessoriesInput)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setRegionInput('')
    setRankInput(undefined)
    setMinPriceInput('')
    setMaxPriceInput('')
    setSelectedSkinsInput([])
    setSelectedAccessoriesInput([])
    setSkinSearchQuery('')
    setAccessorySearchQuery('')

    setSearch('')
    setRegion('')
    setRank(undefined)
    setMinPrice('')
    setMaxPrice('')
    setSelectedSkins([])
    setSelectedAccessories([])

    setSortBy('newest')
    setPage(1)

    setIsRegionDropdownOpen(false)
    setIsRankDropdownOpen(false)
    setIsSortDropdownOpen(false)
    setIsSkinDropdownOpen(false)
    setIsAccessoryDropdownOpen(false)
  }

  const formatPrice = (p: number) => {
    return p.toLocaleString('vi-VN') + ' đ'
  }

  const getRankInfo = (tier: number) => {
    if (!competitiveTiersData) return null
    const tiers = competitiveTiersData[competitiveTiersData.length - 1]?.tiers || []
    return tiers.find((t: any) => t.tier === tier)
  }

  const getTierChipClass = (tierUuid?: string) => {
    const tierStyles: Record<string, string> = {
      '411e4a55-4e59-7757-41f0-86a53f101bb5': 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400', // Exclusive
      'e046854e-406c-37f4-6607-19a9ba8426fc': 'bg-orange-500/10 border border-orange-500/30 text-orange-400', // Ultra
      '60bca009-4182-7998-dee7-b8a2558dc369': 'bg-pink-500/10 border border-pink-500/30 text-pink-400', // Premium
      '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400', // Deluxe
      '12683d76-48d7-84a3-4e09-6985794f0445': 'bg-blue-500/10 border border-blue-500/30 text-blue-400', // Select
    }
    return tierStyles[tierUuid || ''] || 'bg-[#FF4655]/10 border border-[#FF4655]/30 text-white'
  }

  const selectSkin = (skin: SkinListItem) => {
    if (!selectedSkinsInput.some((s) => s.uuid === skin.uuid)) {
      setSelectedSkinsInput([...selectedSkinsInput, skin])
      setSkinSearchQuery('')
    }
    setIsSkinDropdownOpen(false)
  }

  const removeSkin = (skinUuid: string) => {
    setSelectedSkinsInput(selectedSkinsInput.filter((s) => s.uuid !== skinUuid))
  }

  const selectAccessory = (acc: AccessoryListItem) => {
    if (!selectedAccessoriesInput.some((a) => a.uuid === acc.uuid)) {
      setSelectedAccessoriesInput([...selectedAccessoriesInput, acc])
      setAccessorySearchQuery('')
    }
    setIsAccessoryDropdownOpen(false)
  }

  const removeAccessory = (accUuid: string) => {
    setSelectedAccessoriesInput(selectedAccessoriesInput.filter((a) => a.uuid !== accUuid))
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

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
        className="flex-1 px-4 py-8 mt-12 bg-cover bg-center bg-no-repeat min-h-[calc(100vh-64px)] relative"
        style={{ backgroundImage: "url('https://pbs.twimg.com/media/FfM55w5WIAAxH06?format=jpg&name=large')" }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-0" />

        <div className="max-w-[1480px] mx-auto relative z-10 pt-8 pb-16">

          {/* Header Banner */}
          <div className="mb-8 text-center md:text-left relative">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-2">
              VALORANT <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF4655] to-[#ff7d87] pr-4">SHOP</span>
            </h1>
            <div className="w-20 h-1 bg-[#FF4655] mt-4" />
          </div>

          {/* Horizontal Filters Panel */}
          <form
            onSubmit={handleApplyFilters}
            className="bg-[#0f1923]/90 border border-zinc-800 p-6 flex flex-col gap-5 mb-8 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase italic text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#FF4655]" /> SEARCH FILTERS
              </h3>
            </div>

            {/* Main inputs row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

              {/* Account Search */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Account Name / Tag</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search by name/tag..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#FF4655]/50 focus:ring-1 focus:ring-[#FF4655]/20 outline-none text-zinc-300 placeholder:text-zinc-655 pl-10 pr-10 py-2.5 text-xs font-semibold rounded-md transition-all focus:bg-zinc-950"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#FF4655] transition-colors pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('')
                      }}
                      className="absolute right-9 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#FF4655] transition-colors cursor-pointer p-1">
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Region */}
              <div className="flex flex-col gap-2" ref={regionDropdownRef}>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Region</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegionDropdownOpen(!isRegionDropdownOpen)
                      setIsRankDropdownOpen(false)
                      setIsSortDropdownOpen(false)
                      setIsSkinDropdownOpen(false)
                    }}
                    className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 hover:border-[#FF4655]/40 focus:border-[#FF4655]/50 text-xs font-bold text-zinc-300 px-4 py-2.5 transition-all cursor-pointer select-none rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF4655]/20 h-[38px]"
                  >
                    <span className="uppercase truncate">
                      {regionInput === ''
                        ? 'ALL REGIONS'
                        : regionInput === 'ap'
                          ? 'Asia Pacific (AP)'
                          : regionInput === 'na'
                            ? 'North America (NA)'
                            : regionInput === 'eu'
                              ? 'Europe (EU)'
                              : regionInput === 'kr'
                                ? 'Korea (KR)'
                                : regionInput.toUpperCase()}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`text-zinc-555 transition-transform duration-205 shrink-0 ${isRegionDropdownOpen ? 'rotate-180 text-[#FF4655]' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {isRegionDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 rounded-md overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {[
                        { value: '', label: 'ALL REGIONS' },
                        { value: 'ap', label: 'Asia Pacific (AP)' },
                        { value: 'na', label: 'North America (NA)' },
                        { value: 'eu', label: 'Europe (EU)' },
                        { value: 'kr', label: 'Korea (KR)' }
                      ].map((opt) => {
                        const isSelected = regionInput === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setRegionInput(opt.value)
                              setIsRegionDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all duration-150 border-l-2 uppercase ${isSelected
                              ? 'bg-[#FF4655]/10 border-[#FF4655] text-white font-black'
                              : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                              }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Competitive Rank */}
              <div className="flex flex-col gap-2" ref={rankDropdownRef}>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Rank</label>
                <div className="relative">
                  {(() => {
                    const activeRankTier = RANK_TIERS.find((t) => t.tier === rankInput)
                    const activeRankInfo = rankInput !== undefined ? getRankInfo(rankInput) : null
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRankDropdownOpen(!isRankDropdownOpen)
                            setIsRegionDropdownOpen(false)
                            setIsSortDropdownOpen(false)
                            setIsSkinDropdownOpen(false)
                          }}
                          className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 hover:border-[#FF4655]/40 focus:border-[#FF4655]/50 text-xs font-bold text-zinc-300 px-4 py-2.5 transition-all cursor-pointer select-none rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF4655]/20 h-[38px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {activeRankInfo?.smallIcon && (
                              <img src={activeRankInfo.smallIcon} alt="" className="w-5 h-5 object-contain shrink-0" />
                            )}
                            <span className="uppercase truncate">
                              {rankInput === undefined ? 'ALL RANKS' : activeRankTier?.name || 'UNKNOWN'}
                            </span>
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className={`text-zinc-555 transition-transform duration-205 shrink-0 ${isRankDropdownOpen ? 'rotate-180 text-[#FF4655]' : ''}`}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>

                        {isRankDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 rounded-md overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                setRankInput(undefined)
                                setIsRankDropdownOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all duration-150 border-l-2 uppercase flex items-center gap-2 ${rankInput === undefined
                                ? 'bg-[#FF4655]/10 border-[#FF4655] text-white font-black'
                                : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                                }`}
                            >
                              <div className="w-5 h-5 shrink-0" />
                              <span>ALL RANKS</span>
                            </button>
                            {RANK_TIERS.map((tier) => {
                              const isSelected = rankInput === tier.tier
                              const rankInfo = getRankInfo(tier.tier)
                              return (
                                <button
                                  key={tier.tier}
                                  type="button"
                                  onClick={() => {
                                    setRankInput(tier.tier)
                                    setIsRankDropdownOpen(false)
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all duration-150 border-l-2 uppercase flex items-center gap-2 ${isSelected
                                    ? 'bg-[#FF4655]/10 border-[#FF4655] text-white font-black'
                                    : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                                    }`}
                                >
                                  {rankInfo?.smallIcon ? (
                                    <img src={rankInfo.smallIcon} alt="" className="w-5 h-5 object-contain shrink-0" />
                                  ) : (
                                    <div className="w-5 h-5 shrink-0 bg-white/5 rounded-full" />
                                  )}
                                  <span className="truncate">{tier.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Price Range */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Price Range (VND)</label>
                <div className="flex gap-2 items-center h-[38px]">
                  <input
                    type="text"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setMinPriceInput(val === '' ? '' : parseInt(val, 10).toLocaleString('en-US'))
                    }}
                    className="w-full h-full bg-zinc-950 border border-zinc-800 focus:border-[#FF4655]/50 focus:ring-1 focus:ring-[#FF4655]/20 outline-none text-zinc-300 placeholder:text-zinc-655 px-3 py-2 text-xs font-bold rounded-md text-center focus:bg-zinc-950 transition-all"
                  />
                  <span className="text-zinc-655 text-xs font-bold">-</span>
                  <input
                    type="text"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setMaxPriceInput(val === '' ? '' : parseInt(val, 10).toLocaleString('en-US'))
                    }}
                    className="w-full h-full bg-zinc-950 border border-zinc-800 focus:border-[#FF4655]/50 focus:ring-1 focus:ring-[#FF4655]/20 outline-none text-zinc-300 placeholder:text-zinc-655 px-3 py-2 text-xs font-bold rounded-md text-center focus:bg-zinc-950 transition-all"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="flex flex-col gap-2" ref={sortDropdownRef}>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Sort By</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSortDropdownOpen(!isSortDropdownOpen)
                      setIsRegionDropdownOpen(false)
                      setIsRankDropdownOpen(false)
                      setIsSkinDropdownOpen(false)
                    }}
                    className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 hover:border-[#FF4655]/40 focus:border-[#FF4655]/50 text-xs font-bold text-zinc-300 px-4 py-2.5 transition-all cursor-pointer select-none rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF4655]/20 h-[38px]"
                  >
                    <span className="uppercase truncate">
                      {sortBy === 'newest'
                        ? 'NEWEST LISTINGS'
                        : sortBy === 'price_asc'
                          ? 'PRICE: LOW TO HIGH'
                          : sortBy === 'price_desc'
                            ? 'PRICE: HIGH TO LOW'
                            : (sortBy as string).toUpperCase()}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`text-zinc-555 transition-transform duration-205 shrink-0 ${isSortDropdownOpen ? 'rotate-180 text-[#FF4655]' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 rounded-md overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {[
                        { value: 'newest', label: 'NEWEST LISTINGS' },
                        { value: 'price_asc', label: 'PRICE: LOW TO HIGH' },
                        { value: 'price_desc', label: 'PRICE: HIGH TO LOW' }
                      ].map((opt) => {
                        const isSelected = sortBy === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSortBy(opt.value as any)
                              setIsSortDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all duration-150 border-l-2 uppercase ${isSelected
                              ? 'bg-[#FF4655]/10 border-[#FF4655] text-white font-black'
                              : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                              }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
            {/* Autocomplete fields row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-900/60">

              {/* Skins Autocomplete Column */}
              <div className="flex flex-col gap-2" ref={skinDropdownRef}>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Tag className="w-3.5 h-3.5 text-[#FF4655]" /> SEARCH BY SKINS
                </label>

                <div className="relative group">
                  <div
                    className="w-full bg-zinc-950 border border-zinc-800 focus-within:border-[#FF4655]/50 focus-within:ring-1 focus-within:ring-[#FF4655]/20 flex flex-wrap items-center gap-2 p-1 text-xs font-semibold rounded-md transition-all cursor-text min-h-[38px]"
                    onClick={() => skinInputRef.current?.focus()}
                  >
                    {/* Selected Skins Chips inside the box */}
                    {selectedSkinsInput.map((skin) => (
                      <div
                        key={skin.uuid}
                        className={`flex items-center gap-1.5 pl-2 pr-1 py-1 text-[10px] font-black tracking-wider rounded-md shrink-0 select-none ${getTierChipClass(skin.contentTierUuid)}`}
                      >
                        {skin.displayIcon && (
                          <img src={skin.displayIcon} alt="" className="h-3.5 w-auto object-contain shrink-0" />
                        )}
                        <span className="truncate max-w-[120px]">{skin.displayName}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSkin(skin.uuid)
                          }}
                          className="text-zinc-550 hover:text-white p-0.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <input
                      ref={skinInputRef}
                      type="text"
                      placeholder={selectedSkinsInput.length === 0 ? "Type to search and filter by skins..." : ""}
                      value={skinSearchQuery}
                      onFocus={() => {
                        setIsSkinDropdownOpen(true)
                        setIsAccessoryDropdownOpen(false)
                        setIsRegionDropdownOpen(false)
                        setIsRankDropdownOpen(false)
                        setIsSortDropdownOpen(false)
                      }}
                      onChange={(e) => {
                        setSkinSearchQuery(e.target.value)
                        setIsSkinDropdownOpen(true)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && skinSearchQuery === '' && selectedSkinsInput.length > 0) {
                          removeSkin(selectedSkinsInput[selectedSkinsInput.length - 1].uuid)
                        }
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (displayedSkins.length > 0) {
                            selectSkin(displayedSkins[0])
                          }
                        }
                      }}
                      className="flex-grow bg-transparent border-0 outline-none text-zinc-300 placeholder:text-zinc-655 min-w-[120px] p-0 focus:ring-0 focus:outline-none focus:border-transparent"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isSkinDropdownOpen && displayedSkins.length > 0 && (
                    <div
                      onScroll={handleDropdownScroll}
                      className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 max-h-60 overflow-y-auto rounded-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {displayedSkins.map((skin) => (
                        <button
                          key={skin.uuid}
                          type="button"
                          onClick={() => selectSkin(skin)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900/50 cursor-pointer transition-colors text-xs font-bold text-left border-b border-zinc-900/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {skin.displayIcon ? (
                              <img src={skin.displayIcon} alt="" className="w-10 h-auto max-h-6 object-contain shrink-0" />
                            ) : (
                              <div className="w-10 h-6 bg-zinc-900 shrink-0" />
                            )}
                            <span className="text-zinc-300 hover:text-white truncate">{skin.displayName}</span>
                          </div>
                          {skin.contentTierUuid && TIER_ICONS[skin.contentTierUuid] && (
                            <img
                              src={TIER_ICONS[skin.contentTierUuid]}
                              alt=""
                              className="w-4 h-4 object-contain shrink-0 ml-2"
                            />
                          )}
                        </button>
                      ))}
                      {visibleSkinsCount < filteredSkins.length && (
                        <div className="px-4 py-2.5 text-center text-[10px] text-zinc-550 font-bold uppercase tracking-wider border-t border-zinc-900/40 animate-pulse bg-zinc-950">
                          Loading more skins...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Accessories Autocomplete Column */}
              <div className="flex flex-col gap-2" ref={accessoryDropdownRef}>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF4655]" /> SEARCH BY BUDDY, CARD, SPRAY
                </label>

                <div className="relative group">
                  <div
                    className="w-full bg-zinc-950 border border-zinc-800 focus-within:border-[#FF4655]/50 focus-within:ring-1 focus-within:ring-[#FF4655]/20 flex flex-wrap items-center gap-2 p-1 text-xs font-semibold rounded-md transition-all cursor-text min-h-[38px]"
                    onClick={() => accessoryInputRef.current?.focus()}
                  >
                    {/* Selected Accessories Chips inside the box */}
                    {selectedAccessoriesInput.map((acc) => (
                      <div
                        key={acc.uuid}
                        className="flex items-center gap-1.5 bg-[#FF4655]/10 border border-[#FF4655]/30 text-white pl-2 pr-1 py-1 text-[10px] font-black tracking-wider rounded-md shrink-0 select-none"
                      >
                        {acc.displayIcon && (
                          <img src={acc.displayIcon} alt="" className="h-3.5 w-auto object-contain shrink-0" />
                        )}
                        <span className="truncate max-w-[120px]">{acc.displayName}</span>
                        <span className="text-[8px] px-1 py-0.2 bg-black/40 text-zinc-400 rounded-sm scale-90">
                          {acc.type}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeAccessory(acc.uuid)
                          }}
                          className="text-zinc-550 hover:text-white p-0.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <input
                      ref={accessoryInputRef}
                      type="text"
                      placeholder={selectedAccessoriesInput.length === 0 ? "Type to search buddies, cards, sprays..." : ""}
                      value={accessorySearchQuery}
                      onFocus={() => {
                        setIsAccessoryDropdownOpen(true)
                        setIsSkinDropdownOpen(false)
                        setIsRegionDropdownOpen(false)
                        setIsRankDropdownOpen(false)
                        setIsSortDropdownOpen(false)
                      }}
                      onChange={(e) => {
                        setAccessorySearchQuery(e.target.value)
                        setIsAccessoryDropdownOpen(true)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && accessorySearchQuery === '' && selectedAccessoriesInput.length > 0) {
                          removeAccessory(selectedAccessoriesInput[selectedAccessoriesInput.length - 1].uuid)
                        }
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (displayedAccessories.length > 0) {
                            selectAccessory(displayedAccessories[0])
                          }
                        }
                      }}
                      className="flex-grow bg-transparent border-0 outline-none text-zinc-300 placeholder:text-zinc-655 min-w-[120px] p-0 focus:ring-0 focus:outline-none focus:border-transparent"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isAccessoryDropdownOpen && displayedAccessories.length > 0 && (
                    <div
                      onScroll={handleAccessoryDropdownScroll}
                      className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 max-h-60 overflow-y-auto rounded-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {displayedAccessories.map((acc) => (
                        <button
                          key={acc.uuid}
                          type="button"
                          onClick={() => selectAccessory(acc)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900/50 cursor-pointer transition-colors text-xs font-bold text-left border-b border-zinc-900/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {acc.displayIcon ? (
                              <img src={acc.displayIcon} alt="" className="w-10 h-auto max-h-6 object-contain shrink-0" />
                            ) : (
                              <div className="w-10 h-6 bg-zinc-900 shrink-0" />
                            )}
                            <span className="text-zinc-300 hover:text-white truncate">{acc.displayName}</span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded-sm font-semibold uppercase tracking-wider scale-90 border border-zinc-800">
                            {acc.type}
                          </span>
                        </button>
                      ))}
                      {visibleAccessoriesCount < filteredAccessories.length && (
                        <div className="px-4 py-2.5 text-center text-[10px] text-zinc-550 font-bold uppercase tracking-wider border-t border-zinc-900/40 animate-pulse bg-zinc-950">
                          Loading more accessories...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-zinc-900/60 mt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-6 py-2.5 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer rounded-md bg-zinc-950 h-[38px] text-center"
              >
                RESET FILTERS
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-2.5 bg-[#FF4655] hover:bg-[#ff5e6a] text-white text-xs font-black uppercase tracking-wider transition-all rounded-md shadow-[2px_2px_0px_0px_rgba(255,70,85,0.3)] hover:shadow-none cursor-pointer flex items-center justify-center gap-2 h-[38px]"
              >
                <Search className="w-4 h-4" />
                SEARCH
              </button>
            </div>
          </form>

          {/* Listings Section */}
          <div className="flex flex-col gap-8">

            {isLoadingListings ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] h-[55vh] gap-6 text-white">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#FF4655] border-r-transparent border-b-[#FF4655]/10 border-l-transparent animate-spin" />
                  <div className="absolute inset-4 bg-[#FF4655] rotate-45 animate-pulse rounded-[2px]" />
                </div>
                <span className="text-[10px] font-black tracking-[0.25em] text-[#FF4655] uppercase animate-pulse">
                  SYNCING MARKET DETAILS...
                </span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shopData?.listings.map((listing: any) => {
                    const account = listing.account
                    const detailData = account.data || {}

                    // Find card and rank details
                    const playerCardId = detailData.loadout?.Identity?.PlayerCardID
                    const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)
                    const rankTier = detailData.rank?.LatestCompetitiveUpdate?.TierAfterUpdate || 0
                    const rankInfo = getRankInfo(rankTier)

                    return (
                      <div
                        key={listing.id}
                        className="group relative bg-[#0f1923]/90 border border-zinc-800/80 hover:border-[#FF4655]/60 hover:bg-[#0f1923] transition-all duration-300 flex flex-col overflow-hidden shadow-xl"
                      >
                        {/* Card Top Splash (PlayerCard Image Background) */}
                        <div className="relative h-40 overflow-hidden shrink-0 bg-zinc-950">
                          {card?.wideArt || card?.displayIcon ? (
                            <img
                              src={card.wideArt || card.displayIcon}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 opacity-50" />
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-[#0f1923] via-[#0f1923]/30 to-black/60 z-1" />

                          {/* Info on Splash */}
                          <div className="absolute top-4 left-4 z-10 flex flex-col leading-tight">
                            <span className="text-white font-black text-sm uppercase group-hover:text-[#FF4655] transition-colors truncate max-w-[180px]">
                              {account.name}
                              <span className="text-zinc-400 font-bold ml-1 text-xs">#{account.tag}</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                              REGION: <span className="text-white uppercase font-black">{detailData.affinity || 'AP'}</span>
                            </span>
                          </div>

                          {/* Rank Display inside Splash */}
                          <div className="absolute bottom-2 right-4 z-10 flex items-center gap-2">
                            <div className="text-right">
                              <span className="block text-[8px] text-zinc-400 font-bold uppercase tracking-wider leading-none">RANK</span>
                              <span className="text-white font-heading text-xs font-black uppercase leading-none italic">{rankInfo?.displayName || 'Unranked'}</span>
                            </div>
                            {rankInfo?.smallIcon ? (
                              <img src={rankInfo.smallIcon} alt="" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,70,85,0.4)]" />
                            ) : (
                              <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[8px] text-zinc-500 font-black">N/A</div>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-4">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">LEVEL STATE</span>
                              <span className="text-white font-black text-xs italic uppercase tracking-wider mt-0.5">
                                {detailData.wallet ? 'Level Active' : 'Level N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">OWNED SKINS</span>
                              <span className="text-teal-400 font-black text-sm">{detailData.ownedSkinsCount || 0} Skins</span>
                            </div>
                          </div>

                          {/* Description Snippet */}
                          {listing.description ? (
                            <p className="text-zinc-400 text-xs line-clamp-2 h-8 leading-relaxed font-medium">
                              {listing.description}
                            </p>
                          ) : (
                            <p className="text-zinc-500 italic text-xs h-8">No detailed description provided by seller.</p>
                          )}

                          {/* Price and Details button */}
                          <div className="mt-auto pt-2 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">PRICE</span>
                              <span className="text-[#FF4655] font-black text-lg italic tracking-tight">{formatPrice(listing.price)}</span>
                            </div>

                            <Link
                              href={`/shop/${listing.id}`}
                              className="bg-[#FF4655] hover:bg-[#ff5e6a] text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-none shadow-[2px_2px_0px_0px_rgba(255,70,85,0.3)] hover:shadow-none cursor-pointer"
                            >
                              VIEW DETAILS
                            </Link>
                          </div>
                        </div>

                        {/* Accent Border Lines */}
                        <div className="absolute top-0 left-0 w-4 h-[2px] bg-[#FF4655]" />
                        <div className="absolute top-0 left-0 w-[2px] h-4 bg-[#FF4655]" />
                      </div>
                    )
                  })}
                </div>

                {/* Empty State */}
                {shopData?.listings.length === 0 && (
                  <div className="py-24 border border-zinc-800 bg-[#0f1923]/40 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-1 bg-zinc-700 mb-4" />
                    <h4 className="text-lg font-black uppercase text-white mb-2">NO ACCOUNTS FOUND</h4>
                    <p className="text-zinc-500 text-xs font-semibold max-w-sm">
                      Try adjusting your filters or search query to discover more Valorant accounts.
                    </p>
                  </div>
                )}

                {/* Pagination Controls */}
                {shopData && shopData.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-850 transition-all rounded-none cursor-pointer"
                    >
                      [ PREV ]
                    </button>

                    {Array.from({ length: shopData.totalPages }, (_, idx) => {
                      const pageNum = idx + 1
                      const isCurrent = page === pageNum
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 border text-xs font-black uppercase transition-all rounded-none cursor-pointer ${isCurrent
                            ? 'bg-[#FF4655] border-[#FF4655] text-white shadow-[2px_2px_0px_0px_rgba(255,70,85,0.3)]'
                            : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setPage(p => Math.min(shopData.totalPages, p + 1))}
                      disabled={page === shopData.totalPages}
                      className="px-4 py-2 border border-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-850 transition-all rounded-none cursor-pointer"
                    >
                      [ NEXT ]
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
