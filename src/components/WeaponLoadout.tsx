'use client'

/* eslint-disable @next/next/no-img-element */
import { WEAPON_COLUMNS, TIER_RANKS, TIER_ICONS, TIER_STYLES } from '@/constants/valorant'
import { VPIcon } from './Icons'

interface WeaponLoadoutProps {
  loadout: any
  weaponsData: any[] | undefined
  buddiesData: any[] | undefined
  onWeaponClick: (weapon: any) => void
}

export const WeaponLoadout = ({
  loadout,
  weaponsData,
  buddiesData,
  onWeaponClick,
}: WeaponLoadoutProps) => {
  if (!loadout || !weaponsData) return null

  // Create a map for quick lookup of equipped items
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

    // Find the specific chroma and level
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

  return (
    <div className="mt-12 mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Your Collection</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {WEAPON_COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col gap-12">
            {column.categories.map((category) => (
              <div key={category.id} className="flex flex-col gap-4">
                <h3 className="text-zinc-500 font-bold text-xs tracking-[0.3em] uppercase border-b border-zinc-800 pb-2 mb-2">
                  {category.name}
                </h3>
                <div className="flex flex-col gap-4">
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
                        className={`group relative bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-800/40 transition-all duration-300 cursor-pointer p-4 h-[140px] flex flex-col justify-between overflow-hidden
                          ${skin?.contentTierUuid === '411e4a55-4e59-7757-41f0-86a53f101bb5' ? 'hover:border-orange-500/50' :
                            skin?.contentTierUuid === 'e046854e-406c-37f4-6607-19a9ba8426fc' ? 'hover:border-yellow-500/50' :
                              skin?.contentTierUuid === '60bca009-4182-7998-dee7-b8a2558dc369' ? 'hover:border-pink-500/50' :
                                skin?.contentTierUuid === '0cebb8be-46d7-c12a-d306-e9907bfc5a25' ? 'hover:border-emerald-500/50' :
                                  skin?.contentTierUuid ? 'hover:border-blue-500/50' : 'hover:border-zinc-500/50'}`}
                      >
                        {/* Weapon Image */}
                        <div className="flex-1 flex items-center justify-center p-2 relative">
                          <img
                            src={skin?.equippedChroma?.fullRender || skin?.equippedLevel?.displayIcon || skin?.chromas?.[0].displayIcon || skin?.levels?.[0].displayIcon || weapon.displayIcon}
                            alt={weapon.displayName}
                            className={`w-full h-auto max-h-16 object-contain transform transition-transform duration-500 group-hover:scale-110 ${isMelee ? 'rotate-45 scale-125' : ''}`}
                          />

                          {/* Buddy Icon */}
                          {buddy && (
                            <div className="absolute right-0 bottom-0 flex flex-col items-center gap-1">
                              <img
                                src={buddy.equippedLevel?.displayIcon || buddy.displayIcon}
                                alt="Buddy"
                                className="w-8 h-8 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                              />
                            </div>
                          )}
                        </div>

                        {/* Footer: Weapon Name & Skin Name */}
                        <div className="flex flex-col gap-0.5 relative z-10">
                          <div className="text-[10px] text-zinc-500 font-bold tracking-widest leading-none">
                            {weapon.displayName}
                          </div>
                          <div className="text-[11px] text-white font-black truncate max-w-[80%]">
                            {skin?.displayName || 'Standard'}
                          </div>
                        </div>

                        {/* Tier Icon Indicator */}
                        {skin?.contentTierUuid && TIER_ICONS[skin.contentTierUuid] && (
                          <div className="absolute bottom-2 right-2">
                            <img
                              src={TIER_ICONS[skin.contentTierUuid]}
                              alt="Tier"
                              className="w-5 h-5 object-contain drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]"
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
  )
}
