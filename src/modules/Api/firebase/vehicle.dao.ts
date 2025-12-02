// modules/Api/firebase/vehicles.dao.ts
import type { IVehicleRepository } from '@/core/interfaces/IVehicleRepository'
import { VehicleEntity } from '@/core/entities/Vehicle'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  orderBy,
  limit as fbLimit,
  startAfter,
  getCountFromServer,
  FirebaseFirestoreTypes,
  onSnapshot
} from '@react-native-firebase/firestore'
import { db } from '@/config/firebase.config'
import { generateId } from '@/helpers/generateId'
import { ListResponseType } from '@/interfaces/IApiResponse'
import { firebaseCollections } from '@/constants/firebaseCollections'

export class FirebaseVehicleDAO implements IVehicleRepository {
  private vehiclesRef = collection(db, firebaseCollections.vehicles.root)

  // 🔹 Remove campos undefined antes de salvar
  private sanitize<T extends Record<string, any>>(data: T): T {
    return Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    ) as T
  }

  // helper: aplica filtros (where) sobre um ref/q
  private applyFilters(
    baseRef: FirebaseFirestoreTypes.Query,
    filters?: Partial<VehicleEntity>
  ) {
    let q: any = baseRef
    if (!filters) return q

    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== '') {
        q = query(q, where(field as string, '==', value))
      }
    })
    return q
  }

  /** 🔹 Listar vehicles com paginação + pesquisa opcional */
  async getAll(
    limitValue: number = 500,
    offset = 0,
    searchTerm?: string,
    filters?: Partial<VehicleEntity>
  ): Promise<ListResponseType<VehicleEntity[]>> {
    // 1) constrói query base aplicando filtros
    let baseQuery: any = this.applyFilters(this.vehiclesRef, filters)

    // 2) se tiver searchTerm
    const search = searchTerm?.toString().trim()
    if (search) {
      const lower = search.toLowerCase()
      baseQuery = query(
        baseQuery,
        orderBy('plate'),
        where('plate', '>=', lower),
        where('plate', '<=', lower + '\uf8ff')
      )
    } else {
      // padrão: ordena por createdAt (use o campo consistente no seu DB)
      baseQuery = query(baseQuery, orderBy('created_at', 'desc'))
    }

    // 3) conta total com mesma baseQuery (opcionalmente, se quiser performance, você pode evitar)
    let total = 0
    try {
      const countSnap = await getCountFromServer(baseQuery)
      total = countSnap.data().count
    } catch (err) {
      // se count falhar, não interrompe; continua sem count
      console.warn('Erro ao obter count:', err)
    }

    // 4) se offset > 0 -> precisamos do lastVisible correspondente ao offset
    let finalQuery = query(baseQuery, fbLimit(limitValue)) // default
    if (offset > 0) {
      // NOTE: esse "skip" é caro para offsets grandes — ver nota abaixo
      const skipQuery = query(baseQuery, fbLimit(offset))
      const skipSnap = await getDocs(skipQuery)
      const lastVisible = skipSnap.docs[skipSnap.docs.length - 1]
      if (!lastVisible) {
        // offset maior do que registros existentes
        return {
          data: [],
          pagination: { limit: limitValue, offset, count: total }
        }
      }
      finalQuery = query(
        baseQuery,
        startAfter(lastVisible),
        fbLimit(limitValue)
      )
    }

    const snapshot = await getDocs(finalQuery)

    if (snapshot.empty) {
      return {
        data: [],
        pagination: { limit: limitValue, offset, count: total }
      }
    }

    const vehicles = snapshot.docs.map(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        new VehicleEntity({
          ...(docSnap.data() as VehicleEntity)
        })
    )

    return {
      data: vehicles,
      pagination: {
        limit: limitValue,
        offset,
        count: total
      }
    }
  }

  async getById(id: string): Promise<VehicleEntity | null> {
    const docSnap = await getDoc(doc(this.vehiclesRef, id))
    if (!docSnap.exists()) return null
    const vehicleData = new VehicleEntity({
      ...(docSnap.data() as VehicleEntity)
    })
    return vehicleData
  }

  async getAllByField(
    field: keyof VehicleEntity,
    value: any,
    limit = 10,
    offset = 0
  ): Promise<ListResponseType<VehicleEntity[]>> {
    const filters: Partial<VehicleEntity> = { [field]: value } as any
    return this.getAll(limit, offset, undefined, filters)
  }

  async getOneByField(
    field: string,
    value: any
  ): Promise<VehicleEntity | null> {
    const querySnapshot = await getDocs(
      query(this.vehiclesRef, where(field, '==', value))
    )
    if (querySnapshot.empty) return null

    const adminData = new VehicleEntity({
      ...(querySnapshot.docs[0].data() as VehicleEntity)
    })
    return adminData
  }

  async create(vehicle: Omit<VehicleEntity, 'id'>): Promise<VehicleEntity> {
    const vehicleId = generateId('veh')
    const sanitized = {
      ...this.sanitize(vehicle),
      id: vehicleId,
      created_at: new Date()
    }

    await setDoc(doc(this.vehiclesRef, vehicleId), sanitized)

    const vehicleData = new VehicleEntity({ id: vehicleId, ...vehicle })
    return vehicleData
  }

  async update(
    id: string,
    vehicle: Partial<VehicleEntity>
  ): Promise<VehicleEntity> {
    const sanitized = {
      ...this.sanitize(vehicle),
      updated_at: new Date()
    }
    await updateDoc(doc(this.vehiclesRef, id), sanitized)

    const updated = await this.getById(id)
    if (!updated) throw new Error('Vehicle not found after update')

    return updated
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.vehiclesRef, id))
  }

  // --------------------------------------------------------------------
  // 🔥 REALTIME LISTENERS
  // --------------------------------------------------------------------

  listenById(
    id: string,
    onUpdate: (driver: VehicleEntity) => void,
    onError?: (err: Error) => void
  ) {
    const ref = doc(this.vehiclesRef, id)
    return onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const data = snap.data() as VehicleEntity
          onUpdate(new VehicleEntity({ ...data }))
        }
      },
      err => onError?.(err)
    )
  }

  listenByField(
    field: keyof VehicleEntity,
    value: string,
    onUpdate: (driver: VehicleEntity | null) => void,
    onError?: (err: Error) => void
  ) {
    const ref = query(this.vehiclesRef, where(field, '==', value))
    return onSnapshot(
      ref,
      snap => {
        if (snap.empty) {
          onUpdate(null)
          return
        }

        const doc = snap.docs[0]
        const data = doc.data() as VehicleEntity

        onUpdate(new VehicleEntity({ ...data }))
      },
      err => onError?.(err)
    )
  }

  /**
   * 🔹 LISTEN ALL BY FIELD: Escuta TODOS os veiculos que correspondem ao filtro
   * Retorna o array completo a cada atualização
   */
  listenAllByField(
    field: keyof VehicleEntity,
    value: any,
    onUpdate: (rides: VehicleEntity[]) => void,
    onError?: (err: Error) => void,
    options: {
      limit?: number
      orderBy?: keyof VehicleEntity
      orderDirection?: 'asc' | 'desc'
    } = {}
  ): () => void {
    const {
      limit = 50,
      orderBy: orderByField = 'created_at',
      orderDirection = 'desc'
    } = options

    try {
      // Construir query base
      let baseQuery: FirebaseFirestoreTypes.Query = query(
        this.vehiclesRef,
        where(field, '==', value)
      )

      // Aplicar ordenação
      baseQuery = query(
        baseQuery,
        orderBy(orderByField as string, orderDirection)
      )

      // Aplicar limite se especificado
      if (limit > 0) {
        baseQuery = query(baseQuery, fbLimit(limit))
      }

      return onSnapshot(
        baseQuery,
        snapshot => {
          const rides: VehicleEntity[] = []

          snapshot.forEach(
            (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
              const data = doc.data() as VehicleEntity
              const ride = new VehicleEntity({ ...data })
              rides.push(ride)
            }
          )

          console.log(
            `📡 [listenAllByField] ${field}=${value}: ${rides.length} veiculos`
          )
          onUpdate(rides)
        },
        err => {
          console.error(`Erro no listenerAll por ${field}=${value}:`, err)
          onError?.(err)
        }
      )
    } catch (error) {
      console.error(
        `Erro ao configurar listenerAll por ${field}=${value}:`,
        error
      )
      onError?.(error as Error)
      return () => {} // Retorna função vazia em caso de erro
    }
  }

  /**
   * 🔹 LISTEN ALL: Escuta TODOS os veiculos com filtros opcionais
   */
  listenAll(
    onUpdate: (rides: VehicleEntity[]) => void,
    onError?: (err: Error) => void,
    options: {
      filters?: Partial<VehicleEntity>
      limit?: number
      orderBy?: keyof VehicleEntity
      orderDirection?: 'asc' | 'desc'
    } = {}
  ): () => void {
    const {
      filters,
      limit = 100,
      orderBy: orderByField = 'created_at',
      orderDirection = 'desc'
    } = options

    try {
      // Construir query base
      let baseQuery: FirebaseFirestoreTypes.Query = this.vehiclesRef

      // Aplicar filtros
      if (filters) {
        baseQuery = this.applyFilters(baseQuery, filters)
      }

      // Aplicar ordenação
      baseQuery = query(
        baseQuery,
        orderBy(orderByField as string, orderDirection)
      )

      // Aplicar limite
      if (limit > 0) {
        baseQuery = query(baseQuery, fbLimit(limit))
      }

      return onSnapshot(
        baseQuery,
        snapshot => {
          const rides: VehicleEntity[] = []

          snapshot.forEach(
            (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
              const data = doc.data() as VehicleEntity
              const ride = new VehicleEntity({ ...data })
              rides.push(ride)
            }
          )

          console.log(`📡 [listenAll] ${rides.length} veiculos`)
          onUpdate(rides)
        },
        err => {
          console.error('Erro no listenerAll de veiculos:', err)
          onError?.(err)
        }
      )
    } catch (error) {
      console.error('Erro ao configurar listenerAll:', error)
      onError?.(error as Error)
      return () => {}
    }
  }
}
