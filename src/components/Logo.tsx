import Link from 'next/link'

interface LogoProps {
  className?: string
}

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <Link href="/" className="relative">
        <div className="size-8 bg-[#FF4655] flex items-center justify-center transform rotate-45 transition-transform group-hover:scale-110">
          <div className="transform -rotate-45 font-black text-white text-xl italic leading-none">V</div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#FF4655]/40 blur-md -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
      </Link>
      <div className="flex flex-col">
        <Link href="/">
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none hover:text-[#FF4655]/90 transition-colors">
            Valorant <span className="text-[#FF4655]">Checker</span>
          </h1>
        </Link>
      </div>
    </div>
  )
}
