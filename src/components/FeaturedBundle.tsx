'use client'

/* eslint-disable @next/next/no-img-element */
import { VPIcon } from './Icons'
import { SkinCard } from './SkinCard'

interface FeaturedBundleProps {
  bundles: any[]
  bundlesData: any[] | undefined
  isLoadingBundles: boolean
  weaponsData: any[] | undefined
  onSkinClick: (weapon: any, skin: any) => void
}

export const FeaturedBundle = ({
  bundles,
  bundlesData,
  isLoadingBundles,
  weaponsData,
  onSkinClick
}: FeaturedBundleProps) => {
  if (!bundles || bundles.length === 0) return null

  return (
    <div className="flex flex-col gap-6 mb-4">
      {bundles.map((bundleOffer: any) => {
        const bundleInfo = bundlesData?.find((b: any) => b.uuid === bundleOffer.DataAssetID)
        if (!bundleInfo && !isLoadingBundles) return null

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
                {/* Background Image */}
                <div className="relative">
                  <img
                    src={bundleInfo.displayIcon2 || bundleInfo.displayIcon}
                    alt={bundleInfo.displayName}
                    className="w-full h-auto max-h-[250px] min-h-[200px] object-cover opacity-90"
                  />
                </div>

                {/* Top Left Info */}
                <div className="absolute top-4 left-6 z-10">
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

                {/* Bundle Items */}
                <div className="p-1 bg-[#0b1219]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
                    {bundleOffer.Items?.map((item: any) => {
                      const skinId = item.Item.ItemID
                      const skin = weaponsData?.flatMap((w: any) => w.skins).find((s: any) =>
                        s.uuid === skinId || s.levels?.some((l: any) => l.uuid === skinId)
                      )

                      // Skip if not a skin (could be a spray, card, buddy)
                      if (!skin) return null

                      const weapon = weaponsData?.find((w: any) => w.skins.some((s: any) => s.uuid === skin.uuid))
                      const price = item.DiscountedPrice
                      const originalPrice = item.BasePrice
                      const discount = item.DiscountPercent

                      return (
                        <SkinCard
                          key={item.Item.ItemID}
                          skin={skin}
                          price={price}
                          originalPrice={originalPrice}
                          discount={discount}
                          className="h-[220px]"
                          onClick={() => skin && weapon && onSkinClick(weapon, skinId)}
                        />
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
