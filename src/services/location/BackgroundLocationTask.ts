import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { RideTrackingUseCase } from '@/domain/usecases/rideTrackingUseCase'
import { LiveLocationType } from '@/types/ride'

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK'

const rideTrackingUseCase = new RideTrackingUseCase()
let lastUpdateTime = 0

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background Location Task Error:', error)
    return
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] }
    const location = locations[0] // Pega a mais recente

    if (!location) return

    // 1. Verificar se existe missão ativa
    // Acessa o store diretamente (fora do hook)
    const { currentMissionId } = useAuthStore.getState()

    if (!currentMissionId) {
      // Se não tem missão, tecnicamente poderíamos parar o tracking aqui,
      // mas geralmente o LocationContext controla o stopTracking.
      // Vamos apenas ignorar o update.
      console.log('BackgroundLocation: Sem missão ativa, ignorando.')
      return
    }

    // 2. Throttle (ex: 1 update a cada 5s)
    const now = Date.now()
    if (now - lastUpdateTime < 5000) {
      return
    }
    lastUpdateTime = now

    console.log('BackgroundLocation: Salvando ponto...', location.coords)

    try {
        const tracking = await rideTrackingUseCase.getOneByField('ride_id', currentMissionId)

        const newPath: LiveLocationType = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date()
          // heading: location.coords.heading, // Opcional se tiver no type
          // speed: location.coords.speed // Opcional
        }

        if (!tracking) {
           // Se não existir, cria (embora já deva existir ao iniciar a corrida)
           await rideTrackingUseCase.create({
             ride_id: currentMissionId,
             path: [newPath]
           })
        } else {
           // Appends to existing path
           const newTempPath = [...tracking.path, newPath]
            await rideTrackingUseCase.update(tracking.id, {
                path: newTempPath
            })
        }

    } catch (err) {
      console.error('BackgroundLocation: Erro ao salvar ponto:', err)
    }
  }
})
