'use client'

import { useState, useMemo } from 'react'
import { SkinCard } from './SkinCard'
import { VPIcon } from './Icons'
import { TIER_ICONS, TIER_PRICES, adjustSpecialSkinPrice } from '@/constants/valorant'
import { motion, AnimatePresence } from 'framer-motion'
import { DeleteIcon } from 'lucide-react'

interface OwnedSkinsGridProps {
  weaponsData: any[] | undefined
  ownedSkins: string[]
  contractsData?: any[]
  onSkinClick: (weapon: any, skinId: string) => void
  skinPricesData?: Record<string, number>
}


const TIER_NAMES: Record<string, string> = {
  '12683d76-48d7-84a3-4e09-6985794f0445': 'Select',
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 'Deluxe',
  '60bca009-4182-7998-dee7-b8a2558dc369': 'Premium',
  'e046854e-406c-37f4-6607-19a9ba8426fc': 'Ultra',
  '411e4a55-4e59-7757-41f0-86a53f101bb5': 'Exclusive',
}

const WEAPON_CATEGORIES = [
  'Sidearms',
  'SMGs',
  'Shotguns',
  'Rifles',
  'Sniper Rifles',
  'Machine Guns',
  'Melee'
]

const getWeaponCategory = (displayName: string): string => {
  const name = displayName.toLowerCase()
  if (['classic', 'shorty', 'frenzy', 'ghost', 'bandit', 'sheriff'].includes(name)) return 'Sidearms'
  if (['stinger', 'spectre'].includes(name)) return 'SMGs'
  if (['bucky', 'judge'].includes(name)) return 'Shotguns'
  if (['bulldog', 'guardian', 'phantom', 'vandal'].includes(name)) return 'Rifles'
  if (name === 'melee') return 'Melee'
  if (['marshal', 'outlaw', 'operator'].includes(name)) return 'Sniper Rifles'
  if (['ares', 'odin'].includes(name)) return 'Machine Guns'
  return 'Others'
}

