'use client'

import { useEffect, useState, useMemo } from 'react'
/* eslint-disable @next/next/no-img-element */
import { BaseDialog } from './BaseDialog'
import { TIER_ICONS, TIER_RANKS } from '@/constants/valorant'

interface VirtualSkinSelectorProps {
  weapon: any
  loadout: any
  buddiesData: any[] | undefined
  onClose: () => void
  onEquip: (
    skinId: string,
    chromaId: string,
    levelId: string,
    buddyId: string | null,
    buddyLevelId: string | null
  ) => void
  initialSkinId?: string
}

export const VirtualSkinSelector = ({
  weapon,
  loadout,
  buddiesData = [],
  onClose,
  onEquip,
  initialSkinId,
}: VirtualSkinSelectorProps) => {
  const [selectedSkin, setSelectedSkin] = useState<any>(null)
  const [selectedLevel, setSelectedLevel] = useState<any>(null)
  const [selectedChroma, setSelectedChroma] = useState<any>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [filterTiers, setFilterTiers] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubTab, setActiveSubTab] = useState<'skin' | 'buddy'>('skin')

  // Buddy selection state
  const [selectedBuddy, setSelectedBuddy] = useState<any>(null)
  const [selectedBuddyLevel, setSelectedBuddyLevel] = useState<any>(null)
  const [buddySearchQuery, setBuddySearchQuery] = useState('')

  // All skins for this weapon, sorted by tier rank
  const allWeaponSkins = useMemo(() => {
    return [...weapon.skins].sort((a: any, b: any) => {
      const rankA = a.contentTierUuid ? (TIER_RANKS[a.contentTierUuid] || 0) : 0
      const rankB = b.contentTierUuid ? (TIER_RANKS[b.contentTierUuid] || 0) : 0
      return rankB - rankA
    })
  }, [weapon.skins])

  // Filtered skins based on search and tier filters
  const filteredSkins = useMemo(() => {
    return allWeaponSkins.filter(skin => {
      if (searchQuery && !skin.displayName.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterTiers.length > 0 && !filterTiers.includes(skin.contentTierUuid)) return false
      return true
    })
  }, [allWeaponSkins, searchQuery, filterTiers])

  // Filtered buddies based on buddy search query
  const filteredBuddies = useMemo(() => {
    if (!buddySearchQuery) return buddiesData
    return buddiesData.filter(buddy =>
      buddy.displayName.toLowerCase().includes(buddySearchQuery.toLowerCase())
    )
  }, [buddiesData, buddySearchQuery])

  // Load initial settings
  useEffect(() => {
    let skin = null
    let level = null
    let chroma = null
    let buddyObj = null
    let buddyLevelObj = null

    // 1. Determine initial Skin
    if (initialSkinId) {
      skin = weapon.skins.find((s: any) =>
        s.uuid.toLowerCase() === initialSkinId.toLowerCase() ||
        s.levels?.some((l: any) => l.uuid.toLowerCase() === initialSkinId.toLowerCase())
      )

      if (skin) {
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

        // Buddy
        if (equipped.CharmID) {
          buddyObj = buddiesData.find((b: any) => b.uuid.toLowerCase() === equipped.CharmID.toLowerCase())
          if (buddyObj) {
            buddyLevelObj = buddyObj.levels?.find((l: any) => l.uuid.toLowerCase() === equipped.CharmLevelID?.toLowerCase()) || buddyObj.levels?.[0]
          }
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
    setSelectedBuddy(buddyObj)
    setSelectedBuddyLevel(buddyLevelObj)
  }, [weapon.uuid, initialSkinId, loadout, buddiesData, allWeaponSkins])

  if (!selectedSkin) return null

  const handleEquipClick = () => {
    onEquip(
      selectedSkin.uuid,
      selectedChroma?.uuid || selectedSkin.chromas?.[0]?.uuid || '',
      selectedLevel?.uuid || selectedSkin.levels?.[0]?.uuid || '',
      selectedBuddy?.uuid || null,
      selectedBuddyLevel?.uuid || null
    )
    onClose()
  }

  return (
    <BaseDialog
      isOpen={true}
      onClose={onClose}
      maxWidth="full"
      title={`${weapon.displayName} (Inventory Builder)`}
      description="Select skin, variant, level, and buddy for your virtual inventory"
    >
      <div className="w-full h-[650px] md:h-[750px] flex flex-col md:flex-row overflow-hidden relative">

        {/* Sidebar: Skin List */}
        <div className="w-full md:w-[380px] border-r border-zinc-800 flex flex-col bg-zinc-900/50 shadow-2xl h-1/2 md:h-full">
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-zinc-500 font-bold text-xs tracking-widest uppercase">Select Skin</h3>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white relative"
                title="Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="21" y2="21" /><line x1="4" x2="20" y1="14" y2="14" /><line x1="4" x2="20" y1="7" y2="7" />
                </svg>
                {filterTiers.length > 0 && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[#FF4655] rounded-full" />
                )}
              </button>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Search skins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded py-2 pl-9 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-[#FF4655]/50 focus:ring-1 focus:ring-[#FF4655]/20 transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#FF4655] transition-colors"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 scrollbar-thin scrollbar-thumb-zinc-800 auto-rows-max">
            {filteredSkins.map((skin: any) => {
              const isSelected = selectedSkin.uuid === skin.uuid

              return (
                <div
                  key={skin.uuid}
                  onClick={() => {
                    setSelectedSkin(skin)
                    setSelectedLevel(skin.levels?.[skin.levels.length - 1])
                    setSelectedChroma(skin.chromas?.[0])
                  }}
                  className={`relative flex flex-col border transition-all duration-300 cursor-pointer group rounded overflow-hidden bg-zinc-950/40 ${isSelected
                    ? 'border-[#FF4655] bg-[#FF4655]/10 shadow-[0_0_15px_rgba(255,70,85,0.15)] z-10'
                    : 'border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-850'
                    }`}
                >
                  {/* Weapon Preview Area */}
                  <div className="aspect-4/3 flex items-center justify-center bg-black/40 overflow-hidden relative mb-1.5 p-1">
                    <img
                      src={skin.chromas?.[0]?.fullRender || skin.displayIcon || skin.levels?.[0]?.displayIcon}
                      alt={skin.displayName}
                      loading="lazy"
                      className={`w-[130%] h-auto max-w-none object-contain transition-transform duration-500 group-hover:scale-110 rotate-25 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${weapon.displayName === 'Melee' ? 'rotate-0' : ''}`}
                    />
                  </div>

                  {/* Info Area */}
                  <div className="px-2 pb-1.5 space-y-0.5">
                    <div className={`text-[9.5px] font-black tracking-tight line-clamp-1 leading-none ${isSelected ? 'text-[#FF4655]' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {skin.displayName.replace(weapon.displayName, '').trim() || skin.displayName}
                    </div>
                    {skin.contentTierUuid && (
                      <div className="flex items-center gap-1">
                        <img src={TIER_ICONS[skin.contentTierUuid]} alt="" className="w-2 h-2 object-contain" />
                        <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">
                          {TIER_RANKS[skin.contentTierUuid] === 1 ? 'Select' :
                            TIER_RANKS[skin.contentTierUuid] === 2 ? 'Deluxe' :
                              TIER_RANKS[skin.contentTierUuid] === 3 ? 'Premium' :
                                TIER_RANKS[skin.contentTierUuid] === 4 ? 'Exclusive' : 'Ultra'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content: Preview & Configuration */}
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-hidden bg-[#0c0c0e] h-1/2 md:h-full">
          {/* Grids background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none" />

          {/* Floating Info Header */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              {selectedSkin.contentTierUuid && TIER_ICONS[selectedSkin.contentTierUuid] && (
                <img src={TIER_ICONS[selectedSkin.contentTierUuid]} alt="Tier" className="w-8 h-8 object-contain" />
              )}
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">
                  {selectedSkin.displayName}
                </h2>
              </div>
            </div>

            {/* Sub-Tabs: Skin vs Buddy */}
            <div className="flex gap-2 bg-zinc-950 p-1 border border-zinc-800 rounded">
              <button
                onClick={() => setActiveSubTab('skin')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded ${activeSubTab === 'skin' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Skin Customization
              </button>
              {weapon.displayName !== 'Melee' && (
                <button
                  onClick={() => setActiveSubTab('buddy')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded ${activeSubTab === 'buddy' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Gun Buddy
                </button>
              )}
            </div>
          </div>

          {/* Configuration Sections */}
          <div className="flex-1 flex flex-col overflow-y-auto relative z-10">

            {activeSubTab === 'skin' ? (
              <div className="flex-1 flex flex-col justify-between">

                {/* Skin Render - Centered */}
                <div className="flex-1 flex items-center justify-center py-4 relative min-h-[180px]">
                  <img
                    src={selectedChroma?.fullRender || selectedChroma?.displayIcon || selectedLevel?.displayIcon || selectedSkin.displayIcon}
                    alt={selectedSkin.displayName}
                    className={`w-auto max-w-[60%] h-auto max-h-[120px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-all duration-500 ${weapon.displayName === 'Melee' ? 'rotate-45' : ''}`}
                  />

                  {/* Visual Buddy indicator if equipped */}
                  {selectedBuddy && (
                    <div className="absolute right-4 bottom-4 flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800 px-2.5 py-1 rounded backdrop-blur-md">
                      <img src={selectedBuddyLevel?.displayIcon || selectedBuddy.displayIcon} alt="" className="w-5 h-5 object-contain" />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{selectedBuddy.displayName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-5 border-t border-zinc-850 pt-5 px-2">
                  {/* Levels */}
                  {selectedSkin.levels?.length > 1 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Skin Level</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkin.levels.map((level: any, i: number) => {
                          const isSelected = selectedLevel?.uuid === level.uuid
                          return (
                            <button
                              key={level.uuid}
                              onClick={() => setSelectedLevel(level)}
                              className={`w-9 h-9 flex items-center justify-center border text-xs font-bold rounded transition-all duration-200 ${isSelected
                                ? 'border-[#FF4655] bg-[#FF4655]/10 text-[#FF4655] shadow-[0_0_10px_rgba(255,70,85,0.1)]'
                                : 'border-zinc-855 bg-zinc-900/30 text-zinc-400 hover:border-zinc-600 hover:text-white'
                                }`}
                              title={level.displayName}
                            >
                              {i + 1}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Variants */}
                  {selectedSkin.chromas?.length > 1 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Color Variant</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {selectedSkin.chromas.map((chroma: any, i: number) => {
                          const isSelected = selectedChroma?.uuid === chroma.uuid
                          return (
                            <button
                              key={chroma.uuid}
                              onClick={() => setSelectedChroma(chroma)}
                              className={`w-10 h-10 border rounded transition-all duration-200 p-0.5 ${isSelected
                                ? 'border-[#FF4655] scale-105 shadow-md shadow-[#FF4655]/15'
                                : 'border-zinc-850 hover:border-zinc-600 bg-zinc-900/20'
                                }`}
                              title={chroma.displayName}
                            >
                              <div className="w-full h-full bg-zinc-800 rounded-sm relative overflow-hidden">
                                {chroma.swatch ? (
                                  <img src={chroma.swatch} alt="Swatch" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <img src={chroma.displayIcon} alt="Icon" className="w-6 h-6 object-contain" />
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Video Previews */}
                  <div className="flex flex-wrap gap-2">
                    {selectedLevel?.streamedVideo && (
                      <button
                        onClick={() => setPlayingVideo(selectedLevel.streamedVideo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4655]/10 hover:bg-[#FF4655]/20 border border-[#FF4655]/30 rounded text-[#FF4655] transition-all text-[9.5px] font-black uppercase tracking-widest"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                        Level {selectedSkin.levels.indexOf(selectedLevel) + 1} Video
                      </button>
                    )}
                    {selectedChroma?.streamedVideo && (
                      <button
                        onClick={() => setPlayingVideo(selectedChroma.streamedVideo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 rounded text-zinc-300 transition-all text-[9.5px] font-black uppercase tracking-widest"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                        Variant Video
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Buddy Setup Area */}
                <div className="flex items-center justify-between gap-4 bg-zinc-950/40 border border-zinc-800/80 p-3 rounded mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded border border-zinc-750 bg-zinc-950 flex items-center justify-center shrink-0">
                      {selectedBuddy ? (
                        <img src={selectedBuddyLevel?.displayIcon || selectedBuddy.displayIcon} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="text-zinc-600 text-xs font-bold">None</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Equipped Buddy</div>
                      <div className="text-xs font-black text-white">{selectedBuddy?.displayName || 'No Gun Buddy Equipped'}</div>
                    </div>
                  </div>
                  {selectedBuddy && (
                    <button
                      onClick={() => {
                        setSelectedBuddy(null)
                        setSelectedBuddyLevel(null)
                      }}
                      className="px-3 py-1.5 bg-zinc-850 border border-zinc-750 hover:border-[#FF4655] hover:text-[#FF4655] rounded text-zinc-400 text-[9px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Remove Buddy
                    </button>
                  )}
                </div>

                {/* Search & Grid for buddies */}
                <div className="mb-3 relative">
                  <input
                    type="text"
                    placeholder="Search gun buddies..."
                    value={buddySearchQuery}
                    onChange={(e) => setBuddySearchQuery(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-850 rounded py-2 pl-9 pr-3 text-xs text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:border-[#FF4655]/40 focus:ring-1 focus:ring-[#FF4655]/10"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-655"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 border border-zinc-850 p-2 rounded bg-zinc-950/20 max-h-[300px]">
                  {filteredBuddies.map((buddy: any) => {
                    const isBuddySelected = selectedBuddy?.uuid === buddy.uuid
                    return (
                      <div
                        key={buddy.uuid}
                        onClick={() => {
                          setSelectedBuddy(buddy)
                          setSelectedBuddyLevel(buddy.levels?.[0] || null)
                        }}
                        className={`group relative flex flex-col items-center p-2 border rounded cursor-pointer transition-all hover:bg-zinc-900/30 ${isBuddySelected
                          ? 'border-[#FF4655] bg-[#FF4655]/5'
                          : 'border-zinc-850/60 hover:border-zinc-700'
                          }`}
                      >
                        <img src={buddy.displayIcon} alt="" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-[8px] font-bold text-zinc-400 text-center line-clamp-2 mt-1 uppercase tracking-wider leading-tight w-full">
                          {buddy.displayName}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Buddy levels if buddy has multiple levels */}
                {selectedBuddy?.levels?.length > 1 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Buddy Style/Variant</h4>
                    <div className="flex gap-2">
                      {selectedBuddy.levels.map((level: any, idx: number) => {
                        const isLevelSelected = selectedBuddyLevel?.uuid === level.uuid
                        return (
                          <button
                            key={level.uuid}
                            onClick={() => setSelectedBuddyLevel(level)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 border rounded text-[9px] font-bold transition-all ${isLevelSelected
                              ? 'border-[#FF4655] bg-[#FF4655]/10 text-white'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                              }`}
                          >
                            <img src={level.displayIcon} alt="" className="w-4 h-4 object-contain" />
                            Style {idx + 1}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions Footer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-850 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:border-zinc-650 hover:text-white transition-all rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEquipClick}
                className="px-10 py-2.5 bg-[#FF4655] hover:bg-[#ff5865] active:scale-95 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded shadow-lg shadow-[#FF4655]/20"
              >
                Equip
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Rarity filter popup */}
      <BaseDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Rarity Filters"
        maxWidth="xl"
        zIndex={1100}
      >
        <div className="p-6 flex flex-col items-center">
          <div className="w-full h-px bg-zinc-800 relative mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border border-zinc-800 bg-[#0f1923]" />
          </div>

          <div className="w-full space-y-4">
            <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Filter by Edition</h4>
            <div className="flex flex-col gap-1.5">
              {Object.entries(TIER_RANKS).sort((a, b) => a[1] - b[1]).map(([uuid, rank]) => {
                const isSelected = filterTiers.includes(uuid)
                const tierName = rank === 1 ? 'Select' : rank === 2 ? 'Deluxe' : rank === 3 ? 'Premium' : rank === 4 ? 'Exclusive' : 'Ultra'

                return (
                  <button
                    key={uuid}
                    onClick={() => {
                      setFilterTiers(prev => prev.includes(uuid) ? prev.filter(t => t !== uuid) : [...prev, uuid])
                    }}
                    className={`flex items-center gap-3 p-2.5 border rounded transition-all duration-200 ${isSelected ? 'bg-[#FF4655]/5 border-[#FF4655]/40' : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center border transition-colors ${isSelected ? 'border-[#FF4655]/50 bg-[#FF4655]/5' : 'border-zinc-800'}`}>
                      <div className={`w-2 h-2 rotate-45 border-2 transition-all ${isSelected ? 'border-[#FF4655] bg-[#FF4655]' : 'border-zinc-700'}`} />
                    </div>
                    <span className={`text-[9.5px] font-bold uppercase tracking-widest ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{tierName} Edition</span>
                    <img src={TIER_ICONS[uuid]} alt="" className="w-5 h-5 ml-auto object-contain" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 w-full flex justify-center">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="px-14 py-2.5 border-2 border-zinc-100 text-zinc-100 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-100 hover:text-black transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </BaseDialog>

      {/* Video Preview Popup */}
      <BaseDialog
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        maxWidth="7xl"
        zIndex={1200}
        showCloseButton={true}
      >
        <div className="relative w-full aspect-video bg-black rounded shadow-2xl">
          <video
            src={playingVideo || ''}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        </div>
      </BaseDialog>
    </BaseDialog>
  )
}
