'use client'

import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { MatchDetail } from './MatchDetail'

interface MatchHistoryProps {
  puuid?: string
  rankData: any
  matchHistory: any
  competitiveUpdates?: any
  matchDetails?: any[]
  mapsData: any[] | undefined
  competitiveTiersData: any[] | undefined
  gameModesData: any[] | undefined
  agentsData: any[] | undefined
}

export const MatchHistory = ({
  puuid,
  rankData,
  matchHistory,
  competitiveUpdates,
  matchDetails,
  mapsData,
  competitiveTiersData,
  gameModesData,
  agentsData
}: MatchHistoryProps) => {
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  // Extract competitive rank info
  const latestTier = rankData?.LatestCompetitiveUpdate?.TierAfterUpdate || 0
  const latestRR = rankData?.LatestCompetitiveUpdate?.RankedRatingAfterUpdate || 0

  // Find tier info from valorant-api
  const tierInfo = competitiveTiersData?.[competitiveTiersData.length - 1]?.tiers?.find(
    (t: any) => t.tier === latestTier
  )

  // Merge match history with competitive updates and details
  const rawMatches = matchHistory?.History || []
  const compMatches = competitiveUpdates?.Matches || []

  const matches = rawMatches.map((m: any) => {
    const compMatch = compMatches.find((cm: any) => cm.MatchID === m.MatchID)
    const details = matchDetails?.find((d: any) => d?.matchInfo?.matchId?.toLowerCase() === m.MatchID?.toLowerCase())

    // Calculate RR change
    let rrChange = 0
    let isWin = false
    let isLoss = false
    let movementType = 'STAGNANT'

    if (compMatch) {
      const before = compMatch.RankedRatingBeforeUpdate || 0
      const after = compMatch.RankedRatingAfterUpdate || 0
      const tierBefore = compMatch.TierBeforeUpdate || 0
      const tierAfter = compMatch.TierAfterUpdate || 0
      movementType = compMatch.CompetitiveMovement || 'STAGNANT'

      if (tierAfter > tierBefore) {
        rrChange = (after + 100) - before
      } else if (tierAfter < tierBefore) {
        rrChange = after - (before + 100)
      } else {
        rrChange = after - before
      }

      isWin = rrChange > 0 || ['INCREASE', 'MINOR_INCREASE', 'PROMOTED'].includes(movementType)
      isLoss = rrChange < 0 || ['DECREASE', 'MINOR_DECREASE', 'DEMOTED'].includes(movementType)
    }

    const queueID = (m.QueueID || details?.matchInfo?.queueID || '').toLowerCase()
    const isDeathmatch = queueID === 'deathmatch'

    // Extract Stats
    let playerStats: any = null
    let score = null
    let agent = null
    let adr = 0
    let isMatchMVP = false
    let isTeamMVP = false

    if (details && puuid) {
      const allPlayers = details.players || []
      const me = allPlayers.find((p: any) => p.subject?.toLowerCase() === puuid?.toLowerCase())

      if (me) {
        playerStats = me.stats
        agent = agentsData?.find((a: any) => a.uuid.toLowerCase() === me.characterId?.toLowerCase())

        const roundsPlayed = details.matchInfo?.roundPlayed || 1
        adr = Math.round((me.stats?.score || 0) / roundsPlayed)

        // MVP Logic
        if (isDeathmatch) {
          isMatchMVP = (me.stats?.kills || 0) >= 40
          isTeamMVP = false
          isWin = (me.stats?.kills || 0) >= 40
          isLoss = !isWin
        } else {
          const sortedMatch = [...allPlayers].sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0))
          isMatchMVP = sortedMatch[0]?.subject === me.subject

          const myTeamPlayers = allPlayers.filter((p: any) => p.teamId === me.teamId)
          const sortedTeam = [...myTeamPlayers].sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0))
          isTeamMVP = !isMatchMVP && sortedTeam[0]?.subject === me.subject
        }

        const myTeam = details.teams?.find((t: any) => t.teamId === me.teamId)
        const enemyTeam = details.teams?.find((t: any) => t.teamId !== me.teamId)
        if (myTeam && enemyTeam) {
          score = {
            won: myTeam.roundsWon,
            lost: enemyTeam.roundsWon
          }
          if (!isWin && !isLoss) {
            isWin = score.won > score.lost
            isLoss = score.lost > score.won
          }
        }
      }
    }

    return {
      ...m,
      QueueID: queueID,
      isDeathmatch,
      MapID: m.MapID || compMatch?.MapID || details?.matchInfo?.mapId,
      TierAfterUpdate: compMatch?.TierAfterUpdate,
      RankedRatingAfterUpdate: compMatch?.RankedRatingAfterUpdate,
      rrChange,
      isWin,
      isLoss,
      playerStats,
      score,
      agent,
      adr,
      isMatchMVP,
      isTeamMVP,
      gameStartTime: m.GameStartTime || details?.matchInfo?.gameStartMillis
    }
  })

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Rank Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-none border border-white/10 bg-[#0F1923] p-1 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,70,85,0.15),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4655]">Current Rating</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-heading uppercase italic tracking-tighter text-white">
              {tierInfo?.tierName || 'Unranked'}
            </h2>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#FF4655]/20 blur-[60px] rounded-full scale-150 animate-pulse" />
            {tierInfo?.largeIcon ? (
              <img
                src={tierInfo.largeIcon}
                alt=""
                className="size-24 md:size-36 relative drop-shadow-[0_0_30px_rgba(255,70,85,0.4)] transition-transform hover:scale-105 duration-700"
              />
            ) : (
              <div className="w-40 h-40 bg-white/5 rounded-none flex items-center justify-center border border-white/10">
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">NO RANK</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end space-y-4 min-w-[200px]">
            <div className="text-right">
              <span className="text-4xl font-heading text-white">{latestRR}</span>
              <span className="text-lg font-black text-white/40 ml-2 italic uppercase">RR</span>
            </div>
            <div className="w-full h-2 bg-white/10 relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${latestRR}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute inset-y-0 left-0 bg-[#FF4655] shadow-[0_0_10px_#FF4655]"
              />
            </div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">Progress to next rank</p>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF4655]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF4655]" />
      </motion.div>

      {/* Matches Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-[#FF4655] skew-x-[-20deg]" />
            <h3 className="text-2xl font-heading uppercase italic text-white tracking-tight">Match History</h3>
            <span className="px-2 py-0.5 bg-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/10">Last {matches.length} Matches</span>
          </div>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {matches.map((match: any, idx: number) => {
              const map = mapsData?.find((m: any) => m.mapUrl === match.MapID)
              const date = new Date(match.GameStartTime || match.gameStartTime)
              const isWin = match.isWin
              const isLoss = match.isLoss

              return (
                <motion.div
                  key={match.MatchID || idx}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.4 }}
                  onClick={() => {
                    const fullDetails = matchDetails?.find((d: any) => d?.matchInfo?.matchId?.toLowerCase() === (match.MatchID || match.matchId)?.toLowerCase())
                    if (fullDetails) setSelectedMatch(fullDetails)
                  }}
                  className={`group relative overflow-hidden border cursor-pointer ${isWin ? 'border-emerald-500/20 bg-emerald-500/5' : isLoss ? 'border-[#FF4655]/20 bg-[#FF4655]/5' : 'border-white/10 bg-white/5'} transition-all hover:border-white/30`}
                >
                  {/* Left Accent Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isWin ? 'bg-emerald-500' : isLoss ? 'bg-[#FF4655]' : 'bg-white/40'}`} />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:h-28 overflow-hidden">

                    {/* Agent Section */}
                    <div className="relative h-40 sm:h-full w-full sm:w-48 overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-black/40 z-10" />
                      {match.agent?.displayIconSmall ? (
                        <img
                          src={match.agent.displayIconSmall}
                          alt=""
                          className="absolute inset-0 w-full h-full object-contain object-top scale-150 -translate-y-4 group-hover:scale-[1.6] transition-transform duration-700"
                        />
                      ) : match.agent?.displayIcon && (
                        <img
                          src={match.agent.displayIcon}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                        />
                      )}
                    </div>

                    {/* Stats Section */}
                    <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 items-center p-6 gap-6 sm:gap-4 font-body">

                      {/* Map & Date */}
                      <div className="flex flex-col">
                        <h4 className="text-lg font-heading uppercase italic text-white group-hover:text-[#FF4655] transition-colors">
                          {map?.displayName || 'Unknown Map'}
                        </h4>
                        <span className="text-[10px] font-black text-[#FF4655] uppercase tracking-tighter italic">
                          {match.QueueID}
                        </span>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                          {format(date, 'MMM dd • HH:mm')}
                        </p>
                      </div>

                      {/* Performance */}
                      <div className="flex flex-col items-start md:items-center">
                        <div className="flex items-center gap-1.5 font-heading text-xl tracking-tighter">
                          <span className="text-white">{match.playerStats?.kills || 0}</span>
                          <span className="text-white/20">/</span>
                          <span className="text-[#FF4655]">{match.playerStats?.deaths || 0}</span>
                          <span className="text-white/20">/</span>
                          <span className="text-white/60">{match.playerStats?.assists || 0}</span>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-heading text-white">{match.adr || 0}</span>
                          <span className="text-sm font-bold text-white/50 italic uppercase">ADR</span>
                        </div>

                      </div>

                      {/* ADR & Score */}
                      <div className="flex flex-col items-start md:items-center">
                        {match.isDeathmatch ? (
                          <div className={`flex items-center gap-1 mt-1 font-heading text-xl uppercase italic tracking-tighter ${match.isWin ? 'text-emerald-400' : 'text-[#FF4655]'}`}>
                            {match.isWin ? 'WIN' : 'LOST'}
                          </div>
                        ) : match.score && (
                          <div className="flex items-center gap-1 mt-1 font-bold text-xl uppercase">
                            <span className="text-emerald-400">{match.score.won}</span>
                            <span className="text-white/20">:</span>
                            <span className="text-[#FF4655]">{match.score.lost}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {match.isMatchMVP && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs font-black uppercase rounded-sm border border-yellow-500/20">Match MVP</span>
                          )}
                          {match.isTeamMVP && (
                            <span className="px-1.5 py-0.5 bg-white/10 text-white/80 text-xs font-black uppercase rounded-sm border border-white/20">Team MVP</span>
                          )}
                        </div>
                      </div>

                      {/* Rank Change */}
                      <div className="flex flex-col items-end sm:pr-4">
                        {match.QueueID === 'competitive' && match.TierAfterUpdate !== undefined && (
                          <>
                            <div className={`text-2xl font-heading italic ${match.rrChange >= 0 ? 'text-emerald-400' : 'text-[#FF4655]'}`}>
                              {match.rrChange > 0 ? '+' : ''}{match.rrChange}
                              <span className="text-[10px] ml-1 font-black opacity-90 uppercase">RR</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Map Splash Background */}
                  {map?.splash && (
                    <div className="absolute inset-0 -z-10 opacity-70 group-hover:opacity-80 transition-opacity duration-700">
                      <img src={map.splash} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-linear-to-l from-black via-transparent to-black" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {matches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center justify-center border border-white/5 bg-white/2"
            >
              <div className="w-16 h-1 bg-white/10 mb-4" />
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">No Battle Logs Detected</p>
            </motion.div>
          )}
        </div>
      </div>

      <MatchDetail
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
        puuid={puuid}
        agentsData={agentsData}
        mapsData={mapsData}
      />
    </div>
  )
}
