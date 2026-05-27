'use client'

/* eslint-disable @next/next/no-img-element */
import { WEAPON_COLUMNS, TIER_ICONS, TIER_STYLES, TIER_PRICES, adjustSpecialSkinPrice } from '@/constants/valorant'
import { VPIcon } from './Icons'

interface VirtualWeaponLoadoutProps {
  loadout: any
  weaponsData: any[] | undefined
  buddiesData: any[] | undefined
  playerCardsData?: any[] | undefined
  onWeaponClick: (weapon: any) => void
  onPlayerCardClick: () => void
  onReset: () => void
  skinPricesData?: Record<string, number>
}

export const VirtualWeaponLoadout = ({
  loadout,
  weaponsData,
  buddiesData,
  playerCardsData,
  onWeaponClick,
  onPlayerCardClick,
  onReset,
  skinPricesData = {},
}: VirtualWeaponLoadoutProps) => {
  if (!loadout || !weaponsData) return null

  // Create a map for quick lookup of equipped guns
  const equippedGunsMap = new Map()
  loadout.Guns?.forEach((gun: any) => {
    equippedGunsMap.set(gun.ID.toLowerCase(), gun)
  })

  // Helper to find the equipped skin object
  const getEquippedSkin = (weapon: any) => {
    const equipped = equippedGunsMap.get(weapon.uuid.toLowerCase())
    if (!equipped) return null

    const skin = weapon.skins.find((s: any) => s.uuid.toLowerCase() === equipped.SkinID?.toLowerCase())
    if (!skin) return null

    // Find specific chroma and level
    const chroma = skin.chromas?.find((c: any) => c.uuid.toLowerCase() === equipped.ChromaID?.toLowerCase())
    const level = skin.levels?.find((l: any) => l.uuid.toLowerCase() === equipped.LevelID?.toLowerCase())

    return { ...skin, equippedChroma: chroma, equippedLevel: level }
  }

  // Helper to find the equipped buddy object
  const getEquippedBuddy = (weapon: any) => {
    const equipped = equippedGunsMap.get(weapon.uuid.toLowerCase())
    if (!equipped || !equipped.CharmID) return null

    const buddy = buddiesData?.find((b: any) => b.uuid.toLowerCase() === equipped.CharmID?.toLowerCase())
    if (!buddy) return null

    // Find specific level
    const level = buddy.levels?.find((l: any) => l.uuid.toLowerCase() === equipped.CharmLevelID?.toLowerCase())
    return { ...buddy, equippedLevel: level }
  }

  // Calculate total price and count of virtual skins equipped
  let totalVP = 0
  let equippedSkinsCount = 0

  weaponsData.forEach((weapon: any) => {
    const skin = getEquippedSkin(weapon)
    if (!skin) return

    // Skip default/standard skins
    if (skin.displayName.includes('Standard') || skin.displayName === 'Melee') {
      return
    }

    equippedSkinsCount++

    // Price calculation
    let price = 0
    const fetchedPrice = skinPricesData[skin.uuid.toLowerCase()]
    const isMelee = weapon.displayName === 'Melee'

    if (typeof fetchedPrice === 'number') {
      price = fetchedPrice
    } else if (skin.contentTierUuid) {
      const prices = TIER_PRICES[skin.contentTierUuid]
      if (prices) {
        price = isMelee ? prices.melee : prices.weapon
      }
    }

    totalVP += adjustSpecialSkinPrice(price, skin.displayName)
  })

  // Player Card
  const playerCardId = loadout.Identity?.PlayerCardID
  const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)

  // Custom Username & Tag
  const customName = loadout.Identity?.PlayerName || 'VIRTUAL_USER'
  const customTag = loadout.Identity?.PlayerTag || 'VIRTUAL'

  return (
    <div className="my-6 lg:my-0 lg:py-2 flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Left side: Weapon Loadout Grid & Summary */}
      <div className="flex-1 w-full flex flex-col gap-6 relative lg:pl-44">

        {/* Collection Value Summary */}
        <div className="flex flex-row gap-4 mt-11 lg:absolute lg:left-0 lg:top-0 lg:flex-col lg:w-40 lg:gap-3 z-30">
          <div className="flex-1 lg:flex-initial w-full bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 px-4 py-2.5 flex items-center gap-3 group hover:border-[#FF4655]/30 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Loadout Value</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <VPIcon className="w-4 h-4" />
                <span className="text-base font-black text-white leading-none">
                  {totalVP.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 lg:flex-initial w-full bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 px-4 py-2.5 flex items-center gap-3 group hover:border-[#FF4655]/30 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Skins Configured</span>
              <span className="text-base font-black text-[#FF4655] leading-none mt-0.5">
                {equippedSkinsCount}
              </span>
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex-1 lg:flex-initial w-full bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 px-4 py-2.5 flex items-center justify-center gap-2 group hover:border-[#FF4655] hover:bg-[#FF4655]/10 transition-all duration-300 text-[10px] font-black uppercase tracking-widest text-zinc-405 hover:text-white rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-180 transition-transform duration-500">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset Loadout
          </button>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:gap-x-6 lg:gap-y-0">
          {WEAPON_COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col gap-12 lg:gap-5">
              {column.categories.map((category) => (
                <div key={category.id} className="flex flex-col gap-4 lg:gap-2">
                  <h3 className="text-zinc-500 font-bold text-base text-center tracking-[0.3em] lg:tracking-[0.15em] uppercase border-b border-zinc-800 pb-2 mb-2 lg:pb-1 lg:mb-1.5">
                    {category.name}
                  </h3>
                  <div className="flex flex-col gap-4 lg:gap-2">
                    {category.weapons.map((weaponName) => {
                      const weapon = weaponsData.find((w) => w.displayName === weaponName)
                      if (!weapon) return null

                      const skin = getEquippedSkin(weapon)
                      const buddy = getEquippedBuddy(weapon)
                      const isMelee = weapon.displayName === 'Melee'

                      return (
                        <div
                          key={weapon.uuid}
                          onClick={() => onWeaponClick(weapon)}
                          className={`group relative bg-zinc-950/45 backdrop-blur-md border border-zinc-800/80 hover:bg-zinc-800/40 transition-all duration-300 cursor-pointer p-4 lg:py-3 lg:px-4 flex flex-col justify-between overflow-hidden rounded
                          ${category.weapons.length > 5 ? 'h-[127.3px] lg:h-[110px]' : 'h-[140px] lg:h-[125px]'}
                          ${skin?.contentTierUuid === '411e4a55-4e59-7757-41f0-86a53f101bb5' ? 'hover:border-orange-500/50' :
                              skin?.contentTierUuid === 'e046854e-406c-37f4-6607-19a9ba8426fc' ? 'hover:border-yellow-500/50' :
                                skin?.contentTierUuid === '60bca009-4182-7998-dee7-b8a2558dc369' ? 'hover:border-pink-500/50' :
                                  skin?.contentTierUuid === '0cebb8be-46d7-c12a-d306-e9907bfc5a25' ? 'hover:border-emerald-500/50' :
                                    skin?.contentTierUuid ? 'hover:border-blue-500/50' : 'hover:border-[#FF4655]/50'}`}
                        >
                          {/* Weapon Image */}
                          <div className="flex-1 flex items-center justify-center p-2 lg:p-1 relative">
                            <img
                              src={skin?.equippedChroma?.displayIcon || skin?.equippedLevel?.displayIcon || skin?.chromas?.[0].displayIcon || skin?.levels?.[0].displayIcon || weapon.displayIcon}
                              alt={weapon.displayName}
                              className={`w-full h-auto ${category.weapons.length > 5 ? 'max-h-13 lg:max-h-[44px]' : 'max-h-16 lg:max-h-[52px]'} object-contain transform transition-transform duration-500 group-hover:scale-110 ${isMelee ? 'scale-125 lg:scale-110' : ''}`}
                            />

                            {/* Buddy Icon */}
                            {buddy && (
                              <div className="absolute right-0 bottom-0 flex flex-col items-center gap-1">
                                <img
                                  src={buddy.equippedLevel?.displayIcon || buddy.displayIcon}
                                  alt="Buddy"
                                  className="w-8 h-8 lg:w-7.5 lg:h-7.5 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                  style={{ animationDuration: '3s' }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Footer: Weapon Name & Skin Name */}
                          <div className="flex flex-col gap-0.5 relative z-10">
                            <div className="text-[10px] lg:text-[9.5px] text-zinc-500 font-bold tracking-widest leading-none">
                              {weapon.displayName}
                            </div>
                            <div className="text-[11px] lg:text-[11px] text-white font-bold truncate max-w-[80%]">
                              {skin?.displayName || 'Standard'}
                            </div>
                          </div>

                          {/* Tier Icon Indicator */}
                          {skin?.contentTierUuid && TIER_ICONS[skin.contentTierUuid] && (
                            <div className="absolute bottom-2 right-2 lg:bottom-2 lg:right-2">
                              <img
                                src={TIER_ICONS[skin.contentTierUuid]}
                                alt="Tier"
                                className="w-5 h-5 lg:w-4.5 lg:h-4.5 object-contain drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                              />
                            </div>
                          )}

                          {/* Background Glow on Hover */}
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none
                          ${skin?.contentTierUuid ? TIER_STYLES[skin.contentTierUuid] : 'bg-zinc-800'}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Player Profile (Virtual) */}
      <div className="w-full lg:w-[280px] xl:w-[310px] shrink-0 backdrop-blur-md flex flex-col gap-4 select-none">

        {/* Level Banner & Title */}
        <div className="relative w-full flex flex-col items-center">
          <h3 className="text-zinc-500 font-bold text-base text-center tracking-[0.3em] lg:tracking-[0.15em] uppercase border-b border-zinc-800 -mt-1 pb-2 mb-2 w-full">
            PLAYER CARD
          </h3>
        </div>

        {/* Player Card Frame */}
        <div
          onClick={onPlayerCardClick}
          className="relative w-full max-w-[180px] xl:max-w-[200px] mx-auto aspect-268/640 overflow-hidden bg-zinc-950 cursor-pointer hover:brightness-110 active:scale-98 transition-all group rounded"
          style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 74%, 50% 94%, 0% 74%)" }}
        >
          {/* Card Art */}
          {card ? (
            <img
              src={card.largeArt || card.displayIcon}
              alt={card.displayName}
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-650 text-xs font-bold">No Card Equipped</div>
          )}

          {/* Name Banner */}
          <div className="absolute bottom-40 inset-x-0 bg-white py-1.5 px-3 text-center z-10 shadow-md">
            <div className="text-zinc-950 font-black text-[11px] tracking-wider truncate uppercase">
              {customName}
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
              stroke="rgba(255, 70, 85, 0.45)"
              strokeWidth="2"
            />

            {/* Inflection Point Corner Bracket Accents */}
            <path
              d="M 6 454 L 2 458 L 2 474 L 14 485"
              fill="none"
              stroke="rgba(255, 70, 85, 0.85)"
              strokeWidth="1.5"
            />
            <path
              d="M 262 454 L 266 458 L 266 474 L 254 485"
              fill="none"
              stroke="rgba(255, 70, 85, 0.85)"
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
            <text x="8" y="468" fill="rgba(255, 255, 255, 0.4)" fontSize="5.5" fontFamily="monospace" letterSpacing="0.8">SYS.VIRT.02</text>
            <text x="226" y="468" fill="rgba(255, 255, 255, 0.4)" fontSize="5.5" fontFamily="monospace" letterSpacing="0.8">V_8.09</text>
            <text x="48" y="506" fill="rgba(255, 255, 255, 0.3)" fontSize="5" fontFamily="monospace">01</text>
            <text x="214" y="506" fill="rgba(255, 255, 255, 0.3)" fontSize="5" fontFamily="monospace">02</text>

            <path
              d="M 8 471 L 134 591 L 260 471"
              fill="none"
              stroke="rgba(255, 70, 85, 0.25)"
              strokeWidth="1"
            />

            {/* Segmented Inner Accent Lines with dot ends */}
            <path d="M 22 481 L 52 510" fill="none" stroke="rgba(255, 70, 85, 0.5)" strokeWidth="1.5" />
            <path d="M 62 520 L 92 549" fill="none" stroke="rgba(255, 70, 85, 0.5)" strokeWidth="1.5" />
            <circle cx="22" cy="481" r="1.5" fill="#FF4655" opacity="0.75" />
            <circle cx="92" cy="549" r="1.5" fill="#FF4655" opacity="0.75" />

            <path d="M 246 481 L 216 510" fill="none" stroke="rgba(255, 70, 85, 0.5)" strokeWidth="1.5" />
            <path d="M 206 520 L 176 549" fill="none" stroke="rgba(255, 70, 85, 0.5)" strokeWidth="1.5" />
            <circle cx="246" cy="481" r="1.5" fill="#FF4655" opacity="0.75" />
            <circle cx="176" cy="549" r="1.5" fill="#FF4655" opacity="0.75" />

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

            <path
              d="M 120 550 L 134 564 L 148 550"
              fill="none"
              stroke="rgba(255, 70, 85, 0.3)"
              strokeWidth="1.5"
            />
            <path
              d="M 124 562 L 134 572 L 144 562"
              fill="none"
              stroke="rgba(255, 70, 85, 0.45)"
              strokeWidth="1.5"
            />
            <path
              d="M 120 588 L 134 600 L 148 588"
              fill="none"
              stroke="rgba(255, 70, 85, 0.55)"
              strokeWidth="1"
            />

            <polygon points="134,580 137,583 134,586 131,583" fill="rgba(255, 70, 85, 0.85)" />

            <line x1="30" y1="502" x2="35" y2="497" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="60" y1="531" x2="65" y2="526" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="90" y1="560" x2="95" y2="555" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

            <line x1="45" y1="517" x2="40" y2="522" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="75" y1="546" x2="70" y2="551" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="105" y1="575" x2="100" y2="580" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

            <line x1="238" y1="502" x2="233" y2="497" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="208" y1="531" x2="203" y2="526" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="178" y1="560" x2="173" y2="555" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

            <line x1="223" y1="517" x2="228" y2="522" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="193" y1="546" x2="198" y2="551" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="163" y1="575" x2="168" y2="580" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  )
}
