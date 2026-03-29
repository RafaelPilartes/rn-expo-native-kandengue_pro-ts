// src/domain/usecases/missionUseCase.ts
import { missionRepository } from '@/modules/Api'
import { MissionEntity } from '@/core/entities/Mission'
import { MissionProgressEntity } from '@/core/entities/MissionProgress'
import type { ListResponseType } from '@/interfaces/IApiResponse'

export class MissionUseCase {
  private repository = missionRepository

  async getAll(
    limit?: number,
    offset?: number,
    searchTerm?: string,
    filters?: Partial<MissionEntity>
  ): Promise<ListResponseType<MissionEntity[]>> {
    try {
      return await this.repository.getAll(limit, offset, searchTerm, filters)
    } catch (error: any) {
      console.error('Erro ao buscar missões:', error)
      throw new Error(error.message || 'Erro ao buscar missões')
    }
  }

  async getById(id: string): Promise<MissionEntity | null> {
    try {
      return await this.repository.getById(id)
    } catch (error: any) {
      console.error(`Erro ao buscar missão ${id}:`, error)
      throw new Error(error.message || 'Erro ao buscar missão')
    }
  }

  async create(mission: Omit<MissionEntity, 'id'>): Promise<MissionEntity> {
    try {
      return await this.repository.create(mission)
    } catch (error: any) {
      console.error('Erro ao criar missão:', error)
      throw new Error(error.message || 'Erro ao criar missão')
    }
  }

  async update(id: string, mission: Partial<MissionEntity>): Promise<MissionEntity> {
    try {
      return await this.repository.update(id, mission)
    } catch (error: any) {
      console.error(`Erro ao atualizar missão ${id}:`, error)
      throw new Error(error.message || 'Erro ao atualizar missão')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.repository.delete(id)
    } catch (error: any) {
      console.error(`Erro ao deletar missão ${id}:`, error)
      throw new Error(error.message || 'Erro ao deletar missão')
    }
  }

  // Mission Progress
  async getProgress(
    driver_id: string,
    mission_id: string
  ): Promise<MissionProgressEntity | null> {
    try {
      return await this.repository.getProgress(driver_id, mission_id)
    } catch (error: any) {
      console.error(
        `Erro ao buscar progresso da missão ${mission_id} para o motorista ${driver_id}:`,
        error
      )
      throw new Error(error.message || 'Erro ao buscar progresso da missão')
    }
  }

  async updateProgress(
    progress: MissionProgressEntity
  ): Promise<MissionProgressEntity> {
    try {
      return await this.repository.updateProgress(progress)
    } catch (error: any) {
      console.error('Erro ao atualizar progresso da missão:', error)
      throw new Error(error.message || 'Erro ao atualizar progresso da missão')
    }
  }

  async getAllProgressByDriver(
    driver_id: string
  ): Promise<MissionProgressEntity[]> {
    try {
      return await this.repository.getAllProgressByDriver(driver_id)
    } catch (error: any) {
      console.error(
        `Erro ao buscar progresso de missões do motorista ${driver_id}:`,
        error
      )
      throw new Error(
        error.message || 'Erro ao buscar progresso de missões do motorista'
      )
    }
  }

  // Realtime
  listenActiveMissions(
    onUpdate: (missions: MissionEntity[]) => void
  ): () => void {
    try {
      return this.repository.listenActiveMissions(onUpdate)
    } catch (error: any) {
      console.error('Erro ao escutar missões ativas:', error)
      throw new Error(error.message || 'Erro ao escutar missões ativas')
    }
  }

  listenDriverProgress(
    driver_id: string,
    onUpdate: (progress: MissionProgressEntity[]) => void
  ): () => void {
    try {
      return this.repository.listenDriverProgress(driver_id, onUpdate)
    } catch (error: any) {
      console.error(
        `Erro ao escutar progresso de missões do motorista ${driver_id}:`,
        error
      )
      throw new Error(error.message || 'Erro ao escutar progresso de missões')
    }
  }
}
