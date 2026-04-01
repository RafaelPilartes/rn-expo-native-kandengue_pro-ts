// src/hooks/useMissionHome.ts
import { useEffect, useState, useRef, useCallback } from 'react'
import { MissionUseCase } from '@/domain/usecases/missionUseCase'
import { MissionEntity } from '@/core/entities/Mission'
import { MissionProgressEntity } from '@/core/entities/MissionProgress'

const missionUseCase = new MissionUseCase()

interface MissionHomeData {
  mission: MissionEntity
  progress: MissionProgressEntity | null
  percentage: number
}

export function useMissionHome(driverId: string | undefined) {
  const [activeMissions, setActiveMissions] = useState<MissionEntity[]>([])
  const [driverProgress, setDriverProgress] = useState<MissionProgressEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const missionsUnsubRef = useRef<(() => void) | null>(null)
  const progressUnsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    missionsUnsubRef.current = missionUseCase.listenActiveMissions(missions => {
      setActiveMissions(missions)
      setIsLoading(false)
    })

    return () => {
      missionsUnsubRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (!driverId) return

    progressUnsubRef.current = missionUseCase.listenDriverProgress(
      driverId,
      progress => {
        setDriverProgress(progress)
      }
    )

    return () => {
      progressUnsubRef.current?.()
    }
  }, [driverId])

  const getBestMission = useCallback((): MissionHomeData | null => {
    if (activeMissions.length === 0) return null

    let best: MissionHomeData | null = null
    let bestPercentage = -1

    for (const mission of activeMissions) {
      const progress = driverProgress.find(p => p.mission_id === mission.id) || null
      const current = progress?.current_count ?? 0
      const percentage = Math.min((current / mission.target) * 100, 100)

      // Prioritize: incomplete missions closest to completion
      if (!progress?.is_completed && percentage > bestPercentage) {
        bestPercentage = percentage
        best = { mission, progress, percentage }
      }
    }

    // If all are completed, show the most recently completed
    if (!best && activeMissions.length > 0) {
      const mission = activeMissions[0]
      const progress = driverProgress.find(p => p.mission_id === mission.id) || null
      const current = progress?.current_count ?? 0
      const percentage = Math.min((current / mission.target) * 100, 100)
      best = { mission, progress, percentage }
    }

    return best
  }, [activeMissions, driverProgress])

  const allMissionsWithProgress = useCallback((): MissionHomeData[] => {
    return activeMissions.map(mission => {
      const progress = driverProgress.find(p => p.mission_id === mission.id) || null
      const current = progress?.current_count ?? 0
      const percentage = Math.min((current / mission.target) * 100, 100)
      return { mission, progress, percentage }
    })
  }, [activeMissions, driverProgress])

  return {
    bestMission: getBestMission(),
    allMissions: allMissionsWithProgress(),
    isLoading,
    hasMissions: activeMissions.length > 0
  }
}
