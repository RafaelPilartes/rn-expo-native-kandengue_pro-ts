import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { RideTrackingUseCase } from '@/domain/usecases/rideTrackingUseCase'
import { DriverUseCase } from '@/domain/usecases/driverUseCase'
import { LiveLocationType } from '@/types/ride'
import { determineTrackingMode } from '@/types/trackingTypes'

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK'

const rideTrackingUseCase = new RideTrackingUseCase()
const driverUseCase = new DriverUseCase()

let lastUpdateTime = 0

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background Location Task Error:', error)
    return
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] }
    const location = locations[0] // Get most recent location

    if (!location) return

    // Get current driver state
    const { driver, currentMissionId } = useAuthStore.getState()

    if (!driver) {
      console.log('📍 BackgroundLocation: Sem motorista, ignorando.')
      return
    }

    // Determine tracking mode
    const mode = determineTrackingMode(
      driver.is_online,
      driver.is_invisible ?? false,
      currentMissionId
    )

    console.log(`📍 BackgroundLocation: Modo detectado = ${mode}`)

    // Throttle updates
    const now = Date.now()
    const throttleTime = mode === 'RIDE' ? 5000 : 30000 // 5s for RIDE, 30s for AVAILABILITY

    if (now - lastUpdateTime < throttleTime) {
      return
    }
    lastUpdateTime = now

    try {
      if (mode === 'RIDE' && currentMissionId) {
        // --------------------------------------------------------
        // RIDE MODE: Update ride_tracking.path
        // --------------------------------------------------------
        console.log('🚗 Salvando ponto de corrida...', location.coords)

        const tracking = await rideTrackingUseCase.getOneByField(
          'ride_id',
          currentMissionId
        )

        const newPath: LiveLocationType = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date()
        }

        if (!tracking) {
          // Create tracking if it doesn't exist
          await rideTrackingUseCase.create({
            ride_id: currentMissionId,
            path: [newPath]
          })
        } else {
          // Append to existing path
          const newTempPath = [...tracking.path, newPath]
          await rideTrackingUseCase.update(tracking.id, {
            path: newTempPath
          })
        }

        // ALSO update driver's current location for real-time passenger view
        await driverUseCase.update(driver.id as string, {
          current_location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading ?? undefined,
            updated_at: new Date()
          }
        })

        console.log('✅ Ponto de corrida E localização do motorista salvos')
      } else if (mode === 'AVAILABILITY') {
        // --------------------------------------------------------
        // AVAILABILITY MODE: Update driver.current_location
        // --------------------------------------------------------
        console.log(
          '📍 Atualizando localização de disponibilidade...',
          location.coords
        )

        await driverUseCase.update(driver.id as string, {
          current_location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading ?? undefined,
            updated_at: new Date()
          }
        })

        console.log('✅ Localização de disponibilidade atualizada')
      } else {
        // OFFLINE or INVISIBLE - should not be running, but just in case
        console.log(`🔕 Modo ${mode} - sem atualização necessária`)
      }
    } catch (err) {
      console.error('❌ BackgroundLocation: Erro ao salvar:', err)
    }
  }
})
