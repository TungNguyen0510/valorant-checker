'use client'

import React, { useRef } from 'react'
import { TIER_ICONS } from '@/constants/valorant'

interface SkinItem {
  uuid: string
  displayName: string
  displayIcon: string
  contentTierUuid?: string
  chromas?: any[]
  levels?: any[]
  isMelee?: boolean
}

interface SkinsCarouselProps {
  skins: SkinItem[]
}

// Maps content tier UUID to premium styling tokens
const getTierStyle = (tierUuid?: string) => {
  const tierStyles: Record<string, { bg: string, border: string, text: string, shadow: string }> = {
    '411e4a55-4e59-7757-41f0-86a53f101bb5': {
      bg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
      border: 'border-yellow-500/20 hover:border-yellow-500/40',
      text: 'text-yellow-400',
      shadow: 'drop-shadow-[0_4px_8px_rgba(234,179,8,0.25)]'
    }, // Exclusive
    'e046854e-406c-37f4-6607-19a9ba8426fc': {
      bg: 'bg-orange-500/5 hover:bg-orange-500/10',
      border: 'border-orange-500/20 hover:border-orange-500/40',
      text: 'text-orange-400',
      shadow: 'drop-shadow-[0_4px_8px_rgba(249,115,22,0.25)]'
    }, // Ultra
    '60bca009-4182-7998-dee7-b8a2558dc369': {
      bg: 'bg-pink-500/5 hover:bg-pink-500/10',
      border: 'border-pink-500/20 hover:border-pink-500/40',
      text: 'text-pink-400',
      shadow: 'drop-shadow-[0_4px_8px_rgba(236,72,153,0.25)]'
    }, // Premium
    '0cebb8be-46d7-c12a-d306-e9907bfc5a25': {
      bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      text: 'text-emerald-400',
      shadow: 'drop-shadow-[0_4px_8px_rgba(16,185,129,0.25)]'
    }, // Deluxe
    '12683d76-48d7-84a3-4e09-6985794f0445': {
      bg: 'bg-blue-500/5 hover:bg-blue-500/10',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      text: 'text-blue-400',
      shadow: 'drop-shadow-[0_4px_8px_rgba(59,130,246,0.25)]'
    }, // Select
  }

  return tierStyles[tierUuid || ''] || {
    bg: 'bg-zinc-950/20 hover:bg-zinc-900/45',
    border: 'border-zinc-900/80 hover:border-zinc-800',
    text: 'text-zinc-400',
    shadow: 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]'
  }
}

export const SkinsCarousel = ({ skins }: SkinsCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  if (!skins || skins.length === 0) {
    return (
      <div className="h-32 bg-zinc-950/40 border border-dashed border-zinc-800/80 rounded-md flex flex-col items-center justify-center text-zinc-550 gap-1.5 p-4 text-[11px] font-bold uppercase tracking-wider select-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
        No premium skins owned
      </div>
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
  }

  const handleMouseLeave = () => {
    isDragging.current = false
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5 // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <div className="relative group/carousel bg-zinc-950/50 border border-zinc-800/50 p-2.5 flex flex-col justify-between h-40 rounded-md hover:border-zinc-700/60 transition-all duration-350 shadow-inner w-full">
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex flex-row overflow-x-auto gap-2 w-full flex-1 min-h-0 items-stretch scroll-smooth select-none pb-1 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-zinc-950/20 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
      >
        {skins.map((skin, idx) => {
          const displayIcon = skin?.chromas?.[0]?.displayIcon || skin?.displayIcon || skin?.levels?.[0]?.displayIcon
          const style = getTierStyle(skin.contentTierUuid)
          return (
            <div
              key={`${skin.uuid}-${idx}`}
              className={`flex flex-col border p-2 rounded-md transition-all duration-300 items-center justify-between min-w-[95px] w-[95px] shrink-0 h-full ${style.bg} ${style.border}`}
            >
              {/* Image Container */}
              <div className="flex-1 flex items-center justify-center w-full min-h-0 py-1">
                {displayIcon ? (
                  <img
                    src={displayIcon}
                    alt={skin.displayName}
                    draggable={false}
                    className={`max-h-12 max-w-full w-auto object-contain transition-transform duration-500 select-none ${style.shadow} hover:scale-105`}
                  />
                ) : (
                  <div className="text-zinc-750 text-[8px] uppercase font-bold tracking-wider">No Icon</div>
                )}
              </div>

              {/* Title & Tier */}
              <div className="w-full flex items-center gap-1 min-w-0 mt-1.5 justify-center border-t border-zinc-900/30 pt-1">
                {skin.contentTierUuid && TIER_ICONS[skin.contentTierUuid] && (
                  <img
                    src={TIER_ICONS[skin.contentTierUuid]}
                    alt=""
                    className="w-2.5 h-2.5 object-contain shrink-0 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                  />
                )}
                <span
                  className={`text-[8px] font-black truncate select-none leading-none max-w-full ${style.text}`}
                  title={skin.displayName}
                >
                  {skin.displayName.replace(/^(Select|Deluxe|Premium|Ultra|Exclusive)\s+/, '')}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Counter and label */}
      <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-zinc-900/60 text-zinc-500 text-[9px] font-bold">
        <span className="select-none text-[8px] font-black uppercase text-zinc-550">
          SHOWCASE
        </span>
        <span className="select-none tracking-wider text-teal-400">
          {skins.length} Skins
        </span>
      </div>
    </div>
  )
}
