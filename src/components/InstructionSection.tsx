'use client'

import Link from 'next/link'
import { BaseDialog } from './BaseDialog'

interface InstructionSectionProps {
  redirectUrl: string
  setRedirectUrl: (url: string) => void
  handleGetInfo: () => void
  loading: boolean
  error: string
  onClose: () => void
  title?: string
  submitText?: string
  reauthAccountName?: string
}

export const InstructionSection = ({
  redirectUrl,
  setRedirectUrl,
  handleGetInfo,
  loading,
  error,
  onClose,
  title = "Add Valorant Account",
  submitText = "Add Account",
  reauthAccountName
}: InstructionSectionProps) => {
  return (
    <BaseDialog
      isOpen={true}
      onClose={onClose}
      title={title}
      description="Step-by-step Guide"
      maxWidth="2xl"
    >
      <div className="p-8 space-y-6">
        {reauthAccountName && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-none mt-0.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" x2="12" y1="9" y2="13"/>
              <line x1="12" x2="12.01" y1="17" y2="17"/>
            </svg>
            <div className="text-sm font-bold text-amber-500 leading-normal">
              Re-authenticating account: <span className="text-white underline decoration-amber-500/30 decoration-2 underline-offset-4">{reauthAccountName}</span>. Please make sure you login with the correct Riot account.
            </div>
          </div>
        )}

        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 space-y-4">
          <ol className="space-y-4 text-sm">
            <li className="flex gap-4">
              <span className="flex-none w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-400">01</span>
              <div className="text-zinc-300">
                Logout from existing Riot accounts:
                <Link
                  href="https://auth.riotgames.com/logout"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 ml-2 px-3 py-1 bg-black border border-zinc-800 rounded text-[10px] font-bold text-red-400 hover:border-red-500/50 transition-colors uppercase tracking-widest"
                >
                  Logout Session
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </Link>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-none w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-400">02</span>
              <div className="text-zinc-300">
                Open authorization URL and login:
                <Link
                  href="https://auth.riotgames.com/authorize?redirect_uri=http://localhost/redirect&client_id=riot-client&response_type=token%20id_token&nonce=1&scope=openid%20link%20ban%20lol_region%20account"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 ml-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-all uppercase tracking-widest"
                >
                  Authorize App
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </Link>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-none w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-400">03</span>
              <div className="text-zinc-300">
                Copy the <span className="text-white font-bold italic">FULL</span> URL after Riot redirects you to localhost.
              </div>
            </li>
          </ol>

          <div className="mt-4 p-3 bg-black/50 border border-zinc-800 rounded-lg">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Example URL structure:</p>
            <code className="text-[11px] text-zinc-400 break-all leading-relaxed">
              http://localhost/redirect#access_token=eyJhbG...
            </code>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black tracking-[0.2em] text-zinc-500 ml-1">
            Redirect URL
          </label>
          <input
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            placeholder="Paste full Riot redirect URL here"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all shadow-inner"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleGetInfo}
            disabled={loading || !redirectUrl}
            className="flex-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              submitText
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-none mt-0.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <div className="text-sm font-bold text-red-500">
              {error}
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  )
}
