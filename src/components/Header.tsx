'use client'

import React from 'react'
import { UserButton, SignedIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Account } from '@/utils/storage'
import { Logo } from './Logo'
import LandingButtons from './LandingButtons'
import { HelpCircle } from 'lucide-react'

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
        <Logo />

        <div className="flex items-center gap-6">
          {hasAccounts && (
            <>
              <div className="hidden md:flex gap-2 items-center">
                <span className="text-sm text-zinc-500 font-bold tracking-widest uppercase">Accounts: </span>
                <span className="text-sm font-black text-white">{accounts.length}</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
            </>
          )}

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
                <UserButton>
                  <UserButton.MenuItems>
                    {accounts.flatMap((account) => {
                      const playerCardId = account.data.loadout?.Identity?.PlayerCardID
                      const card = playerCardsData?.find((c: any) => c.uuid === playerCardId)
                      const isActive = activeAccountId === account.id

                      return [
                        <UserButton.Action
                          key={`select-${account.id}`}
                          label={`${account.name} #${account.tag}${isActive ? ' (Selected)' : ''}`}
                          labelIcon={
                            <div className="w-6 h-6 rounded border border-white/10 overflow-hidden bg-zinc-800">
                              {card ? (
                                <img src={card.smallArt || card.displayIcon} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                                  {account.name[0]}
                                </div>
                              )}
                            </div>
                          }
                          onClick={() => onSelect(account.id)}
                        />,
                        <UserButton.Action
                          key={`remove-${account.id}`}
                          label={`Remove ${account.name} #${account.tag}`}
                          labelIcon={
                            <div className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </div>
                          }
                          onClick={() => onDelete(account.id)}
                        />
                      ]
                    })}

                    <UserButton.Action
                      label="Add Valorant Account"
                      labelIcon={
                        <div className="w-6 h-6 text-[#FF4655]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="M12 5v14" />
                          </svg>
                        </div>
                      }
                      onClick={onAdd}
                    />

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

