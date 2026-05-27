'use client'

/* eslint-disable @next/next/no-img-element */
import { VPIcon, RPIcon, KCIcon } from './Icons'

interface UserInfoSectionProps {
  result: any
  playerCardsData: any[] | undefined
  titlesData: any[] | undefined
  onRefresh?: () => void
  loading?: boolean
  onPlayerCardClick?: () => void
}

export const UserInfoSection = ({
  result,
  playerCardsData,
  titlesData,
  onRefresh,
  loading,
  onPlayerCardClick
}: UserInfoSectionProps) => {
  const playerCardId = result.loadout?.Identity?.PlayerCardID
  const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)

  const playerTitleId = result.loadout?.Identity?.PlayerTitleID
  const title = titlesData?.find((t: any) => t.uuid === playerTitleId)

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {card && (
            <img
              src={card.smallArt || card.displayIcon}
              alt="Card"
              onClick={onPlayerCardClick}
              className={`w-8 h-8 rounded border border-white/10 object-cover ${onPlayerCardClick ? 'cursor-pointer hover:opacity-85 active:scale-95 transition-all' : ''}`}
            />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs md:text-sm whitespace-nowrap">
                {result.user.acct.game_name}
                <span className="text-zinc-500 font-normal ml-1">#{result.user.acct.tag_line}</span>
              </span>
              {result.user.acct?.state === 'ACTIVE' && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Active" />
              )}
            </div>
            {title && title.displayName !== "" && (
              <div className="text-teal-400 font-medium text-[9px] uppercase tracking-wider leading-none">
                {title.titleText || title.displayName}
              </div>
            )}
          </div>
        </div>



        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-[10px] text-zinc-500 border-r border-white/5 pr-4">
            <div className="flex items-center gap-1">
              <span>Region:</span>
              <span className="text-zinc-300 font-semibold uppercase">{result.affinity}</span>
            </div>
            {result.user.country && (
              <div className="flex items-center gap-1">
                <span>Country:</span>
                <span className="text-zinc-300 font-semibold uppercase">{result.user.country}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 flex-1 justify-center">
            {result.wallet?.Balances && (
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-rose-400" title="Valorant Points">
                  <VPIcon className="size-2 md:size-4" />
                  <span className="font-bold text-[8px] md:text-xs">
                    {result.wallet.Balances['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-400" title="Radianite Points">
                  <RPIcon className="size-2 md:size-4" />
                  <span className="font-bold text-[8px] md:text-xs">
                    {result.wallet.Balances['e59aa87c-4cbf-517a-5983-6e81511be9b7']?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-400" title="Kingdom Credits">
                  <KCIcon className="size-2 md:size-4" />
                  <span className="font-bold text-[8px] md:text-xs">
                    {result.wallet.Balances['85ca954a-41f2-ce94-9b45-8ca3dd39a00d']?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className={`p-1.5 rounded-lg border border-white/5 hover:bg-white/5 transition-all duration-300 group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Data"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
        </div>
      </div>
    </div>
  )
}
