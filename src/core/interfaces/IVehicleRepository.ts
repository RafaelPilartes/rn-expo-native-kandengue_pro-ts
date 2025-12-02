// core/interfaces/IVehicleRepository.ts
import type { ListResponseType } from '@/interfaces/IApiResponse'
import { VehicleEntity } from '../entities/Vehicle'

export interface IVehicleRepository {
  getAll(
    limit?: number,
    offset?: number,
    searchTerm?: string,
    filters?: Partial<VehicleEntity>
  ): Promise<ListResponseType<VehicleEntity[]>>
  getById(id: string): Promise<VehicleEntity | null>
  getAllByField(
    field: string,
    value: any,
    limit?: number,
    offset?: number
  ): Promise<ListResponseType<VehicleEntity[]>>
  getOneByField(field: string, value: any): Promise<VehicleEntity | null>
  create(Vehicle: Omit<VehicleEntity, 'id'>): Promise<VehicleEntity>
  update(id: string, Vehicle: Partial<VehicleEntity>): Promise<VehicleEntity>
  delete(id: string): Promise<void>
  listenById(
    id: string,
    onUpdate: (vehicle: VehicleEntity) => void,
    onError?: (err: Error) => void
  ): () => void
  listenByField(
    field: keyof VehicleEntity,
    value: string,
    onUpdate: (vehicle: VehicleEntity | null) => void,
    onError?: (err: Error) => void
  ): () => void

  listenAllByField(
    field: keyof VehicleEntity,
    value: any,
    onUpdate: (vehicles: VehicleEntity[]) => void,
    onError?: (err: Error) => void,
    options?: {
      limit?: number
      orderBy?: keyof VehicleEntity
      orderDirection?: 'asc' | 'desc'
    }
  ): () => void

  listenAll(
    onUpdate: (vehicles: VehicleEntity[]) => void,
    onError?: (err: Error) => void,
    options?: {
      filters?: Partial<VehicleEntity>
      limit?: number
      orderBy?: keyof VehicleEntity
      orderDirection?: 'asc' | 'desc'
    }
  ): () => void
}
