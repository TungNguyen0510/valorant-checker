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


