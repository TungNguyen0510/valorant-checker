import Link from 'next/link'
import { Logo } from './Logo'

export const Footer = () => {
  return (
    <footer className="w-full bg-[#0F1923] border-t border-white/5 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Logo className="opacity-80 grayscale hover:grayscale-0 transition-all duration-300 scale-90 origin-left" />
          <p className="text-zinc-500 text-sm max-w-md text-center md:text-left font-medium">
            A premium tool for Valorant players to check their account collections, daily stores, night market offers and match history.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold tracking-widest uppercase">
            <span>By</span>
            <Link
              href="https://github.com/TungNguyen0510"
              target="_blank"
              className="text-[#FF4655] hover:text-white transition-colors underline decoration-2 underline-offset-4 decoration-[#FF4655]/30 hover:decoration-[#FF4655]"
            >
              TungNguyen0510
            </Link>
          </div>
          <p className="text-zinc-600 text-[10px] font-black tracking-[0.2em] uppercase">
            Powered by Valorant Checker
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
        <p>© {new Date().getFullYear()} Valorant Checker. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/faq" className="hover:text-zinc-400 transition-colors">FAQ</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
