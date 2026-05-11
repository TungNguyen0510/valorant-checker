'use client'

import React from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { BaseDialog } from './BaseDialog'

interface MatchDetailProps {
  isOpen: boolean
  onClose: () => void
  match: any
  puuid?: string
  agentsData?: any[]
  mapsData?: any[]
}

export const MatchDetail = ({
  isOpen,
  onClose,
  match,
  puuid,
  agentsData,
  mapsData
}: MatchDetailProps) => {
  if (!match) return null

  const matchInfo = match.matchInfo || {}
  const players = match.players || []
  const teams = match.teams || []
  const map = mapsData?.find((m: any) => m.mapUrl.toLowerCase() === (matchInfo.mapId || '').toLowerCase())

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0))

  // Split players into teams
  const myPlayer = players.find((p: any) => p.subject.toLowerCase() === puuid?.toLowerCase())
  const myTeamId = myPlayer?.teamId

  const teamBlue = sortedPlayers.filter(p => p.teamId === 'Blue')
  const teamRed = sortedPlayers.filter(p => p.teamId === 'Red')

  const blueScore = teams.find((t: any) => t.teamId === 'Blue')?.roundsWon || 0
  const redScore = teams.find((t: any) => t.teamId === 'Red')?.roundsWon || 0

  const getAgentIcon = (characterId: string) => {
    const agent = agentsData?.find(a => a.uuid.toLowerCase() === characterId.toLowerCase())
    return agent?.displayIconSmall || agent?.displayIcon
  }

  const getAgentName = (characterId: string) => {
    const agent = agentsData?.find(a => a.uuid.toLowerCase() === characterId.toLowerCase())
    return agent?.displayName || 'Unknown'
  }

  const renderTeamTable = (teamPlayers: any[], teamId: string, score: number) => {
    const isMyTeam = myTeamId === teamId
    const color = teamId === 'Blue' ? 'blue' : 'red'
    const teamLabel = isMyTeam ? 'Ally Team' : 'Enemy Team'

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-6 ${color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
            <h3 className="text-xl font-heading uppercase italic text-white tracking-tight">
              {teamLabel}
            </h3>
          </div>
          <div className={`text-3xl font-heading italic ${color === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
            {score}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-white/40">
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2 text-center">Score</th>
                <th className="px-4 py-2 text-center">K/D/A</th>
                <th className="px-4 py-2 text-center">ADR</th>
                <th className="px-4 py-2 text-center">ACS</th>
              </tr>
            </thead>
            <tbody>
              {teamPlayers.map((player) => {
                const isMe = player.subject.toLowerCase() === puuid?.toLowerCase()
                const stats = player.stats || {}
                const rounds = matchInfo.roundPlayed || blueScore + redScore
                const adr = Math.round((stats.score || 0) / rounds)
                const acs = Math.round((stats.score || 0) / rounds) // Using ACS as placeholder for Score/Rounds

                return (
                  <tr
                    key={player.subject}
                    className={`group transition-all duration-300 ${isMe ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/8'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 overflow-hidden bg-black/20 border border-white/10 group-hover:border-white/30 transition-colors">
                        <img
                          src={getAgentIcon(player.characterId)}
                          alt=""
                          className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className={`font-bold transition-colors ${isMe ? 'text-[#FF4655]' : 'text-white group-hover:text-white'}`}>
                          {isMe ? 'Me' : (player.gameName || 'Player')}
                        </span>
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-tighter">
                          {getAgentName(player.characterId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-heading text-lg text-white">
                      {stats.score || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-heading text-lg tracking-tighter">
                        <span className="text-white">{stats.kills || 0}</span>
                        <span className="text-white/20">/</span>
                        <span className="text-[#FF4655]">{stats.deaths || 0}</span>
                        <span className="text-white/20">/</span>
                        <span className="text-white/60">{stats.assists || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-white font-bold">{adr}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-white/60 font-bold">{acs}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="7xl"
      title="Match Details"
      description={`Battle Report • ${format(new Date(matchInfo.gameStartMillis), 'MMMM dd, yyyy HH:mm')}`}
    >
      <div className="relative p-6 md:p-10 space-y-12">
        {/* Background Map Splash */}
        <div className="absolute inset-0 -z-10 opacity-10">
          {map?.splash && (
            <img src={map.splash} alt="" className="w-full h-full object-cover grayscale" />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-[#0f1923] via-transparent to-[#0f1923]" />
        </div>

        {/* Top Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start p-6 bg-white/5 border border-white/10 relative group hover:border-[#FF4655]/40 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4655] mb-2">Map</span>
            <span className="text-2xl font-heading uppercase italic text-white">{map?.displayName || 'Unknown'}</span>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 group-hover:border-[#FF4655] transition-colors" />
          </div>

          <div className="flex flex-col items-center md:items-start p-6 bg-white/5 border border-white/10 relative group hover:border-[#FF4655]/40 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4655] mb-2">Mode</span>
            <span className="text-2xl font-heading uppercase italic text-white">
              {matchInfo.queueId === 'competitive' ? 'Competitive' :
                matchInfo.queueId === 'unrated' ? 'Unrated' :
                  matchInfo.queueId || 'Custom'}
            </span>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 group-hover:border-[#FF4655] transition-colors" />
          </div>

          <div className="flex flex-col items-center md:items-start p-6 bg-white/5 border border-white/10 relative group hover:border-[#FF4655]/40 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4655] mb-2">Duration</span>
            <span className="text-2xl font-heading uppercase italic text-white">
              {Math.floor((matchInfo.gameLengthMillis || 0) / 60000)}m
            </span>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 group-hover:border-[#FF4655] transition-colors" />
          </div>

          <div className="flex flex-col items-center md:items-start p-6 bg-white/5 border border-white/10 relative group hover:border-[#FF4655]/40 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4655] mb-2">Rounds</span>
            <span className="text-2xl font-heading uppercase italic text-white">{matchInfo.roundPlayed || blueScore + redScore}</span>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 group-hover:border-[#FF4655] transition-colors" />
          </div>
        </div>

        {/* Scoreboard */}
        <div className="grid lg:grid-cols-2 gap-12">
          {renderTeamTable(teamBlue, 'Blue', blueScore)}
          {renderTeamTable(teamRed, 'Red', redScore)}
        </div>

        {/* Round History Placeholder (Optional) */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] text-center">
            Detailed round history and heatmaps available in future updates
          </p>
        </div>
      </div>
    </BaseDialog>
  )
}
