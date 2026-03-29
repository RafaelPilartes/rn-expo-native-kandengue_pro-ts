// src/viewModels/MissionViewModel.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MissionUseCase } from '@/domain/usecases/missionUseCase'
import { MissionEntity } from '@/core/entities/Mission'
import { MissionProgressEntity } from '@/core/entities/MissionProgress'
import type { ListResponseType } from '@/interfaces/IApiResponse'
import { firebaseCollections } from '@/constants/firebaseCollections'
import { useEffect, useRef } from 'react'

const missionUseCase = new MissionUseCase()

export function useMissionViewModel(
  limit?: number,
  offset?: number,
  searchTerm?: string,
  filters?: Partial<MissionEntity>
) {
  const queryClient = useQueryClient()

  const filtersKey = filters ? JSON.stringify(filters) : ''

  /** 🔹 Listar missões */
  const {
    data: missionsResponse,
    isLoading: loading,
    error,
    refetch
  } = useQuery<ListResponseType<MissionEntity[]>>({
    queryKey: [
      firebaseCollections.missions.root,
      limit,
      offset,
      searchTerm,
      filtersKey
    ],
    queryFn: () => missionUseCase.getAll(limit, offset, searchTerm, filters),
    staleTime: 1000 * 60 // cache 1min
  })

  /** 🔹 Criar missão */
  const createMission = useMutation({
    mutationFn: (mission: Omit<MissionEntity, 'id'>) =>
      missionUseCase.create(mission),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.missions.root]
      })
    }
  })

  /** 🔹 Atualizar missão */
  const updateMission = useMutation({
    mutationFn: ({ id, mission }: { id: string; mission: Partial<MissionEntity> }) =>
      missionUseCase.update(id, mission),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.missions.root]
      })
    }
  })

  /** 🔹 Deletar missão */
  const deleteMission = useMutation({
    mutationFn: (id: string) => missionUseCase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.missions.root]
      })
    }
  })

  /** 🔹 Buscar missão único (on-demand) */
  const fetchMissionById = async (id: string) => {
    try {
      return await missionUseCase.getById(id)
    } catch (err) {
      console.error('Erro ao buscar missão:', err)
      return null
    }
  }

  // PROGRESS
  /** 🔹 Atualizar progresso */
  const updateProgress = useMutation({
    mutationFn: (progress: MissionProgressEntity) =>
      missionUseCase.updateProgress(progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          firebaseCollections.missionProgress.root,
          variables.driver_id
        ]
      })
    }
  })

  /** 🔹 Buscar progresso de missão para motorista (on-demand) */
  const fetchProgress = async (driver_id: string, mission_id: string) => {
    try {
      return await missionUseCase.getProgress(driver_id, mission_id)
    } catch (err) {
      console.error('Erro ao buscar progresso:', err)
      return null
    }
  }

  /** 🔹 Buscar todos progressos de missões de um motorista (on-demand) */
  const fetchAllProgressByDriver = async (driver_id: string) => {
    try {
      return await missionUseCase.getAllProgressByDriver(driver_id)
    } catch (err) {
      console.error('Erro ao buscar todo os progressos do motorista:', err)
      return null
    }
  }

  // REALTIME
  const activeMissionsListenerRef = useRef<null | (() => void)>(null)
  const listenActiveMissions = (
    onUpdate: (missions: MissionEntity[]) => void
  ) => {
    if (activeMissionsListenerRef.current) {
      activeMissionsListenerRef.current() // remove anterior
    }
    const unsubscribe = missionUseCase.listenActiveMissions(onUpdate)
    activeMissionsListenerRef.current = unsubscribe
  }

  const driverProgressListenerRef = useRef<null | (() => void)>(null)
  const listenDriverProgress = (
    driver_id: string,
    onUpdate: (progress: MissionProgressEntity[]) => void
  ) => {
    if (driverProgressListenerRef.current) {
      driverProgressListenerRef.current() // remove anterior
    }
    const unsubscribe = missionUseCase.listenDriverProgress(driver_id, onUpdate)
    driverProgressListenerRef.current = unsubscribe
  }

  useEffect(() => {
    return () => {
      if (activeMissionsListenerRef.current)
        activeMissionsListenerRef.current()
      if (driverProgressListenerRef.current)
        driverProgressListenerRef.current()
    }
  }, [])

  return {
    // LISTA E PAGINAÇÃO
    missions: missionsResponse?.data ?? [],
    pagination: missionsResponse?.pagination,
    isLoadingMissions: loading,
    error,
    refresh: refetch,

    // CRUD
    createMission,
    updateMission,
    deleteMission,
    fetchMissionById,

    // PROGRESS
    updateProgress,
    fetchProgress,
    fetchAllProgressByDriver,

    // REALTIME
    listenActiveMissions,
    listenDriverProgress
  }
}
