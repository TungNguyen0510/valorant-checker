/* eslint-disable @next/next/no-img-element */
import { KCIcon } from './Icons'

interface AccessoryCardProps {
  displayName: string
  displayIcon: string
  price?: number
  itemTypeId?: string
  className?: string
}

export const AccessoryCard = ({
  displayName,
  displayIcon,
  price,
  itemTypeId,
  className = ""
}: AccessoryCardProps) => {
  return (
    <div className={`flex flex-col bg-zinc-900 border-t border-zinc-700 overflow-hidden group cursor-default ${className}`}>
      <div className="flex-1 min-h-[160px] flex items-center justify-center p-6 relative bg-linear-to-t from-teal-500/10 to-transparent">
        {displayIcon ? (
          <img
            src={displayIcon}
            alt={displayName}
            className={`w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-lg relative z-10 ${itemTypeId?.toLowerCase() === 'd5f120f8-ff8c-4f40-a15d-209c7130549c' ? 'max-h-32' : 'max-h-24'}`}
          />
        ) : (
          <div className="text-zinc-500 text-sm text-center font-bold uppercase tracking-widest px-4">
            {displayName}
          </div>
        )}
      </div>

      <div className="bg-[#1f2326] px-4 py-3 flex items-center justify-between border-t border-zinc-800">
        <span className="text-zinc-300 font-bold text-[10px] tracking-wider truncate mr-4">
          {displayName}
        </span>
        {price !== undefined && (
          <div className="flex items-center gap-1.5 shrink-0 text-teal-400 font-bold">
            <KCIcon className="w-3.5 h-3.5" />
            <span className="text-sm">{price.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
