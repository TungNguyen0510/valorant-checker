'use client'

/* eslint-disable @next/next/no-img-element */
import { VPIcon, RPIcon, KCIcon } from './Icons'

interface UserInfoSectionProps {
  result: any
  playerCardsData: any[] | undefined
  titlesData: any[] | undefined
  onRefresh?: () => void
  loading?: boolean
}

export const UserInfoSection = ({ 
  result, 
  playerCardsData, 
  titlesData,
  onRefresh,
  loading 
}: UserInfoSectionProps) => {
  const playerCardId = result.loadout?.Identity?.PlayerCardID
  const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)

  const playerTitleId = result.loadout?.Identity?.PlayerTitleID
  const title = titlesData?.find((t: any) => t.uuid === playerTitleId)

  return (
    <div className="mb-8 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
      <div className="flex items-center gap-4">
        {card && (
          <img
            src={card.smallArt || card.displayIcon}
            alt="Card"
            className="w-16 h-16 rounded-lg border border-zinc-700 object-cover"
          />
        )}
        <div>
          <div className="text-3xl font-bold text-white flex items-center gap-3">
            {result.user.acct.game_name}
            <span className="text-zinc-500 text-xl font-normal">#{result.user.acct.tag_line}</span>
            {result.user.acct?.state === 'ACTIVE' && (
              <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full font-semibold border border-green-500/20">
                ACTIVE
              </span>
            )}
          </div>
          {title && title.displayName !== "" && (
            <div className="text-teal-400 font-bold text-sm uppercase tracking-[0.2em] mt-1">
              {title.titleText || title.displayName}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-all duration-300 group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh Data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 text-sm text-zinc-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500">Region:</span>
            <span className="uppercase font-semibold text-white">{result.affinity}</span>
          </div>
          {result.user.country && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500">Country:</span>
              <span className="uppercase font-semibold text-white">{result.user.country}</span>
            </div>
          )}
          {result.user.email_verified !== undefined && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500">Email:</span>
              <span className={result.user.email_verified ? 'text-green-400' : 'text-yellow-400'}>
                {result.user.email_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          )}
        </div>

        {result.wallet?.Balances && (
          <div className="flex gap-4 mt-2 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 bg-rose-500/10 px-2 py-1 rounded text-rose-400 border border-rose-500/20">
              <VPIcon />
              <span className="font-bold">
                {result.wallet.Balances['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded text-orange-400 border border-orange-500/20">
              <RPIcon />
              <span className="font-bold">
                {result.wallet.Balances['e59aa87c-4cbf-517a-5983-6e81511be9b7']?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-teal-500/10 px-2 py-1 rounded text-teal-400 border border-teal-500/20">
              <KCIcon />
              <span className="font-bold">
                {result.wallet.Balances['85ca954a-41f2-ce94-9b45-8ca3dd39a00d']?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
