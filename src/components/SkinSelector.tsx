'use client'

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react'
import { TIER_RANKS, TIER_STYLES, TIER_ICONS, DEFAULT_STYLE } from '@/constants/valorant'

interface SkinSelectorProps {
  weapon: any
  ownedSkins: string[]
  loadout: any
  onClose: () => void
  initialSkinId?: string
}

export const SkinSelector = ({
  weapon,
  ownedSkins,
  loadout,
  onClose,
  initialSkinId,
}: SkinSelectorProps) => {
  const [selectedSkin, setSelectedSkin] = useState<any>(null)
  const [selectedLevel, setSelectedLevel] = useState<any>(null)
  const [selectedChroma, setSelectedChroma] = useState<any>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [filterTiers, setFilterTiers] = useState<string[]>([])
  const [hideUnowned, setHideUnowned] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // All skins for this weapon, sorted by tier
  const allWeaponSkins = [...weapon.skins].sort((a: any, b: any) => {
    const rankA = a.contentTierUuid ? (TIER_RANKS[a.contentTierUuid] || 0) : 0
    const rankB = b.contentTierUuid ? (TIER_RANKS[b.contentTierUuid] || 0) : 0
    return rankB - rankA
  })

  const checkOwned = (uuid: string) => {
    if (!uuid) return false
    return ownedSkins.some(ownedUuid => ownedUuid.toLowerCase() === uuid.toLowerCase())
  }

  const isSkinOwned = (skin: any) => {
    if (!skin) return false
    if (skin.displayName.includes('Standard') || skin.displayName === 'Melee') return true
    return skin.levels?.some((level: any) => checkOwned(level.uuid))
  }

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Computed skins based on filters and sorting
  const filteredSkins = allWeaponSkins.filter(skin => {
    // Search filter
    if (debouncedSearchQuery && !skin.displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false
    // Tier filter
    if (filterTiers.length > 0 && !filterTiers.includes(skin.contentTierUuid)) return false
    // Unowned filter
    if (hideUnowned && !isSkinOwned(skin)) return false
    return true
  }).sort((a: any, b: any) => {
    // 1. Sort by ownership (Owned first)
    const ownedA = isSkinOwned(a)
    const ownedB = isSkinOwned(b)
    if (ownedA !== ownedB) return ownedB ? 1 : -1

    // 2. Sort by tier rank
    const rankA = a.contentTierUuid ? (TIER_RANKS[a.contentTierUuid] || 0) : 0
    const rankB = b.contentTierUuid ? (TIER_RANKS[b.contentTierUuid] || 0) : 0
    if (rankA !== rankB) return rankB - rankA

    // 3. Alphabetical
    return a.displayName.localeCompare(b.displayName)
  })

  // Initial selection: Priority: initialSkinId (skin or level) > Equipped skin > First skin
  useEffect(() => {
    let skin = null
    let level = null
    let chroma = null

    if (initialSkinId) {
      // Try to find by skin uuid or level uuid
      skin = weapon.skins.find((s: any) => 
        s.uuid.toLowerCase() === initialSkinId.toLowerCase() || 
        s.levels?.some((l: any) => l.uuid.toLowerCase() === initialSkinId.toLowerCase())
      )
      
      if (skin) {
        // If found by level, select that level specifically
        level = skin.levels?.find((l: any) => l.uuid.toLowerCase() === initialSkinId.toLowerCase()) || skin.levels?.[skin.levels.length - 1]
        chroma = skin.chromas?.[0]
      }
    }

    if (!skin) {
      const equipped = loadout.Guns?.find((g: any) => g.ID?.toLowerCase() === weapon.uuid.toLowerCase())
      if (equipped) {
        skin = weapon.skins.find((s: any) => s.uuid.toLowerCase() === equipped.SkinID?.toLowerCase())
        if (skin) {
          level = skin.levels?.find((l: any) => l.uuid.toLowerCase() === equipped.LevelID?.toLowerCase()) || skin.levels?.[skin.levels.length - 1]
          chroma = skin.chromas?.find((c: any) => c.uuid.toLowerCase() === equipped.ChromaID?.toLowerCase()) || skin.chromas?.[0]
        }
      }
    }

    if (!skin) {
      skin = allWeaponSkins[0]
      level = skin?.levels?.[0]
      chroma = skin?.chromas?.[0]
    }

    setSelectedSkin(skin)
    setSelectedLevel(level)
    setSelectedChroma(chroma)
  }, [weapon.uuid, initialSkinId])

  if (!selectedSkin) return null

  const equippedForThisWeapon = loadout.Guns?.find((g: any) => g.ID?.toLowerCase() === weapon.uuid.toLowerCase())
  const isCurrentlyEquipped = equippedForThisWeapon &&
    equippedForThisWeapon.SkinID?.toLowerCase() === selectedSkin.uuid.toLowerCase() &&
    equippedForThisWeapon.ChromaID?.toLowerCase() === selectedChroma?.uuid.toLowerCase() &&
    equippedForThisWeapon.LevelID?.toLowerCase() === selectedLevel?.uuid.toLowerCase()

  const cardStyle = selectedSkin.contentTierUuid ? TIER_STYLES[selectedSkin.contentTierUuid] || DEFAULT_STYLE : DEFAULT_STYLE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 p-4 md:p-10">
      <div className="w-full h-full max-w-[1400px] bg-[#0f1923] border border-zinc-800 flex flex-col md:flex-row overflow-hidden relative shadow-2xl rounded-lg">

        {/* Header/Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-zinc-500 hover:text-white transition-colors z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Sidebar: Skin List */}
        <div className="w-[300px] border-right border-zinc-800 flex flex-col bg-zinc-900/50">
          <div className="p-6 border-b border-zinc-800 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-zinc-500 font-bold text-xs tracking-widest uppercase mb-1">Select Skin</h3>
                <div className="text-xl font-black uppercase text-white tracking-tighter leading-tight">
                  {weapon.displayName}
                </div>
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white group relative"
                title="Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="21" y2="21" /><line x1="4" x2="20" y1="14" y2="14" /><line x1="4" x2="20" y1="7" y2="7" />
                </svg>
                {(filterTiers.length > 0 || hideUnowned) && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full" />
                )}
              </button>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Search skins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-teal-500 transition-colors"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700">
            {filteredSkins.map((skin: any) => {
              const isSelected = selectedSkin.uuid === skin.uuid
              const isEquipped = equippedForThisWeapon?.SkinID?.toLowerCase() === skin.uuid.toLowerCase()
              const owned = isSkinOwned(skin)

              return (
                <div
                  key={skin.uuid}
                  onClick={() => {
                    setSelectedSkin(skin)
                    setSelectedLevel(skin.levels?.[skin.levels.length - 1])
                    setSelectedChroma(skin.chromas?.[0])
                  }}
                  className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${isSelected
                    ? 'bg-zinc-800 border-teal-500/50 shadow-lg'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30'
                    } ${!owned ? 'opacity-60' : ''}`}
                >
                  <div className="w-16 h-10 flex items-center justify-center">
                    <img
                      src={skin.chromas?.[0]?.fullRender || skin.displayIcon || skin.levels?.[0]?.displayIcon}
                      alt={skin.displayName}
                      className={`w-full h-auto object-contain transition-transform group-hover:scale-110 ${weapon.displayName === 'Melee' ? 'rotate-45' : ''}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-black truncate ${isSelected ? 'text-teal-400' : 'text-zinc-300'}`}>
                      {skin.displayName}
                    </div>
                  </div>
                  {isEquipped && (
                    <div className="w-1 h-1 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                  )}
                  {!owned && (
                    <div className="absolute top-1.5 right-1.5 text-zinc-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content: Selection & Preview */}
        <div className="flex-1 flex flex-col p-8 md:p-12 relative overflow-hidden">

          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            {selectedSkin.contentTierUuid && TIER_ICONS[selectedSkin.contentTierUuid] && (
              <img
                src={TIER_ICONS[selectedSkin.contentTierUuid]}
                alt="Tier"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] object-contain"
              />
            )}
          </div>

          {/* Floating Info */}
          <div className="relative z-10 flex items-center gap-4 mb-4">
            {selectedSkin.contentTierUuid && TIER_ICONS[selectedSkin.contentTierUuid] && (
              <img src={TIER_ICONS[selectedSkin.contentTierUuid]} alt="Tier" className="w-10 h-10" />
            )}
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
              {selectedSkin.displayName}
            </h2>
          </div>

          {/* Skin Render - Centered */}
          <div className="flex-1 flex items-center justify-center relative z-10 my-8">
            <img
              src={selectedChroma?.fullRender || selectedChroma?.displayIcon || selectedLevel?.displayIcon || selectedSkin.displayIcon}
              alt={selectedSkin.displayName}
              className={`w-full h-auto max-h-[400px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-700 animate-in zoom-in-95 ${weapon.displayName === 'Melee' ? 'rotate-45' : ''}`}
            />
          </div>

          {/* Selectors Row */}
          <div className="w-full flex flex-col gap-4 relative z-10">

            {/* Levels */}
            {selectedSkin.levels?.length > 1 && (
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Levels</h4>
                <div className="flex gap-3">
                  {selectedSkin.levels?.map((level: any, i: number) => {
                    const isOwned = checkOwned(level.uuid) || selectedSkin.displayName.includes('Standard') || selectedSkin.displayName === 'Melee'
                    const isSelected = selectedLevel?.uuid === level.uuid

                    return (
                      <button
                        key={level.uuid}
                        onClick={() => i <= (selectedSkin.levels.length - 1) && setSelectedLevel(level)}
                        className={`group relative w-10 h-10 flex items-center justify-center border transition-all duration-300 ${isSelected
                          ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                          : isOwned
                            ? 'border-zinc-700 hover:border-zinc-500 text-zinc-500'
                            : 'border-zinc-800 opacity-30 cursor-not-allowed'
                          }`}
                        title={level.displayName}
                      >
                        {isSelected ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-xs font-bold">{i + 1}</span>
                        )}
                        {!isOwned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Variants */}
            {selectedSkin.chromas?.length > 1 && (
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Variants</h4>
                <div className="flex gap-3">
                  {selectedSkin.chromas?.map((chroma: any) => {
                    const skinOwned = isSkinOwned(selectedSkin)
                    const isOwned = (skinOwned && (checkOwned(chroma.uuid) || chroma.uuid.toLowerCase() === selectedSkin.chromas[0].uuid.toLowerCase())) || selectedSkin.displayName.includes('Standard') || selectedSkin.displayName === 'Melee'
                    const isSelected = selectedChroma?.uuid === chroma.uuid

                    return (
                      <button
                        key={chroma.uuid}
                        onClick={() => setSelectedChroma(chroma)}
                        className={`w-12 h-12 border transition-all duration-300 p-0.5 ${isSelected
                          ? 'border-teal-500 scale-110 shadow-lg shadow-teal-500/20'
                          : 'border-zinc-800 hover:border-zinc-600'
                          } ${!isOwned && !isSelected ? 'opacity-40' : ''}`}
                      >
                        <div className="w-full h-full bg-zinc-800 relative overflow-hidden">
                          {chroma.swatch ? (
                            <img src={chroma.swatch} alt="Swatch" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <img src={chroma.displayIcon} alt="Icon" className="w-8 h-8 object-contain" />
                            </div>
                          )}
                          {!isOwned && (
                            <div className="absolute top-1 right-1 text-white drop-shadow-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Video Preview Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {selectedLevel?.streamedVideo && (
                <button
                  onClick={() => setPlayingVideo(selectedLevel.streamedVideo)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded text-teal-400 transition-all duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Level {selectedSkin.levels.indexOf(selectedLevel) + 1} Preview
                  </span>
                </button>
              )}
              {selectedChroma?.streamedVideo && (
                <button
                  onClick={() => setPlayingVideo(selectedChroma.streamedVideo)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300 transition-all duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Variant Preview</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Filter Modal Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-2xl bg-[#0f1923] border border-zinc-800 shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

            <div className="p-8 md:p-12 flex flex-col items-center">
              <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-8">Filters</h2>
              <div className="w-full h-px bg-zinc-800 relative mb-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border border-zinc-800 bg-[#0f1923]" />
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Rarity Section */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Filter by Rarity</h4>
                  <div className="flex flex-col gap-2">
                    {Object.entries(TIER_RANKS).sort((a, b) => a[1] - b[1]).map(([uuid, rank]) => {
                      const isSelected = filterTiers.includes(uuid)
                      const tierName = rank === 1 ? 'Select' : rank === 2 ? 'Deluxe' : rank === 3 ? 'Premium' : rank === 4 ? 'Exclusive' : 'Ultra'

                      return (
                        <button
                          key={uuid}
                          onClick={() => {
                            setFilterTiers(prev => prev.includes(uuid) ? prev.filter(t => t !== uuid) : [...prev, uuid])
                          }}
                          className={`flex items-center gap-4 p-3 border transition-all duration-200 ${isSelected ? 'bg-teal-500/10 border-teal-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                        >
                          <div className={`w-8 h-8 flex items-center justify-center border transition-colors ${isSelected ? 'border-teal-500/50 bg-teal-500/5' : 'border-zinc-800'}`}>
                            <div className={`w-2.5 h-2.5 rotate-45 border-2 transition-all ${isSelected ? 'border-teal-500' : 'border-zinc-700'}`} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{tierName} Edition</span>
                          <img src={TIER_ICONS[uuid]} alt="" className="w-6 h-6 ml-auto object-contain" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Show/Hide Section */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Hide / Show</h4>
                  <div className="space-y-4">
                    <button
                      onClick={() => setHideUnowned(!hideUnowned)}
                      className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Hide Unowned</span>
                      <div className={`w-10 h-5 border rounded-full relative transition-colors ${hideUnowned ? 'bg-teal-500 border-teal-500' : 'bg-zinc-800 border-zinc-700'}`}>
                        <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-2 transition-all ${hideUnowned ? 'left-6 border-white bg-white' : 'left-1 border-zinc-500 bg-zinc-700'}`} />
                      </div>
                    </button>
                  </div>
                </div>

              </div>

              <div className="mt-16 w-full flex justify-center">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-20 py-4 border-2 border-zinc-100 text-zinc-100 text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-100 hover:text-black transition-all shadow-[4px_4px_0_rgba(255,255,255,0.1)] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black shadow-2xl">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute -top-12 right-0 text-white/50 hover:text-white flex items-center gap-2 group transition-colors"
            >
              <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
            <video
              src={playingVideo}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
