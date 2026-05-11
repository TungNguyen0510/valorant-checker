'use client'

type TabId = 'store' | 'accessories' | 'nightmarket' | 'collection' | 'history'

interface Tab {
  id: TabId
  label: string
  show?: boolean
}

interface DashboardTabsProps {
  activeTab: TabId
  onTabChange: (id: TabId) => void
  showNightMarket: boolean
}

export const DashboardTabs = ({
  activeTab,
  onTabChange,
  showNightMarket,
}: DashboardTabsProps) => {
  const tabs: Tab[] = [
    { id: 'collection', label: 'Your Collection' },
    { id: 'store', label: 'Daily Store' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'nightmarket', label: 'Night Market', show: showNightMarket },
    { id: 'history', label: 'Match History' },
  ]

  return (
    <div className="fixed top-28 left-0 right-0 z-30 bg-black/50 backdrop-blur-xl py-2 flex flex-wrap justify-center gap-2">
      {tabs.map((tab) => {
        if (tab.show === false) return null

        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300
              ${isActive
                ? 'text-white bg-[#FF4655] shadow-[4px_4px_0px_0px_rgba(255,70,85,0.3)]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }
            `}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
