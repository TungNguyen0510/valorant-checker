'use client'

import { AccessoryCard } from './AccessoryCard'

interface AccessoryStoreProps {
  accessoryOffers: any[]
  playerCardsData: any[] | undefined
  buddiesData: any[] | undefined
  spraysData: any[] | undefined
  titlesData: any[] | undefined
  remainingDuration: number
}

export const AccessoryStore = ({
  accessoryOffers,
  playerCardsData,
  buddiesData,
  spraysData,
  titlesData,
  remainingDuration
}: AccessoryStoreProps) => {
  if (accessoryOffers.length === 0) return null

  const d = Math.floor(remainingDuration / 86400)
  const h = Math.floor((remainingDuration % 86400) / 3600).toString().padStart(2, '0')
  const m = Math.floor((remainingDuration % 3600) / 60).toString().padStart(2, '0')
  const s = (remainingDuration % 60).toString().padStart(2, '0')

  return (
    <div className="mt-12">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px bg-zinc-700 w-16 md:w-32"></div>
        <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase">
          <span className="text-zinc-300">ACCESSORIES</span>
          {remainingDuration > 0 && (
            <>
              <span className="text-zinc-600">|</span>
              <span className="text-teal-500">
                {d > 0 ? `${d}D : ` : ''}{h}:{m}:{s}
              </span>
            </>
          )}
        </div>
        <div className="h-px bg-zinc-700 w-16 md:w-32"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {accessoryOffers.map((accessory: any, idx: number) => {
          const offer = accessory.Offer || (accessory.Offers && accessory.Offers[0]) || accessory
          const item = offer.Rewards?.[0] || offer.Item
          if (!item) return null

          const itemId = item.ItemID || item.uuid
          const itemTypeId = (item.ItemTypeID || item.itemTypeId || '').toLowerCase()

          let data: any = null
          let displayName = "Unknown"
          let displayIcon = ""

          // Match by item type ID
          if (itemTypeId === 'd5f120f8-ff8c-4f40-a15d-209c7130549c' || itemTypeId === '3f296c07-64c3-494c-923b-fe692a4fa1bd') { // Player Card
            data = playerCardsData?.find((pc: any) => pc.uuid === itemId)
            displayIcon = data?.displayIcon || data?.largeArt
          } else if (itemTypeId === 'de7f59d4-df61-4835-a6d1-63ee202a0a9a' || itemTypeId === 'dd3bf334-87f3-40bd-b043-682a57a8dc3a') { // Buddy
            data = buddiesData?.find((b: any) => b.uuid === itemId || b.levels?.some((l: any) => l.uuid === itemId))
            displayIcon = data?.displayIcon
          } else if (itemTypeId === 'dd1a727d-0723-4513-956b-7159e227448e' || itemTypeId === 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475') { // Spray
            data = spraysData?.find((s: any) => s.uuid === itemId || s.levels?.some((l: any) => l.uuid === itemId))
            displayIcon = data?.displayIcon || data?.fullIcon
          } else if (itemTypeId === 'f85b4263-705b-4970-a5ee-27206495fb51' || itemTypeId === 'de7caa6b-adf7-4588-bbd1-143831e786c6') { // Title
            data = titlesData?.find((t: any) => t.uuid === itemId)
          }

          // Fallback search if not found by type
          if (!data) {
            const card = playerCardsData?.find((pc: any) => pc.uuid === itemId)
            if (card) {
              data = card
              displayIcon = card.displayIcon || card.largeArt
            } else {
              const buddy = buddiesData?.find((b: any) => b.uuid === itemId || b.levels?.some((l: any) => l.uuid === itemId))
              if (buddy) {
                data = buddy
                displayIcon = buddy.displayIcon
              } else {
                const spray = spraysData?.find((s: any) => s.uuid === itemId || s.levels?.some((l: any) => l.uuid === itemId))
                if (spray) {
                  data = spray
                  displayIcon = spray.displayIcon || spray.fullIcon
                } else {
                  const title = titlesData?.find((t: any) => t.uuid === itemId)
                  if (title) data = title
                }
              }
            }
          }

          displayName = data?.titleText || data?.displayName || "Unknown Accessory"
          const price = offer.Cost?.['85ca954a-41f2-ce94-9b45-8ca3dd39a00d'] || offer.Cost?.['85ca954a-41f2-ce94-9b45-8ca3dd39a00d'.toUpperCase()]

          return (
            <AccessoryCard
              key={offer.OfferID || itemId || idx}
              displayName={displayName}
              displayIcon={displayIcon}
              price={price}
              itemTypeId={itemTypeId}
            />
          )
        })}
      </div>
    </div>
  )
}
