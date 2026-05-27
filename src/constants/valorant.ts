export const TIER_RANKS: Record<string, number> = {
  '411e4a55-4e59-7757-41f0-86a53f101bb5': 5, // Exclusive
  'e046854e-406c-37f4-6607-19a9ba8426fc': 4, // Ultra
  '60bca009-4182-7998-dee7-b8a2558dc369': 3, // Premium
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 2, // Deluxe
  '12683d76-48d7-84a3-4e09-6985794f0445': 1, // Select
}

export const TIER_STYLES: Record<string, string> = {
  '411e4a55-4e59-7757-41f0-86a53f101bb5': 'bg-gradient-to-t from-orange-500/20 to-transparent', // Exclusive
  'e046854e-406c-37f4-6607-19a9ba8426fc': 'bg-gradient-to-t from-yellow-500/20 to-transparent', // Ultra
  '60bca009-4182-7998-dee7-b8a2558dc369': 'bg-gradient-to-t from-pink-500/20 to-transparent', // Premium
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 'bg-gradient-to-t from-emerald-500/20 to-transparent', // Deluxe
  '12683d76-48d7-84a3-4e09-6985794f0445': 'bg-gradient-to-t from-blue-500/20 to-transparent', // Select
}

export const TIER_ICONS: Record<string, string> = {
  '411e4a55-4e59-7757-41f0-86a53f101bb5': '/icons/exclusive.png',
  'e046854e-406c-37f4-6607-19a9ba8426fc': '/icons/ultra.png',
  '60bca009-4182-7998-dee7-b8a2558dc369': '/icons/premium.png',
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': '/icons/deluxe.png',
  '12683d76-48d7-84a3-4e09-6985794f0445': '/icons/select.png',
}

export const DEFAULT_STYLE = 'bg-gradient-to-t from-zinc-700/20 to-transparent'

export const WEAPON_COLUMNS = [
  {
    id: 'col1',
    categories: [
      { id: 'sidearms', name: 'SIDEARMS', weapons: ['Classic', 'Shorty', 'Frenzy', 'Ghost', 'Bandit', 'Sheriff'] }
    ]
  },
  {
    id: 'col2',
    categories: [
      { id: 'smgs', name: 'SMGS', weapons: ['Stinger', 'Spectre'] },
      { id: 'shotguns', name: 'SHOTGUNS', weapons: ['Bucky', 'Judge'] }
    ]
  },
  {
    id: 'col3',
    categories: [
      { id: 'rifles', name: 'RIFLES', weapons: ['Bulldog', 'Guardian', 'Phantom', 'Vandal'] },
      { id: 'melee', name: 'MELEE', weapons: ['Melee'] }
    ]
  },
  {
    id: 'col4',
    categories: [
      { id: 'snipers', name: 'SNIPER RIFLES', weapons: ['Marshal', 'Outlaw', 'Operator'] },
      { id: 'heavy', name: 'MACHINE GUNS', weapons: ['Ares', 'Odin'] }
    ]
  },
]

export const TIER_PRICES: Record<string, { weapon: number; melee: number }> = {
  '12683d76-48d7-84a3-4e09-6985794f0445': { weapon: 875, melee: 1750 },  // Select
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': { weapon: 1275, melee: 2550 }, // Deluxe
  '60bca009-4182-7998-dee7-b8a2558dc369': { weapon: 1775, melee: 3550 }, // Premium
  '411e4a55-4e59-7757-41f0-86a53f101bb5': { weapon: 2175, melee: 4350 }, // Exclusive
  'e046854e-406c-37f4-6607-19a9ba8426fc': { weapon: 2475, melee: 4950 }, // Ultra
}

const SPECIAL_SKIN_PRICES: Record<string, number> = {
  '5 years // beta remastered knife': 3915,
  'araxys bio-atomizers': 5350,
  'arcane sheriff': 2377,
  'ayakashi ghost': 2375,
  'ayakashi phantom': 2375,
  'kogitsune': 5350,
  'bolt knife': 4350,
  'champions 2021 vandal': 2675,
  'champions 2021 karambit': 5350,
  'champions 2022 phantom': 2675,
  'champions 2022 butterfly knife': 5350,
  'champions 2023 vandal': 2675,
  'champions 2023 kunai': 5350,
  'champions 2024 phantom': 2675,
  'champions 2024 blade': 5350,
  'champions 2025 vandal': 2675,
  'champions 2025 butterfly knife': 5350,
  'cyrax fanblade': 5350,
  'ex.o sheriff': 2375,
  'ex.o spectre': 2375,
  'ex.o vandal': 2375,
  'ex.o outlaw': 2375,
  'ex.o edge': 5350,
  'helix daggers': 4350,
  'ignite fan': 4710,
  'ion karambit': 4350,
  'kuronami sheriff': 2375,
  'kuronami spectre': 2375,
  'kuronami vandal': 2375,
  'kuronami marshal': 2375,
  'kuronami no yaiba': 5350,
  'kuronami ghost': 2375,
  'kuronami guardian': 2375,
  'kuronami phantom': 2375,
  'kuronami operator': 2375,
  'kuronami naru-kami': 5350,
  "luna's descent": 3550,
  'magepunk sparkswitch': 4350,
  'minima karambit': 3550,
  'nocturnum scythe': 5350,
  'onimaru kunitsuna': 5350,
  'phaseguard splitter': 5350,
  'radiant entertainment system ghost': 2975,
  'radiant entertainment system bulldog': 2975,
  'radiant entertainment system phantom': 2975,
  'radiant entertainment system operator': 2975,
  'power fist': 5950,
  'reaver karambit': 4350,
  'reaver butterfly knife': 5350,
  'spectrum classic': 2675,
  'spectrum bulldog': 2675,
  'spectrum guardian': 2675,
  'spectrum phantom': 2675,
  'waveform': 5350,
  'ruyi staff': 4350,
  'vct 2025 karambit': 5850,
  'vct 2026 sigil': 5550,
  'vct lock//in misericórdia': 5440,
  'wonderstallion hammer': 3550,
  'xerøfang knife': 4350,
  'xerofang knife': 4350,
  'eternal sovereign': 4350,
}

export function adjustSpecialSkinPrice(price: number, displayName: string): number {
  const lowerName = displayName.toLowerCase()

  for (const [key, specialPrice] of Object.entries(SPECIAL_SKIN_PRICES)) {
    if (lowerName.includes(key)) {
      return specialPrice
    }
  }

  return price
}




