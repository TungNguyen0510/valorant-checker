'use client'

import React from 'react'
import { UserButton, SignedIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Account } from '@/utils/storage'
import { Logo } from './Logo'
import LandingButtons from './LandingButtons'
import { HelpCircle } from 'lucide-react'

interface AccountSwitcherProps {
  accounts: Account[]
  activeAccountId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
  playerCardsData: any[]
}

const AccountSwitcher = ({
  accounts,
  activeAccountId,
  onSelect,
  onDelete,
  onAdd,
  playerCardsData,
}: AccountSwitcherProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeAccount = accounts.find(a => a.id === activeAccountId)
  const activePlayerCardId = activeAccount?.data?.loadout?.Identity?.PlayerCardID
  const activeCard = playerCardsData?.find((c: any) => c.uuid === activePlayerCardId)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 transition-all select-none cursor-pointer"
      >
        {activeAccount ? (
          <>
            <div className="w-5 h-5 rounded overflow-hidden bg-zinc-800 border border-white/10 flex-none">
              {activeCard ? (
                <img src={activeCard.smallArt || activeCard.displayIcon} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {activeAccount.name[0]}
                </div>
              )}
            </div>
            <span className="truncate max-w-[120px]">{activeAccount.name}</span>
            <span className="text-zinc-500 text-xs">#{activeAccount.tag}</span>
          </>
        ) : (
          <span className="text-zinc-400">Select Account</span>
        )}
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
          className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Switch Account
          </div>

          <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5">
            {accounts.map((account) => {
              const playerCardId = account.data?.loadout?.Identity?.PlayerCardID
              const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)
              const isActive = activeAccountId === account.id

              return (
                <div
                  key={account.id}
                  onClick={() => {
                    onSelect(account.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group ${isActive
                    ? 'bg-zinc-900 border border-zinc-800 text-white font-bold'
                    : 'hover:bg-zinc-900 border border-transparent text-zinc-300 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded border border-white/10 overflow-hidden bg-zinc-800 flex-none">
                      {card ? (
                        <img src={card.smallArt || card.displayIcon} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {account.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col truncate leading-tight">
                      <span className="text-xs truncate">{account.name}</span>
                      <span className="text-[10px] text-zinc-500">#{account.tag}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-none">
                    {isActive && (
                      <span className="text-[8px] font-bold text-[#FF4655] uppercase tracking-widest mr-1 bg-[#FF4655]/10 px-1 py-0.5 rounded border border-[#FF4655]/20">
                        Active
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(account.id)
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-850 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove Account"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-zinc-800 my-1" />

          <button
            onClick={() => {
              onAdd()
              setIsOpen(false)
            }}
            className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold text-[#FF4655] hover:bg-[#FF4655]/10 border border-transparent hover:border-[#FF4655]/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5v14" />
            </svg>
            Add Account
          </button>
        </div>
      )}
    </div>
  )
}

interface HeaderProps {
  accounts?: Account[]
  activeAccountId?: string | null
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
  playerCardsData?: any[]
  showLandingButtons?: boolean
}

export const Header = ({
  accounts = [],
  activeAccountId = null,
  onSelect = () => { },
  onDelete = () => { },
  onAdd = () => { },
  playerCardsData = [],
  showLandingButtons = false,
}: HeaderProps) => {
  const hasAccounts = accounts.length > 0

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-[#FF4655] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/shop"
              className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-[#FF4655] transition-colors"
            >
              Shop
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {showLandingButtons ? (
              <div className="flex items-center gap-6">
                <Link
                  href="/faq"
                  className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-[#FF4655] transition-all duration-300 uppercase font-bold tracking-[0.2em] text-sm group"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#FF4655] transition-colors" />
                  <span>FAQ</span>
                </Link>
                <LandingButtons />
              </div>
            ) : (
              <SignedIn>
                {hasAccounts && (
                  <AccountSwitcher
                    accounts={accounts}
                    activeAccountId={activeAccountId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onAdd={onAdd}
                    playerCardsData={playerCardsData}
                  />
                )}
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action label="manageAccount" />
                    <UserButton.Action label="signOut" />
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
