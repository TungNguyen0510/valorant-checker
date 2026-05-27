'use client'

import { useEffect, useState, useMemo, memo } from 'react'
import { BaseDialog } from './BaseDialog'

export interface PlayerCard {
  uuid: string
  displayName: string
  displayIcon: string
  largeArt?: string
  wideArt?: string
  smallArt?: string
}

interface VirtualPlayerCardSelectorProps {
  playerCards: PlayerCard[]
  equippedCardId?: string
  initialName?: string
  initialTag?: string
  onClose: () => void
  onEquip: (cardId: string, name: string, tag: string) => void
}

export const VirtualPlayerCardSelector = ({
  playerCards = [],
  equippedCardId,
  initialName = 'VIRTUAL_USER',
  initialTag = 'VIRTUAL',
  onClose,
  onEquip,
}: VirtualPlayerCardSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // State for username custom customization
  const [customName, setCustomName] = useState(initialName)
  const [customTag, setCustomTag] = useState(initialTag)

  // Initial selection
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(() => {
    if (playerCards && playerCards.length > 0) {
      if (equippedCardId) {
        const found = playerCards.find(c => c.uuid.toLowerCase() === equippedCardId.toLowerCase())
        if (found) return found
      }
      return playerCards[0]
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
    return playerCards
      .filter(card => {
        if (debouncedSearchQuery && !card.displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false
        return true
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [playerCards, debouncedSearchQuery])

  if (!selectedCard) return null

  const handleEquipClick = () => {
    onEquip(selectedCard.uuid, customName.trim() || 'VIRTUAL_USER', customTag.trim() || 'VIRTUAL')
    onClose()
  }

  return (
    <BaseDialog
      isOpen={true}
      onClose={onClose}
      maxWidth="full"
      title="Player Identity (Inventory Builder)"
      description="Select any player card and customize your name/tag"
    >
      <div className="w-full h-[650px] md:h-[750px] flex flex-col md:flex-row overflow-hidden relative">

        {/* Sidebar: Card List */}
        <div className="w-full md:w-[380px] border-r border-zinc-800 flex flex-col bg-zinc-900/50 shadow-2xl h-1/2 md:h-full">
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <h3 className="text-zinc-500 font-bold text-xs tracking-widest uppercase">Select Player Card</h3>

            <div className="relative group">
              <input
                type="text"
                placeholder="Search player cards..."
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

          <CardList
            cards={filteredCards}
            selectedCard={selectedCard}
            onSelect={setSelectedCard}
          />
        </div>

        {/* Main Content: Preview & Custom Identity Form */}
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-hidden bg-[#0c0c0e] h-1/2 md:h-full">
          {/* Grids background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between gap-4 mb-4 border-b border-zinc-800/80 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">
                {selectedCard.displayName}
              </h2>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                Player Card Customization
              </p>
            </div>
          </div>

          {/* Identity Form & Preview Grid */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 relative z-10 overflow-y-auto min-h-0">

            {/* Left: Custom Card Art Portrait */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
              <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-500">Portrait View</span>
              <div
                className="relative w-[150px] md:w-[170px] aspect-268/640 overflow-hidden bg-zinc-950 shadow-2xl rounded"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 74%, 50% 94%, 0% 74%)" }}
              >
                <img
                  src={selectedCard.largeArt || selectedCard.displayIcon}
                  alt={selectedCard.displayName}
                  className="w-full h-full object-cover object-center"
                />

                {/* Name Banner */}
                <div className="absolute bottom-40 inset-x-0 bg-white py-1.5 px-3 text-center z-10 shadow-md">
                  <div className="text-zinc-950 font-black text-[10px] tracking-wider truncate uppercase">
                    {customName.trim() || 'GAME NAME'}
                  </div>
                </div>

                {/* SVG Overlay HUD Frame */}
                <svg
                  viewBox="0 0 268 640"
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="1,1 267,1 267,474 134,602 1,474"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="2.5"
                  />
                  <path d="M 8 471 L 134 591 L 260 471" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
                  <path d="M 6 454 L 2 458 L 2 474 L 14 485" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" />
                  <path d="M 262 454 L 266 458 L 266 474 L 254 485" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" />
                  <text x="8" y="468" fill="rgba(255, 255, 255, 0.4)" fontSize="6" fontFamily="monospace">SYS.VIRT.01</text>
                  <text x="220" y="468" fill="rgba(255, 255, 255, 0.4)" fontSize="6" fontFamily="monospace">L_0AD.0UT</text>
                  <line x1="134" y1="500" x2="134" y2="550" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="2 3" />
                  <polygon points="134,580 137,583 134,586 131,583" fill="rgba(255, 255, 255, 0.75)" />
                </svg>
              </div>
            </div>

            {/* Right: Input fields & Banners */}
            <div className="flex-1 w-full flex flex-col gap-5 max-w-md">
              {/* Identity Form Controls */}
              <div className="bg-zinc-950/50 border border-zinc-800 rounded p-4 space-y-4 shadow-inner">
                <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-900 pb-2">Custom Username Setup</h4>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8.5px] text-zinc-400 font-bold uppercase tracking-wider">Player Name</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. TenZ"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FF4655] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8.5px] text-zinc-400 font-bold uppercase tracking-wider">Tagline</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-650 text-xs font-bold">#</span>
                      <input
                        type="text"
                        maxLength={5}
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="1234"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded py-2 pl-6 pr-2 text-xs text-white focus:outline-none focus:border-[#FF4655] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[8px] text-zinc-500 leading-normal uppercase font-bold tracking-wider">
                  Type a custom name and tagline. This is locally rendered on the portrait banner above and will be stored as the virtual profile username.
                </div>
              </div>

              {/* Wide Art Preview */}
              {selectedCard.wideArt && (
                <div className="flex flex-col gap-1.5 select-none">
                  <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-500">Wide Banner View</span>
                  <div className="aspect-452/128 w-full bg-zinc-950 border border-zinc-800/80 rounded overflow-hidden relative shadow-lg">
                    <img
                      src={selectedCard.wideArt}
                      alt={selectedCard.displayName}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              )}

              {/* Avatar Preview */}
              <div className="flex flex-col gap-1.5 select-none">
                <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-500">Avatar Icon</span>
                <div className="flex items-center gap-3.5 bg-zinc-950/20 border border-zinc-800/60 p-3 rounded">
                  <div className="w-14 h-14 rounded border border-zinc-750 overflow-hidden bg-zinc-950 shrink-0">
                    <img
                      src={selectedCard.smallArt || selectedCard.displayIcon}
                      alt={selectedCard.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white uppercase">{selectedCard.displayName}</div>
                    <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">#{customTag}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Save / Cancel Footer */}
          <div className="mt-5 flex justify-end gap-3 border-t border-zinc-800/80 pt-4 relative z-10">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:border-zinc-700 hover:text-white transition-all rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleEquipClick}
              className="px-10 py-2 bg-[#FF4655] hover:bg-[#ff5865] active:scale-95 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded shadow-lg shadow-[#FF4655]/20"
            >
              Equip & Save Identity
            </button>
          </div>

        </div>
      </div>
    </BaseDialog>
  )
}

interface CardListProps {
  cards: PlayerCard[]
  selectedCard: PlayerCard | null
  onSelect: (card: PlayerCard) => void
}

const CardList = memo(({
  cards,
  selectedCard,
  onSelect,
}: CardListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 scrollbar-thin scrollbar-thumb-zinc-800 auto-rows-max">
      {cards.map((card: PlayerCard) => {
        const isSelected = selectedCard?.uuid === card.uuid

        return (
          <div
            key={card.uuid}
            onClick={() => onSelect(card)}
            className={`relative flex flex-col border transition-all duration-300 cursor-pointer rounded group overflow-hidden aspect-square bg-zinc-950/40 ${isSelected
              ? 'bg-[#FF4655]/10 border-[#FF4655] shadow-[0_0_15px_rgba(255,70,85,0.15)] z-10'
              : 'border-zinc-850 hover:border-zinc-700'
              }`}
          >
            <div className="flex-1 flex items-center justify-center relative overflow-hidden p-1">
              <img
                src={card.displayIcon}
                alt={card.displayName}
                loading="lazy"
                className="size-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
})

CardList.displayName = 'CardList'
