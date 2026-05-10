'use client'

import Link from 'next/link'

interface InstructionSectionProps {
  redirectUrl: string
  setRedirectUrl: (url: string) => void
  handleGetInfo: () => void
  loading: boolean
  error: string
}

export const InstructionSection = ({
  redirectUrl,
  setRedirectUrl,
  handleGetInfo,
  loading,
  error
}: InstructionSectionProps) => {
  return (
    <>
      <div
        className="
          mb-8
          bg-zinc-900
          border
          border-zinc-700
          rounded-2xl
          p-6
          space-y-4
        "
      >
        <h2 className="text-2xl font-bold">
          How to get Riot access token
        </h2>

        <ol className="list-decimal pl-6 space-y-3 text-zinc-300">
          <li>
            Logout from old Riot accounts with the link: <Link href="https://auth.riotgames.com/logout" target="_blank" className="text-red-400 bg-black border border-zinc-800 rounded-xl p-2 text-sm font-mono ml-2">Logout</Link>
          </li>
          <li>
            Open this Riot authorization URL in your browser:
            <Link
              href="https://auth.riotgames.com/authorize?redirect_uri=http://localhost/redirect&client_id=riot-client&response_type=token%20id_token&nonce=1&scope=openid%20link%20ban%20lol_region%20account"
              target="_blank"
              className="
                bg-black
                border
                border-zinc-800
                rounded-xl
                p-2
                text-sm
                font-mono
                text-red-400
                ml-2
              "
            >
              URL
            </Link>
          </li>
        </ol>

        <ol
          start={2}
          className="list-decimal pl-6 space-y-3 text-zinc-300"
        >
          <li>
            Login with your Riot account
          </li>

          <li>
            After login, Riot will redirect you to a URL that looks like:
          </li>
        </ol>

        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-xl
            p-4
            text-sm
            font-mono
            break-all
            text-zinc-400
          "
        >
          http://localhost/redirect#access_token=...
        </div>

        <ol
          start={4}
          className="list-decimal pl-6 space-y-3 text-zinc-300"
        >
          <li>
            Copy the FULL redirected URL
          </li>

          <li>
            Paste it into the input below
          </li>
        </ol>
      </div>

      <input
        value={redirectUrl}
        onChange={(e) =>
          setRedirectUrl(e.target.value)
        }
        placeholder="Paste full Riot redirect URL"
        className="
          w-full
          bg-zinc-900
          border
          border-zinc-700
          rounded-2xl
          p-4
          text-sm
          font-mono
        "
      />

      <button
        onClick={handleGetInfo}
        disabled={loading}
        className="
          mt-4
          bg-red-500
          hover:bg-red-600
          px-6
          py-3
          rounded-2xl
          font-semibold
        "
      >
        {loading
          ? 'Loading...'
          : 'Check'}
      </button>

      {error && (
        <div className="mt-4 text-red-400">
          {error}
        </div>
      )}
    </>
  )
}
