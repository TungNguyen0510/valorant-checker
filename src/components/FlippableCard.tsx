'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TIER_STYLES, DEFAULT_STYLE } from '@/constants/valorant'

interface FlippableCardProps {
  isRevealed: boolean
  onReveal: () => void
  contentTierUuid?: string
  isNightMarket?: boolean
  className?: string
  children: React.ReactNode
}

const TIER_COLORS: Record<string, { border: string, glow: string, ring: string }> = {
  // Exclusive (Gold/Orange)
  '411e4a55-4e59-7757-41f0-86a53f101bb5': {
    border: 'border-amber-500/60 hover:border-amber-400',
    glow: 'bg-amber-500/10',
    ring: 'shadow-[inset_0_0_25px_rgba(245,158,11,0.15)] shadow-amber-500/10'
  },
  // Ultra (Yellow)
  'e046854e-406c-37f4-6607-19a9ba8426fc': {
    border: 'border-yellow-500/60 hover:border-yellow-400',
    glow: 'bg-yellow-500/10',
    ring: 'shadow-[inset_0_0_25px_rgba(234,179,8,0.15)] shadow-yellow-500/10'
  },
  // Premium (Pink/Purple)
  '60bca009-4182-7998-dee7-b8a2558dc369': {
    border: 'border-pink-500/60 hover:border-pink-400',
    glow: 'bg-pink-500/10',
    ring: 'shadow-[inset_0_0_25px_rgba(236,72,153,0.15)] shadow-pink-500/10'
  },
  // Deluxe (Green)
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': {
    border: 'border-emerald-500/60 hover:border-emerald-400',
    glow: 'bg-emerald-500/10',
    ring: 'shadow-[inset_0_0_25px_rgba(16,185,129,0.15)] shadow-emerald-500/10'
  },
  // Select (Blue)
  '12683d76-48d7-84a3-4e09-6985794f0445': {
    border: 'border-blue-500/60 hover:border-blue-400',
    glow: 'bg-blue-500/10',
    ring: 'shadow-[inset_0_0_25px_rgba(59,130,246,0.15)] shadow-blue-500/10'
  }
}

const DEFAULT_COLORS = {
  border: 'border-zinc-800 hover:border-zinc-700',
  glow: 'bg-zinc-500/5',
  ring: 'shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]'
}

export const FlippableCard = ({
  isRevealed,
  onReveal,
  contentTierUuid,
  isNightMarket = false,
  className = "",
  children
}: FlippableCardProps) => {
  // Determine styles based on contentTierUuid
  const colors = contentTierUuid ? TIER_COLORS[contentTierUuid] || DEFAULT_COLORS : DEFAULT_COLORS
  const tierStyle = contentTierUuid ? TIER_STYLES[contentTierUuid] || DEFAULT_STYLE : DEFAULT_STYLE

  return (
    <div className={`relative select-none perspective-[1000px] ${className}`}>
      <motion.div
        className="w-full h-full relative transform-3d transition-all"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        whileHover={isRevealed ? {} : { scale: 1.03 }}
        transition={{ type: 'spring', damping: 20, stiffness: 80, mass: 0.8 }}
      >
        {/* CARD FRONT (Revealed Content) */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] z-20"
        >
          {children}
        </div>

        {/* CARD BACK (Face Down Cover) */}
        <div
          onClick={onReveal}
          className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center border-2 cursor-pointer transition-all duration-300 backface-hidden z-10 ${isNightMarket ? 'bg-[#0f1923]' : 'bg-zinc-900'
            } ${tierStyle} ${colors.border} ${colors.ring}`}
        >
          {/* Cybernetic Grid Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cpath d='M0 0h30v30H0z' fill='none'/%3E%3Cpath d='M30 0v30H0v-1h29V0h1z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
