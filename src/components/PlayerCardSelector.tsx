'use client'

import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { BaseDialog } from './BaseDialog'

export interface PlayerCard {
  uuid: string
  displayName: string
  displayIcon: string
  largeArt?: string
  wideArt?: string
  smallArt?: string
}

interface PlayerCardSelectorProps {
  playerCards: PlayerCard[]
  ownedCards: string[]
  equippedCardId?: string
  gameName?: string
  onClose: () => void
}

export const PlayerCardSelector = ({
  playerCards,
  ownedCards,
  equippedCardId,
  gameName,
  onClose,
}: PlayerCardSelectorProps) => {
  const [hideUnowned, setHideUnowned] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Cache ownedCards lookups in a Set for O(1) checks
  const ownedSet = useMemo(() => {
    return new Set((ownedCards || []).map(id => id?.toLowerCase()))
  }, [ownedCards])

  // Cache Standard card UUIDs in a Set for O(1) checks
  const standardSet = useMemo(() => {
    return new Set(
      (playerCards || [])
        .filter(c => c.displayName === 'Standard' || c.displayName?.includes('Standard'))
        .map(c => c.uuid.toLowerCase())
    )
  }, [playerCards])

  const checkOwned = useCallback((uuid: string) => {
    if (!uuid) return false
    const lower = uuid.toLowerCase()
    return standardSet.has(lower) || ownedSet.has(lower)
  }, [ownedSet, standardSet])

  const isEquipped = useCallback((uuid: string) => {
    if (!uuid || !equippedCardId) return false
    return uuid.toLowerCase() === equippedCardId.toLowerCase()
  }, [equippedCardId])

  // Initial selection: Priority: equipped card > first owned card > first card
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(() => {
    if (playerCards && playerCards.length > 0) {
      let initial = null
      if (equippedCardId) {
        initial = playerCards.find(c => c.uuid.toLowerCase() === equippedCardId.toLowerCase())
      }
      if (!initial) {
        const lowerOwned = new Set((ownedCards || []).map(id => id?.toLowerCase()))
        initial = playerCards.find(c => {
          const lower = c.uuid.toLowerCase()
          const isStandard = c.displayName === 'Standard' || c.displayName?.includes('Standard')
          return isStandard || lowerOwned.has(lower)
        })
      }
      if (!initial) {
        initial = playerCards[0]
      }
      return initial
    }
    return null
  })

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Computed cards based on filters and sorting
  const filteredCards = useMemo(() => {
    return (playerCards || [])
      .filter(card => {
        // Search filter
        if (debouncedSearchQuery && !card.displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false
        // Unowned filter
        if (hideUnowned && !checkOwned(card.uuid)) return false
        return true
      })
      .sort((a: PlayerCard, b: PlayerCard) => {
        // 1. Sort by equipped status
        const eqA = isEquipped(a.uuid)
        const eqB = isEquipped(b.uuid)
        if (eqA !== eqB) return eqB ? 1 : -1

        // 2. Sort by ownership (Owned first)
        const ownedA = checkOwned(a.uuid)
        const ownedB = checkOwned(b.uuid)
        if (ownedA !== ownedB) return ownedB ? 1 : -1

        // 3. Alphabetical
        return a.displayName.localeCompare(b.displayName)
      })
  }, [playerCards, debouncedSearchQuery, hideUnowned, checkOwned, isEquipped])

  if (!selectedCard) return null

  const isSelectedOwned = checkOwned(selectedCard.uuid)
  const isSelectedEquipped = isEquipped(selectedCard.uuid)

  return (
    <BaseDialog
      isOpen={true}
      onClose={onClose}
      maxWidth="full"
      title="Player Cards"
      description="Player Card Selector"
    >
      <div className="w-full h-[650px] md:h-[750px] flex flex-col md:flex-row overflow-hidden relative">
        {/* Sidebar: Card List */}
        <div className="w-full md:w-[420px] border-r border-zinc-800 flex flex-col bg-zinc-900/50 shadow-2xl h-1/2 md:h-full">
          <div className="p-5 border-b border-zinc-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-zinc-500 font-bold text-xs tracking-widest uppercase">Select Player Card</h3>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white group relative"
                title="Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="21" y2="21" /><line x1="4" x2="20" y1="14" y2="14" /><line x1="4" x2="20" y1="7" y2="7" />
                </svg>
                {hideUnowned && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full" />
                )}
              </button>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Search player cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md py-2.5 pl-10 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-inner"
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

          <CardList
            cards={filteredCards}
            selectedCard={selectedCard}
            checkOwned={checkOwned}
            isEquipped={isEquipped}
            onSelect={setSelectedCard}
          />
        </div>

        {/* Main Content: Preview Area */}
        <div className="flex-1 flex flex-col p-6 md:p-10 relative overflow-hidden bg-[#0a0a0c] h-1/2 md:h-full">
          {/* Decorative background grids */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

          {/* Card Info Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">
                {selectedCard.displayName}
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Valorant Player Card
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSelectedEquipped && (
                <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-teal-400 text-[10px] font-black uppercase tracking-widest">
                  Equipped Card
                </span>
              )}
              {!isSelectedOwned && (
                <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Locked / Not Owned
                </span>
              )}
              {isSelectedOwned && !isSelectedEquipped && (
                <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                  Owned
                </span>
              )}
            </div>
          </div>

          {/* Layout of card previews */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 relative z-10 overflow-y-auto">
            {/* Left: Large portrait card (Tall aspect ratio, standard Valorant style) */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">Portrait View (largeArt)</span>
              <div
                className="relative w-[180px] md:w-[200px] aspect-268/640 overflow-hidden bg-zinc-950 shadow-2xl animate-in zoom-in-95 duration-500"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 74%, 50% 94%, 0% 74%)" }}
              >
                <img
                  src={selectedCard.largeArt || selectedCard.displayIcon}
                  alt={selectedCard.displayName}
                  className="w-full h-full object-cover object-center"
                />

                {/* Name Banner */}
                <div className="absolute bottom-40 inset-x-0 bg-white py-1.5 px-3 text-center z-10 shadow-md">
                  <div className="text-zinc-950 font-black text-[11px] tracking-wider truncate">
                    {gameName || 'GAME NAME'}
                  </div>
                </div>

                {/* Stylized Border SVG overlay */}
                <svg
                  viewBox="0 0 268 640"
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                  preserveAspectRatio="none"
                >
                  {/* Main outer border */}
                  <polygon
                    points="1,1 267,1 267,474 134,602 1,474"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="2"
                  />

                  {/* Inflection Point Corner Bracket Accents (HUD style frame notches) */}
                  <path
                    d="M 6 454 L 2 458 L 2 474 L 14 485"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 262 454 L 266 458 L 266 474 L 254 485"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth="1.5"
                  />

                  {/* Technical Plus Crosshairs */}
                  <path
                    d="M 27 460 L 33 460 M 30 457 L 30 463"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                  />
                  <path
                    d="M 235 460 L 241 460 M 238 457 L 238 463"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                  />

                  {/* Spec / Tech HUD Text Labels */}
                  <text x="8" y="468" fill="rgba(255, 255, 255, 0.4)" fontSize="5.5" fontFamily="monospace" letterSpacing="0.8">SYS.LOC.02</text>
                  <text x="226" y="468" fill="rgba(255, 255, 255, 0.4)" fontSize="5.5" fontFamily="monospace" letterSpacing="0.8">V_8.09</text>
                  <text x="48" y="506" fill="rgba(255, 255, 255, 0.3)" fontSize="5" fontFamily="monospace">01</text>
                  <text x="214" y="506" fill="rgba(255, 255, 255, 0.3)" fontSize="5" fontFamily="monospace">02</text>

                  {/* 1. Inner double border following the bottom slant */}
                  <path
                    d="M 8 471 L 134 591 L 260 471"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1"
                  />

                  {/* Segmented Inner Accent Lines with dot ends */}
                  {/* Left slant details */}
                  <path d="M 22 481 L 52 510" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
                  <path d="M 62 520 L 92 549" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
                  <circle cx="22" cy="481" r="1.5" fill="white" opacity="0.75" />
                  <circle cx="92" cy="549" r="1.5" fill="white" opacity="0.75" />

                  {/* Right slant details */}
                  <path d="M 246 481 L 216 510" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
                  <path d="M 206 520 L 176 549" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
                  <circle cx="246" cy="481" r="1.5" fill="white" opacity="0.75" />
                  <circle cx="176" cy="549" r="1.5" fill="white" opacity="0.75" />

                  {/* Concentric Radar/Sonar Arcs connecting the slants */}
                  <path
                    d="M 98 567 A 50 50 0 0 1 170 567"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="1"
                    strokeDasharray="1.5 2.5"
                  />
                  <path
                    d="M 69 540 A 90 90 0 0 1 199 540"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M 40 512 A 130 130 0 0 1 228 512"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />

                  {/* 2. Dotted vertical centerline & measurement ticks */}
                  <line
                    x1="134"
                    y1="500"
                    x2="134"
                    y2="550"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <path d="M 130 510 L 138 510" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                  <path d="M 132 518 L 136 518" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                  <path d="M 130 526 L 138 526" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                  <path d="M 132 534 L 136 534" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                  <path d="M 130 542 L 138 542" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />

                  {/* 3. Concentric chevrons pointing down near the bottom vertex */}
                  <path
                    d="M 120 550 L 134 564 L 148 550"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 124 562 L 134 572 L 144 562"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 120 588 L 134 600 L 148 588"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.55)"
                    strokeWidth="1"
                  />

                  {/* Tiny Center Diamond Indicator */}
                  <polygon points="134,580 137,583 134,586 131,583" fill="rgba(255, 255, 255, 0.85)" />

                  {/* 4. Alternating inward/outward corner ticks on the left and right sides */}
                  {/* Inward Left Ticks */}
                  <line x1="30" y1="502" x2="35" y2="497" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="60" y1="531" x2="65" y2="526" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="90" y1="560" x2="95" y2="555" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

                  {/* Outward Left Ticks */}
                  <line x1="45" y1="517" x2="40" y2="522" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="75" y1="546" x2="70" y2="551" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="105" y1="575" x2="100" y2="580" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

                  {/* Inward Right Ticks */}
                  <line x1="238" y1="502" x2="233" y2="497" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="208" y1="531" x2="203" y2="526" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="178" y1="560" x2="173" y2="555" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

                  {/* Outward Right Ticks */}
                  <line x1="223" y1="517" x2="228" y2="522" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="193" y1="546" x2="198" y2="551" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <line x1="163" y1="575" x2="168" y2="580" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Right: Other formats (Wide banner and Mini Avatar) */}
            <div className="flex-1 w-full flex flex-col gap-6 max-w-lg">
              {/* Wide Art format */}
              {selectedCard.wideArt && (
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500">Wide Banner (wideArt)</span>
                  <div className="aspect-452/128 w-full bg-zinc-950 border border-zinc-800 roundedoverflow-hidden relative shadow-lg group">
                    <img
                      src={selectedCard.wideArt}
                      alt={selectedCard.displayName}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Small Art / Square format */}
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500">Avatar Icon (smallArt)</span>
                <div className="flex items-center gap-4 bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-lg">
                  <div className="size-16 rounded border border-zinc-700 overflow-hidden bg-zinc-950 shrink-0 shadow-md">
                    <img
                      src={selectedCard.smallArt || selectedCard.displayIcon}
                      alt={selectedCard.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white uppercase">{selectedCard.displayName}</div>
                    <div className="text-[9px] text-zinc-500">Standard display avatar format. Shown in user profiles, party lobbies and scoreboard headers.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal Overlay */}
      <BaseDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filters"
        maxWidth="xl"
        zIndex={1100}
      >
        <div className="p-8 flex flex-col items-center">
          <div className="w-full h-px bg-zinc-800 relative mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border border-zinc-800 bg-[#0f1923]" />
          </div>

          <div className="w-full space-y-6">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Filter Options</h4>
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

          <div className="mt-12 w-full flex justify-center">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="px-16 py-3 border-2 border-zinc-100 text-zinc-100 text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-100 hover:text-black transition-all shadow-[4px_4px_0_rgba(255,255,255,0.1)] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0"
            >
              Done
            </button>
          </div>
        </div>
      </BaseDialog>
    </BaseDialog>
  )
}

interface CardListProps {
  cards: PlayerCard[]
  selectedCard: PlayerCard | null
  checkOwned: (uuid: string) => boolean
  isEquipped: (uuid: string) => boolean
  onSelect: (card: PlayerCard) => void
}

const CardList = memo(({
  cards,
  selectedCard,
  checkOwned,
  isEquipped,
  onSelect,
}: CardListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-2.5 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700 transition-colors auto-rows-max">
      {cards.map((card: PlayerCard) => {
        const isSelected = selectedCard?.uuid === card.uuid
        const isCardEquipped = isEquipped(card.uuid)
        const owned = checkOwned(card.uuid)

        return (
          <div
            key={card.uuid}
            onClick={() => onSelect(card)}
            className={`relative flex flex-col border transition-all duration-300 cursor-pointer group overflow-hidden aspect-square bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-800/20 ${isSelected
              ? 'bg-teal-500/10 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.15)] z-10'
              : 'border-zinc-800/50 hover:border-zinc-700'
              } ${!owned ? 'opacity-40' : ''}`}
          >
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <img
                src={card.displayIcon}
                alt={card.displayName}
                loading="lazy"
                className="size-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Status Overlay */}
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10">
              {!owned && (
                <div className="text-zinc-400 bg-black/60 p-1 rounded-full backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              )}
              {isCardEquipped && (
                <div className="px-1 py-0.5 rounded text-[5px] font-bold bg-teal-500 text-black uppercase tracking-wider shadow-[0_0_6px_rgba(20,184,166,0.8)] border border-white/10">
                  Equipped
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
})

CardList.displayName = 'CardList'
