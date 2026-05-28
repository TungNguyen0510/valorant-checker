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
  onSellClick?: () => void
  onCancelSell?: () => void
  onMarkSold?: () => void
}

export const UserInfoSection = ({
  result,
  playerCardsData,
  titlesData,
  onRefresh,
  loading,
  onPlayerCardClick,
  onSellClick,
  onCancelSell,
  onMarkSold
}: UserInfoSectionProps) => {
  const playerCardId = result.loadout?.Identity?.PlayerCardID
  const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)

  const playerTitleId = result.loadout?.Identity?.PlayerTitleID
  const title = titlesData?.find((t: any) => t.uuid === playerTitleId)

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-3 md:px-6 h-12 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
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
              <span className="font-bold text-white text-xs md:text-sm whitespace-nowrap truncate max-w-[120px] md:max-w-full">
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

        <div className="flex items-center gap-4 shrink-0">
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

          <div className="flex items-center gap-4 md:gap-6 justify-center mx-2 md:mx-0 shrink-0">
            {result.wallet?.Balances && (
              <div className="flex gap-3 md:gap-4">
                <div className="flex items-center gap-1.5 text-rose-400" title="Valorant Points">
                  <VPIcon className="size-3.5 md:size-4" />
                  <span className="font-bold text-[10px] md:text-xs">
                    {result.wallet.Balances['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-400" title="Radianite Points">
                  <RPIcon className="size-3.5 md:size-4" />
                  <span className="font-bold text-[10px] md:text-xs">
                    {result.wallet.Balances['e59aa87c-4cbf-517a-5983-6e81511be9b7']?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-400" title="Kingdom Credits">
                  <KCIcon className="size-3.5 md:size-4" />
                  <span className="font-bold text-[10px] md:text-xs">
                    {result.wallet.Balances['85ca954a-41f2-ce94-9b45-8ca3dd39a00d']?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {result.listing && result.listing.status === 'active' ? (
              <div className="flex items-center gap-1.5 md:gap-2 bg-[#FF4655]/10 border border-[#FF4655]/20 px-2 md:px-2.5 py-1 text-[9px] md:text-xs shrink-0">
                <span className="text-zinc-500 font-bold uppercase">LISTED:</span>
                <span className="text-[#FF4655] font-black">{result.listing.price.toLocaleString()}đ</span>
                <button
                  onClick={onMarkSold}
                  disabled={loading}
                  className="ml-1.5 md:ml-2 bg-[#FF4655] hover:bg-[#ff5e6a] text-white px-1.5 md:px-2 py-0.5 font-bold uppercase tracking-wider text-[8px] md:text-[9px] transition-all cursor-pointer rounded-none border-none whitespace-nowrap"
                >
                  Mark Sold
                </button>
                <button
                  onClick={onCancelSell}
                  disabled={loading}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-1.5 md:px-2 py-0.5 font-bold uppercase tracking-wider text-[8px] md:text-[9px] transition-all cursor-pointer border border-zinc-700 rounded-none whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            ) : (
              onSellClick && (
                <button
                  onClick={onSellClick}
                  disabled={loading}
                  className="bg-[#FF4655] hover:bg-[#ff5e6a] text-white px-2.5 py-1 font-bold uppercase tracking-wider text-[9px] md:text-xs transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,70,85,0.3)] hover:shadow-none rounded-none border-none shrink-0 whitespace-nowrap"
                >
                  Sell Account
                </button>
              )
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className={`p-1.5 rounded-none border border-white/5 hover:bg-white/5 transition-all duration-300 group ${loading ? 'opacity-50 cursor-not-allowed' : ''} shrink-0`}
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
