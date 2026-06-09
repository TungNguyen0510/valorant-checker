'use client'

import { useEffect, useState } from 'react'
import { SkinCard } from './SkinCard'
import { FlippableCard } from './FlippableCard'

interface NightMarketProps {
  bonusStore: any
  weaponsData: any[] | undefined
  onSkinClick: (weapon: any, skin: any) => void
}

export const NightMarket = ({ bonusStore, weaponsData, onSkinClick }: NightMarketProps) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  if (!bonusStore?.BonusStoreOffers) return null

  const remainingSeconds = bonusStore.BonusStoreRemainingDurationInSeconds || 0
  const offerIdsKey = bonusStore.BonusStoreOffers.map((o: any) => o.OfferID).sort().join(',')

  // Load revealed states from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`night_market_revealed_${offerIdsKey}`)
    if (stored) {
      try {
        setRevealed(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [offerIdsKey])

  const handleReveal = (offerId: string) => {
    setRevealed(prev => {
      const next = { ...prev, [offerId]: true }
      localStorage.setItem(`night_market_revealed_${offerIdsKey}`, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="my-6">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-[#ffb4b4] italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,180,180,0.3)]">
          NIGHT.MARKET
        </h2>
        {remainingSeconds > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-white uppercase">
            <div className="h-px w-8 bg-zinc-700"></div>
            <div>
              ENDS IN <span className="text-[#ff4655]">
                {Math.floor(remainingSeconds / 3600).toString().padStart(2, '0')}:
                {Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, '0')}:
                {Math.floor(remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="h-px w-8 bg-zinc-700"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-1">
        {bonusStore.BonusStoreOffers.map((offer: any, idx: number) => {
          const skinId = offer.Offer.Rewards[0].ItemID
          const skin = weaponsData?.flatMap((w: any) => w.skins).find((s: any) => s.levels?.some((l: any) => l.uuid === skinId))
          const weapon = weaponsData?.find((w: any) => w.skins.some((s: any) => s.uuid === skin?.uuid))

          const originalPrice = offer.Offer.Cost['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']
          const discountedPrice = offer.DiscountCosts['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']
          const discount = offer.DiscountPercent

          return (
            <FlippableCard
              key={`${offer.OfferID}-${idx}`}
              isRevealed={!!revealed[offer.OfferID]}
              onReveal={() => handleReveal(offer.OfferID)}
              contentTierUuid={skin?.contentTierUuid}
              isNightMarket={true}
              className="h-[380px]"
            >
              <SkinCard
                skin={skin}
                price={discountedPrice}
                isNightMarket={true}
                discount={discount}
                originalPrice={originalPrice}
                onClick={() => skin && weapon && onSkinClick(weapon, skinId)}
                className="h-full"
              />
            </FlippableCard>
          )
        })}
      </div>
    </div>
  )
}