export const OwnedSkinsGrid = ({
  weaponsData,
  ownedSkins,
  contractsData = [],
  onSkinClick,
  skinPricesData = {},
}: OwnedSkinsGridProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'priceDesc' | 'priceAsc' | 'nameAsc' | 'tierDesc'>('priceDesc')
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Extract all contract reward skin level UUIDs to check for Battlepass / Agent Contract skins
  const contractSkinLevelUuids = useMemo(() => {
    const uuids = new Set<string>()
    if (contractsData) {
      contractsData.forEach((contract: any) => {
        if (contract.content && contract.content.chapters) {
          contract.content.chapters.forEach((chapter: any) => {
            if (chapter.levels) {
              chapter.levels.forEach((level: any) => {
                if (level.reward && (level.reward.type === 'EquippableSkinLevel' || level.reward.type === 'SkinLevel')) {
                  uuids.add(level.reward.uuid.toLowerCase())
                }
              })
            }
            if (chapter.freeRewards) {
              chapter.freeRewards.forEach((reward: any) => {
                if (reward && (reward.type === 'EquippableSkinLevel' || reward.type === 'SkinLevel')) {
                  uuids.add(reward.uuid.toLowerCase())
                }
              })
            }
          })
        }
      })
    }
    return uuids
  }, [contractsData])

  // Get list of all owned skins with resolved prices and categories
  const allOwnedSkins = useMemo(() => {
    if (!weaponsData) return []
    const list: any[] = []

    weaponsData.forEach((weapon: any) => {
      const isMelee = weapon.displayName === 'Melee'
      const category = getWeaponCategory(weapon.displayName)

      weapon.skins?.forEach((skin: any) => {
        // Skip standard/default skins
        if (skin.displayName.includes('Standard') || skin.displayName === 'Melee') {
          return
        }

        // A skin is owned if any of its levels is in ownedSkins list
        const isOwned = skin.levels?.some((level: any) =>
          ownedSkins.some((ownedUuid: string) => ownedUuid.toLowerCase() === level.uuid.toLowerCase())
        )

        if (isOwned) {
          // Check if the skin is a contract reward (Battlepass or Agent Contract)
          const isContractReward = skin.levels?.some((level: any) =>
            contractSkinLevelUuids.has(level.uuid.toLowerCase())
          )

          let price = 0
          if (!isContractReward) {
            const fetchedPrice = skinPricesData[skin.uuid.toLowerCase()]
            if (typeof fetchedPrice === 'number') {
              price = fetchedPrice
            } else if (skin.contentTierUuid) {
              const prices = TIER_PRICES[skin.contentTierUuid]
              if (prices) {
                price = isMelee ? prices.melee : prices.weapon
              }
            }
          }
          price = adjustSpecialSkinPrice(price, skin.displayName)

          list.push({
            ...skin,
            weapon,
            price,
            category,
            isMelee,
            isContractReward,
          })
        }
      })
    })

    return list
  }, [weaponsData, ownedSkins, contractSkinLevelUuids])

  // Compute total statistics
  const stats = useMemo(() => {
    let totalVP = 0
    let premiumCount = 0
    let battlepassCount = 0
    const tierCounts: Record<string, number> = {}

    allOwnedSkins.forEach((item) => {
      if (item.isContractReward) {
        battlepassCount++
      } else {
        premiumCount++
        totalVP += item.price
      }

      // Increment tierCounts for all skins (including Select/Deluxe battlepass/reward skins)
      if (item.contentTierUuid) {
        tierCounts[item.contentTierUuid] = (tierCounts[item.contentTierUuid] || 0) + 1
      }
    })

    return {
      totalVP,
      premiumCount,
      battlepassCount,
      totalCount: allOwnedSkins.length,
      tierCounts,
    }
  }, [allOwnedSkins])

  // Filter and sort skins
  const processedSkins = useMemo(() => {
    let list = [...allOwnedSkins]

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      list = list.filter(
        (item) =>
          item.displayName.toLowerCase().includes(query) ||
          item.weapon.displayName.toLowerCase().includes(query)
      )
    }

    // Rarity tier filter
    if (selectedTiers.length > 0) {
      list = list.filter((item) => item.contentTierUuid && selectedTiers.includes(item.contentTierUuid))
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter((item) => item.category === selectedCategory)
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'priceDesc') {
        return b.price - a.price || a.displayName.localeCompare(b.displayName)
      }
      if (sortBy === 'priceAsc') {
        return a.price - b.price || a.displayName.localeCompare(b.displayName)
      }
      if (sortBy === 'nameAsc') {
        return a.displayName.localeCompare(b.displayName)
      }
      if (sortBy === 'tierDesc') {
        const getTierWeight = (tierUuid: string | undefined) => {
          if (!tierUuid) return 0
          const order = [
            '12683d76-48d7-84a3-4e09-6985794f0445', // Select
            '0cebb8be-46d7-c12a-d306-e9907bfc5a25', // Deluxe
            '60bca009-4182-7998-dee7-b8a2558dc369', // Premium
            '411e4a55-4e59-7757-41f0-86a53f101bb5', // Exclusive
            'e046854e-406c-37f4-6607-19a9ba8426fc', // Ultra
          ]
          return order.indexOf(tierUuid) + 1
        }
        return getTierWeight(b.contentTierUuid) - getTierWeight(a.contentTierUuid) || a.displayName.localeCompare(b.displayName)
      }
      return 0
    })

    return list
  }, [allOwnedSkins, searchQuery, selectedTiers, selectedCategory, sortBy])

  const toggleTier = (tierUuid: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tierUuid) ? prev.filter((id) => id !== tierUuid) : [...prev, tierUuid]
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedTiers([])
    setSelectedCategory(null)
  }

  const isFiltered = searchQuery || selectedTiers.length > 0 || selectedCategory !== null

  const sortOptions = [
    { value: 'priceDesc', label: 'Price: High to Low' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'tierDesc', label: 'Rarity Tier' },
    { value: 'nameAsc', label: 'Name: A to Z' }
  ]
  const activeSortLabel = sortOptions.find(o => o.value === sortBy)?.label

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Stats Summary Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Value */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -3, borderColor: 'rgba(20, 184, 166, 0.3)' }}
          className="bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden"
        >
          <div>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Premium Skins Value</span>
            <div className="flex items-center gap-2 mt-2">
              <VPIcon className="w-5 h-5 text-white" />
              <span className="text-2xl font-black text-white leading-none">
                {stats.totalVP.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-650 font-medium mt-3 border-t border-zinc-800/30 pt-2 z-10">
            Calculated from premium store tiers
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/8 transition-colors duration-500" />
        </motion.div>

        {/* Total Owned Skins */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -3, borderColor: 'rgba(20, 184, 166, 0.3)' }}
          className="bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden"
        >
          <div>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Skins Collected</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-teal-400 leading-none">
                {stats.totalCount}
              </span>
              <span className="text-xs text-zinc-500 font-bold">Total</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-650 font-medium mt-3 border-t border-zinc-800/30 pt-2 flex justify-between z-10">
            <span>Premium: {stats.premiumCount}</span>
            <span>Battlepass: {stats.battlepassCount}</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/8 transition-colors duration-500" />
        </motion.div>

        {/* Tier Distribution Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -3, borderColor: 'rgba(20, 184, 166, 0.3)' }}
          className="sm:col-span-2 bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden"
        >
          <div>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Rarity Distribution</span>
            <div className="flex flex-wrap gap-x-3.5 gap-y-2 mt-3">
              {Object.entries(TIER_NAMES).map(([uuid, name]) => {
                const count = stats.tierCounts[uuid] || 0
                return (
                  <div key={uuid} className="flex items-center gap-2 bg-black/45 px-2.5 py-1 border border-zinc-900 rounded-none shadow-sm">
                    {TIER_ICONS[uuid] && (
                      <img src={TIER_ICONS[uuid]} alt="" className="w-3.5 h-3.5 object-contain" />
                    )}
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{name}:</span>
                    <span className="text-[10px] text-white font-black">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="text-[10px] text-zinc-650 font-medium mt-3 border-t border-zinc-800/30 pt-2 z-10">
            Distribution across all weapon tiers
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/8 transition-colors duration-500" />
        </motion.div>

      </div>

      {/* Control Panel (Search, Filters, Sort) */}
      <div className="bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 p-4 flex flex-col gap-4 relative z-20">

        {/* Row 1: Search & Custom Sort Dropdown */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between z-40">

          {/* Search Input */}
          <div className="relative w-full md:w-96 group">
            <input
              type="text"
              placeholder="Search owned skins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2.5 pl-10 pr-10 text-xs text-zinc-300 placeholder:text-zinc-655 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-inner focus:bg-zinc-950"
            />
            <svg
              xmlns="http://www.w3.org/2500/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-teal-400 transition-colors duration-300 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Custom Sort Dropdown */}
          <div className="relative w-full md:w-56 shrink-0 z-40">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 hover:border-teal-500/40 focus:border-teal-500/50 text-xs font-bold text-zinc-300 px-4 py-2.5 transition-all cursor-pointer select-none rounded-md shadow-inner focus:outline-none focus:ring-1 focus:ring-teal-500/20"
            >
              <div className="flex flex-col items-start leading-none py-0.5">
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Sort By</span>
                <span className="leading-tight">{activeSortLabel}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`text-zinc-555 transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-teal-400' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <AnimatePresence>
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 rounded-md overflow-hidden"
                  >
                    {sortOptions.map((opt) => {
                      const isSelected = opt.value === sortBy
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value as any)
                            setIsSortOpen(false)
                          }}
                          className={`w-full text-left px-4 py-3 text-xs font-bold transition-all duration-150 border-l-2 ${isSelected
                            ? 'bg-teal-500/10 border-teal-500 text-white'
                            : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                            }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Row 2: Rarity Filter Row */}
        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-900/60 pt-3 z-10">
          <span className="text-[9px] text-zinc-555 font-bold tracking-widest mr-1">Rarity:</span>
          {Object.entries(TIER_NAMES).map(([uuid, name]) => {
            const isSelected = selectedTiers.includes(uuid)

            return (
              <motion.button
                key={uuid}
                onClick={() => toggleTier(uuid)}
                whileHover={{ scale: 1.02, y: -0.5 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 px-3 py-1.5 border text-[10px] font-black tracking-wider transition-all duration-200 cursor-pointer select-none rounded group
                  ${isSelected
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.12)]'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  }
                `}
              >
                {TIER_ICONS[uuid] && (
                  <img
                    src={TIER_ICONS[uuid]}
                    alt=""
                    className={`w-3.5 h-3.5 object-contain transition-all duration-250 ${isSelected ? 'scale-110 opacity-100' : 'opacity-40 group-hover:opacity-90 group-hover:scale-105'}`}
                  />
                )}
                <span>{name}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Row 3: Category Filter Row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-900/60 pt-3 z-10">
          <span className="text-[9px] text-zinc-555 font-bold tracking-widest mr-1">Weapon:</span>

          <motion.button
            onClick={() => setSelectedCategory(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              px-3.5 py-2 border text-[10px] font-black tracking-wider transition-all duration-200 cursor-pointer select-none rounded
              ${selectedCategory === null
                ? 'border-teal-500/50 bg-teal-500/10 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.12)]'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-400 hover:text-white'
              }
            `}
          >
            All Weapons
          </motion.button>

          {WEAPON_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-3.5 py-2 border text-[10px] font-black tracking-wider transition-all duration-200 cursor-pointer select-none rounded
                  ${isSelected
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.12)]'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  }
                `}
              >
                {cat}
              </motion.button>
            )
          })}

          {/* Reset Filters */}
          {isFiltered && (
            <motion.button
              onClick={resetFilters}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-auto text-[9px] text-[#FF4655] font-black uppercase tracking-wider hover:underline p-1.5 flex items-center gap-1.5 cursor-pointer select-none"
            >
              Clear Filters
              <DeleteIcon />
            </motion.button>
          )}

        </div>

      </div>

      {/* Grid of Skin Cards with smooth layout transition */}
      {processedSkins.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 relative z-10"
        >
          <AnimatePresence mode="popLayout">
            {processedSkins.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                key={item.uuid}
                className="flex flex-col group relative overflow-hidden"
              >
                <SkinCard
                  skin={item}
                  price={item.price}
                  onClick={() => onSkinClick(item.weapon, item.uuid)}
                />
                {/* Overlay Weapon Name badge on the card */}
                <span className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs border border-zinc-800/80 text-zinc-400 text-[8px] font-black tracking-widest px-2.5 py-1 pointer-events-none select-none z-20 group-hover:border-teal-500/40 group-hover:text-teal-400 transition-colors duration-300">
                  {item.weapon.displayName}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-zinc-950/30 border border-zinc-900/80 py-24 flex flex-col items-center justify-center text-center px-4 relative z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-zinc-655 mb-3"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">No skins found</h3>
          <p className="text-zinc-555 text-xs mt-1">Try adjusting your filters or search query.</p>
          {isFiltered && (
            <motion.button
              onClick={resetFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 border border-[#FF4655] hover:bg-[#FF4655] text-white text-[10px] font-black uppercase tracking-widest transition-colors duration-300 cursor-pointer select-none rounded"
            >
              Reset Filters
            </motion.button>
          )}
        </div>
      )}

    </div>
  )
}
