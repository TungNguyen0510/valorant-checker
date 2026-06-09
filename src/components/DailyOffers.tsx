'use client'

import { useEffect, useState } from 'react'
import { SkinCard } from './SkinCard'
import { FlippableCard } from './FlippableCard'

interface DailyOffersProps {
  offers: string[]
  weaponsData: any[] | undefined
  isLoadingWeapons: boolean
  remainingDuration: number
  storeOffers: any[] | undefined
  onSkinClick: (weapon: any, skin: any) => void
}

export const DailyOffers = ({
  offers,
  weaponsData,
  isLoadingWeapons,
  remainingDuration,
  storeOffers,
  onSkinClick
}: DailyOffersProps) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const offersKey = offers.sort().join(',')

  // Load revealed states from local storage, scoped to this specific set of daily offers
  useEffect(() => {
    const stored = localStorage.getItem(`daily_offers_revealed_${offersKey}`)
    if (stored) {
      try {
        setRevealed(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [offersKey])

  const handleReveal = (offer: string) => {
    setRevealed(prev => {
      const next = { ...prev, [offer]: true }
      localStorage.setItem(`daily_offers_revealed_${offersKey}`, JSON.stringify(next))
      return next
    })
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 mb-8 mt-12">
        <div className="flex items-center justify-center gap-4 w-full animate-in fade-in duration-500">
          <div className="h-px bg-zinc-700 w-16 md:w-32"></div>
          <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase">
            <span className="text-zinc-300">DAILY OFFERS</span>
            {remainingDuration > 0 && (
              <>
                <span className="text-zinc-600">|</span>
                <span className="text-yellow-500 font-mono">
                  {Math.floor(remainingDuration / 3600).toString().padStart(2, '0')}:
                  {Math.floor((remainingDuration % 3600) / 60).toString().padStart(2, '0')}:
                  {(remainingDuration % 60).toString().padStart(2, '0')}
                </span>
              </>
            )}
          </div>
          <div className="h-px bg-zinc-700 w-16 md:w-32"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-1">
        {offers.map((offer: string) => {
          const skin = weaponsData?.flatMap((w: any) => w.skins).find((s: any) => s.uuid === offer || s.levels?.some((l: any) => l.uuid === offer))
          const weapon = weaponsData?.find((w: any) => w.skins.some((s: any) => s.uuid === skin?.uuid))
          const storeOffer = storeOffers?.find((o: any) => o.OfferID === offer)
          const price = storeOffer?.Cost?.['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']

          return (
            <FlippableCard
              key={offer}
              isRevealed={!!revealed[offer]}
              onReveal={() => handleReveal(offer)}
              contentTierUuid={skin?.contentTierUuid}
              isNightMarket={false}
              className="h-[235px]"
            >
              <SkinCard
                skin={skin}
                price={price}
                isLoading={isLoadingWeapons}
                onClick={() => skin && weapon && onSkinClick(weapon, offer)}
                className="h-full"
              />
            </FlippableCard>
          )
        })}
      </div>
    </>
  )
}

