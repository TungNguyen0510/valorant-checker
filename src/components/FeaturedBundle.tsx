'use client'

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { VPIcon } from './Icons'
import { SkinCard } from './SkinCard'

interface FeaturedBundleProps {
  bundles: any[]
  bundlesData: any[] | undefined
  isLoadingBundles: boolean
  weaponsData: any[] | undefined
  playerCardsData?: any[]
  buddiesData?: any[]
  spraysData?: any[]
  onSkinClick: (weapon: any, skin: any) => void
}

export const FeaturedBundle = ({
  bundles,
  bundlesData,
  isLoadingBundles,
  weaponsData,
  playerCardsData,
  buddiesData,
  spraysData,
  onSkinClick
}: FeaturedBundleProps) => {
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({})

  const toggleBundle = (id: string) => {
    setExpandedBundles(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (!bundles || bundles.length === 0) return null

  return (
    <div className="flex flex-col gap-6 mb-4">
      {bundles.map((bundleOffer: any) => {
        const bundleInfo = bundlesData?.find((b: any) => b.uuid === bundleOffer.DataAssetID)
        if (!bundleInfo && !isLoadingBundles) return null

        const isExpanded = !!expandedBundles[bundleOffer.DataAssetID]

        // Format remaining duration
        const remainingSeconds = bundleOffer.DurationRemainingInSeconds || 0
        const days = Math.floor(remainingSeconds / 86400)
        const hours = Math.floor((remainingSeconds % 86400) / 3600).toString().padStart(2, '0')
        const minutes = Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, '0')
        const seconds = (remainingSeconds % 60).toString().padStart(2, '0')
        const formattedDuration = remainingSeconds > 0 ? `${days > 0 ? days + ':' : ''}${hours}:${minutes}:${seconds}` : '00:00:00'

        return (
          <div key={bundleOffer.DataAssetID} className="bg-[#0f1923] border-2 border-zinc-700 overflow-hidden relative">
            {isLoadingBundles ? (
              <div className="p-10 text-center text-zinc-500">Loading bundle...</div>
            ) : bundleInfo ? (
              <>
                {/* Clickable Banner Header */}
                <div
                  onClick={() => toggleBundle(bundleOffer.DataAssetID)}
                  className="relative cursor-pointer select-none overflow-hidden group/banner"
                >
                  {/* Background Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={bundleInfo.displayIcon2 || bundleInfo.displayIcon}
                      alt={bundleInfo.displayName}
                      className="w-full h-auto max-h-[250px] min-h-[200px] object-cover opacity-90 transition-transform duration-500 group-hover/banner:scale-[1.02] group-hover/banner:opacity-100"
                    />
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 group-hover/banner:bg-black/0 transition-all duration-300" />
                  </div>

                  {/* Top Left Info */}
                  <div className="absolute top-4 left-6 z-10 pointer-events-none">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
                      <span className="text-zinc-400">FEATURED</span>
                      {remainingSeconds > 0 && (
                        <>
                          <span className="text-yellow-500">|</span>
                          <span className="text-yellow-500">{formattedDuration}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl lg:text-5xl font-black text-white italic tracking-tighter uppercase mt-1 drop-shadow-md">
                      {bundleInfo.displayName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs lg:text-sm font-bold text-white uppercase tracking-widest drop-shadow-md">
                      <span>COLLECTION</span>
                      {bundleOffer.TotalDiscountedCost?.['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741'] !== undefined && (
                        <div className="flex items-center gap-1">
                          <VPIcon className="fill-current" />
                          <span>{bundleOffer.TotalDiscountedCost['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bundle Items */}
                {isExpanded && (
                  <div className="p-1 bg-[#0b1219] border-t border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
                      {bundleOffer.Items?.map((item: any) => {
                        const itemId = item.Item.ItemID
                        const itemTypeId = (item.Item.ItemTypeID || '').toLowerCase()

                        // Is it a skin?
                        const skin = weaponsData?.flatMap((w: any) => w.skins).find((s: any) =>
                          s.uuid === itemId || s.levels?.some((l: any) => l.uuid === itemId)
                        )

                        let displayIcon = ''
                        let displayName = ''
                        let isSkin = false
                        let weapon: any = null

                        if (skin) {
                          isSkin = true
                          weapon = weaponsData?.find((w: any) => w.skins.some((s: any) => s.uuid === skin.uuid))
                        } else {
                          // Check player cards
                          if (itemTypeId === 'd5f120f8-ff8c-4f40-a15d-209c7130549c' || itemTypeId === '3f296c07-64c3-494c-923b-fe692a4fa1bd') {
                            const card = playerCardsData?.find((pc: any) => pc.uuid === itemId)
                            if (card) {
                              displayName = card.displayName
                              displayIcon = card.displayIcon || card.largeArt || card.wideArt
                            }
                          }
                          // Check buddies
                          else if (itemTypeId === 'de7f59d4-df61-4835-a6d1-63ee202a0a9a' || itemTypeId === 'dd3bf334-87f3-40bd-b043-682a57a8dc3a') {
                            const buddy = buddiesData?.find((b: any) => b.uuid === itemId || b.levels?.some((l: any) => l.uuid === itemId))
                            if (buddy) {
                              displayName = buddy.displayName
                              displayIcon = buddy.displayIcon
                            }
                          }
                          // Check sprays
                          else if (itemTypeId === 'dd1a727d-0723-4513-956b-7159e227448e' || itemTypeId === 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475') {
                            const spray = spraysData?.find((s: any) => s.uuid === itemId || s.levels?.some((l: any) => l.uuid === itemId))
                            if (spray) {
                              displayName = spray.displayName
                              displayIcon = spray.displayIcon || spray.fullIcon || spray.fullTransparentIcon
                            }
                          }

                          // Fallback search if itemTypeId is not matching or empty
                          if (!displayName) {
                            const card = playerCardsData?.find((pc: any) => pc.uuid === itemId)
                            if (card) {
                              displayName = card.displayName
                              displayIcon = card.displayIcon || card.largeArt || card.wideArt
                            } else {
                              const buddy = buddiesData?.find((b: any) => b.uuid === itemId || b.levels?.some((l: any) => l.uuid === itemId))
                              if (buddy) {
                                displayName = buddy.displayName
                                displayIcon = buddy.displayIcon
                              } else {
                                const spray = spraysData?.find((s: any) => s.uuid === itemId || s.levels?.some((l: any) => l.uuid === itemId))
                                if (spray) {
                                  displayName = spray.displayName
                                  displayIcon = spray.displayIcon || spray.fullIcon || spray.fullTransparentIcon
                                }
                              }
                            }
                          }
                        }

                        // If it's not a skin and we didn't find any match, skip it
                        if (!skin && !displayName) return null

                        const price = item.DiscountedPrice
                        const originalPrice = item.BasePrice
                        const discount = item.DiscountedPercentage !== undefined
                          ? item.DiscountedPercentage
                          : (item.DiscountPercent !== undefined
                            ? (item.DiscountPercent < 1 ? Math.round(item.DiscountPercent * 100) : item.DiscountPercent)
                            : undefined)

                        if (isSkin && skin) {
                          return (
                            <SkinCard
                              key={itemId}
                              skin={skin}
                              price={price}
                              originalPrice={originalPrice}
                              discount={discount}
                              className="h-[256px]"
                              onClick={() => skin && weapon && onSkinClick(weapon, itemId)}
                            />
                          )
                        } else {
                          // Render accessory card matching SkinCard style!
                          return (
                            <div
                              key={itemId}
                              className="flex flex-col bg-zinc-900 border-t border-zinc-700 overflow-hidden group cursor-default h-[256px]"
                            >
                              <div className="flex-1 min-h-[160px] flex items-center justify-center p-4 relative bg-linear-to-t from-zinc-700/10 to-transparent">
                                {displayIcon ? (
                                  <img
                                    src={displayIcon}
                                    alt={displayName}
                                    className={`w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-lg relative z-10 ${itemTypeId === 'd5f120f8-ff8c-4f40-a15d-209c7130549c' || itemTypeId === '3f296c07-64c3-494c-923b-fe692a4fa1bd'
                                      ? 'max-h-32'
                                      : 'max-h-24'
                                      }`}
                                  />
                                ) : (
                                  <div className="text-zinc-500 text-sm text-center font-bold uppercase tracking-widest px-4">
                                    {displayName}
                                  </div>
                                )}
                              </div>

                              <div className="bg-[#1f2326] px-4 py-3 flex flex-col gap-1 border-t border-zinc-800">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-300 font-bold text-xs text-center tracking-wider truncate w-full">
                                    {displayName}
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
                                  <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2">
                                    <span className="bg-[#ff4655] text-white font-black text-[9px] px-1.5 py-0.5 skew-x-[-15deg] leading-none">
                                      -{discount}%
                                    </span>
                                    <span className="text-yellow-500 font-extrabold text-[9px] uppercase tracking-widest flex items-center gap-1">
                                      In Bundle
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
