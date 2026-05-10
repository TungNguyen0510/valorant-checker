/* eslint-disable @next/next/no-img-element */
'use client'

import { Account } from '@/utils/storage'

interface AccountSwitcherProps {
  accounts: Account[]
  activeAccountId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  playerCardsData: any[] | undefined
}

export const AccountSwitcher = ({
  accounts,
  activeAccountId,
  onSelect,
  onAdd,
  onDelete,
  playerCardsData,
}: AccountSwitcherProps) => {
  return (
    <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-4 items-center min-w-max p-2">
        {accounts.map((account) => {
          const playerCardId = account.data.loadout?.Identity?.PlayerCardID
          const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)
          const isActive = activeAccountId === account.id

          return (
            <div
              key={account.id}
              className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${isActive
                ? 'bg-zinc-800/50 border-zinc-500/50 backdrop-blur-md shadow-lg shadow-black/40 scale-[1.02]'
                : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20 backdrop-blur-sm'
                }`}
              onClick={() => onSelect(account.id)}
            >
              {card && (
                <div className="relative">
                  <img
                    src={card.smallArt || card.displayIcon}
                    alt="Account Card"
                    className="w-10 h-10 rounded-lg border border-zinc-700 object-cover shadow-inner"
                  />
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg border-2 border-white/20 animate-pulse" />
                  )}
                </div>
              )}
              <div className="pr-8">
                <div className="text-sm font-bold text-white leading-tight group-hover:text-teal-400 transition-colors">
                  {account.name}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">#{account.tag}</div>
              </div>

              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(account.id)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-linear-to-r from-transparent via-rose-500 to-transparent" />
              )}
            </div>
          )
        })}

        <button
          onClick={onAdd}
          className="flex items-center justify-center w-12 h-12 rounded-xl border border-dashed border-zinc-800 text-zinc-600 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/30 transition-all duration-300 group"
          title="Add Account"
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
            className="group-hover:rotate-90 transition-transform duration-300"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </div>
    </div>
  )
}
