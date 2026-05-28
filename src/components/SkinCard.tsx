/* eslint-disable @next/next/no-img-element */
import { TIER_STYLES, DEFAULT_STYLE } from '@/constants/valorant'
import { VPIcon } from './Icons'

interface SkinCardProps {
  skin: any
  price?: number
  isLoading?: boolean
  className?: string
  isNightMarket?: boolean
  discount?: number
  originalPrice?: number
  onClick?: () => void
}

export const SkinCard = ({
  skin,
  price,
  isLoading,
  className = "",
  isNightMarket = false,
  discount,
  originalPrice,
  onClick
}: SkinCardProps) => {
  const cardStyle = skin?.contentTierUuid ? TIER_STYLES[skin.contentTierUuid] || DEFAULT_STYLE : DEFAULT_STYLE

  if (isNightMarket) {
    const tierBorders: Record<string, string> = {
      '411e4a55-4e59-7757-41f0-86a53f101bb5': 'border-yellow-500',
      'e046854e-406c-37f4-6607-19a9ba8426fc': 'border-orange-500',
      '60bca009-4182-7998-dee7-b8a2558dc369': 'border-pink-500',
      '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 'border-emerald-500',
      '12683d76-48d7-84a3-4e09-6985794f0445': 'border-blue-500',
    }
    const borderColor = skin?.contentTierUuid ? tierBorders[skin.contentTierUuid] || 'border-zinc-700' : 'border-zinc-700'

    return (
      <div
        onClick={onClick}
        className={`flex flex-col bg-[#0f1923] border ${borderColor} overflow-hidden relative group cursor-pointer h-[380px] ${className}`}
      >
        {/* Top Overlay: Discount & Prices */}
        <div className="p-3 flex justify-between items-start z-10">
          <div className="bg-[#ff4655] text-white font-black text-xs px-2 py-1 skew-x-[-15deg]">
            -{discount}%
          </div>
          <div className="flex flex-col items-end leading-tight">
            <div className="flex items-center gap-1 text-white font-bold text-lg">
              <VPIcon className="w-4 h-4" />
              <span>{price?.toLocaleString()}</span>
            </div>
            {originalPrice && (
              <div className="text-zinc-500 line-through text-sm font-medium mr-1">
                {originalPrice.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Weapon Image container */}
        <div className={`flex-1 flex items-center justify-center p-4 relative cursor-pointer ${cardStyle}`}>
          <img
            src={skin?.chromas?.[0]?.displayIcon || skin?.chromas?.[0]?.fullRender || skin?.displayIcon || skin?.levels?.[0]?.displayIcon}
            alt={skin?.displayName}
            className="w-full h-auto object-contain transform rotate-45 group-hover:scale-120 transition-all duration-500 drop-shadow-2xl z-0"
          />
        </div>

        {/* Bottom Skin Name */}
        <div className="bg-black py-2 px-3 text-center border-t border-zinc-800">
          <span className="text-white font-bold text-[10px] tracking-wider truncate block">
            {skin?.displayName || "Unknown Skin"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`flex flex-col bg-zinc-900 border-t border-zinc-700 overflow-hidden group cursor-pointer ${className}`}
    >
      <div className={`flex-1 min-h-[160px] flex items-center justify-center p-6 relative ${cardStyle}`}>
        {/* Tier Icon Background */}
        {skin?.contentTierUuid && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none p-8">
          </div>
        )}
        {isLoading ? (
          <div className="text-zinc-500 text-sm text-center">Loading...</div>
        ) : skin ? (
          <img
            src={skin.chromas?.[0]?.displayIcon || skin.chromas?.[0]?.fullRender || skin.displayIcon || skin.levels?.[0]?.displayIcon}
            alt={skin.displayName}
            className="w-full h-auto max-h-24 object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-lg relative z-10"
          />
        ) : (
          <div className="text-zinc-500 text-sm text-center">No image</div>
        )}
      </div>

      <div className="bg-[#1f2326] px-4 py-3 flex flex-col gap-1 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-zinc-300 font-bold text-xs text-center tracking-wider truncate w-full">
            {skin?.displayName || "Unknown Skin"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {originalPrice && originalPrice > (price || 0) && (
              <span className="text-zinc-500 line-through text-sm font-medium mr-1">
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {price !== undefined && (
            <div className="flex items-center gap-1.5 shrink-0 text-zinc-300 font-bold">
              <VPIcon className="w-3.5 h-3.5" />
              <span className="text-sm">{price.toLocaleString()}</span>
            </div>
          )}
        </div>

        {discount !== undefined && discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="bg-[#ff4655] text-white font-black text-[9px] px-1.5 py-0.5 skew-x-[-15deg] leading-none">
              -{discount}%
            </span>
            <span className="text-yellow-500 font-extrabold text-[9px] uppercase tracking-widest">
              In Bundle
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
