// src/hooks/ride/useRideFlow.ts
import { RideStatusType } from '@/types/enum'
import { TrackingMode } from '@/types/trackingTypes'
import { useRidesViewModel } from '@/viewModels/RideViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { DriverInterface } from '@/interfaces/IDriver'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { useWalletsViewModel } from '@/viewModels/WalletViewModel'
import { useTransactionsViewModel } from '@/viewModels/TransactionViewModel'
import { useAppProvider } from '@/providers/AppProvider'
import { RideRateEntity } from '@/core/entities/RideRate'
import { calculateFare } from '@/helpers/rideCalculate'

type SyncStatusToServerParams = {
  status: RideStatusType
  driver?: DriverInterface
  reason?: string
  proofPickupPhoto?: string
  proofDropoffPhoto?: string
  waitingStartAt?: Date
  waitingEndAt?: Date
  completedAt?: Date
  canceledAt?: Date
  fare?: RideFareInterface | null
}

type TrackingControls = {
  startTracking: (mode: TrackingMode) => void | Promise<void>
  stopTracking: () => void | Promise<void>
}

export function useRideFlow(
  rideId: string,
  rideFare?: RideFareInterface | null,
  rideRates?: RideRateEntity | null,
  tracking?: TrackingControls
) {
  const { driver, setCurrentMissionId } = useAuthStore()
  const { wallet } = useAppProvider()
  const { updateRide, fetchRideById } = useRidesViewModel()
  const { updateWallet } = useWalletsViewModel()
  const { createTransaction } = useTransactionsViewModel()

  const syncStatusToServer = async ({
    status,
    reason,
    driver,
    proofPickupPhoto,
    proofDropoffPhoto,
    waitingStartAt,
    waitingEndAt,
    completedAt,
    canceledAt,
    fare
  }: SyncStatusToServerParams) => {
    try {
      // Filter only valid values from driver
      const filteredDriver = Object.fromEntries(
        Object.entries({
          ...driver
        }).filter(([_, v]) => v !== undefined && v !== null)
      )
      // Build payload without undefined fields
      const payload: any = Object.fromEntries(
        Object.entries({
          status,
          cancel_reason: reason,
          proof_pickup_photo: proofPickupPhoto,
          proof_dropoff_photo: proofDropoffPhoto,
          waiting_start_at: waitingStartAt,
          waiting_end_at: waitingEndAt,
          completed_at: completedAt,
          canceled_at: canceledAt,
          fare
        }).filter(([_, v]) => v !== undefined && v !== null)
      )

      // Only add driver if it exists and is not empty
      if (filteredDriver && Object.keys(filteredDriver).length > 0) {
        payload.driver = filteredDriver
      }

      await updateRide.mutateAsync({
        id: rideId,
        ride: payload
      })
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar status com servidor:', error)
      throw new Error(error.message || 'Erro ao atualizar status da corrida')
    }
  }

  // Update wallet and create transactions
  const updateWalletAndCreateTransactions = async (fare: RideFareInterface) => {
    if (!driver?.id) {
      throw new Error('Driver não encontrado')
    }

    const { payouts } = fare
    const { driver_earnings, company_earnings, pension_fund } = payouts

    try {
      if (!wallet) {
        throw new Error('Carteira do motorista não encontrada')
      }

      const totalDebits = company_earnings + pension_fund
      const newBalance = wallet.balance - totalDebits

      await updateWallet.mutateAsync({
        id: wallet.id as string,
        wallet: {
          balance: newBalance,
          updated_at: new Date()
        }
      })

      // Create CREDIT transaction (driver gross earnings)
      if (driver_earnings > 0) {
        await createTransaction.mutateAsync({
          wallet_id: wallet.id as string,
          type: 'credit',
          category: 'ride_fee',
          reference_id: rideId,
          amount: driver_earnings,
          description: `Ganhos da corrida #${rideId}`,
          status: 'success',
          user_id: driver?.id as string
        })
      }

      return {
        newBalance,
        driver_earnings,
        company_earnings,
        pension_fund,
        totalDebits
      }
    } catch (error) {
      console.error('❌ Erro nas transações financeiras:', error)
      throw new Error('Falha ao processar transações financeiras')
    }
  }

  /** ---- ACTIONS ---- */
  const confirm = async () => {
    try {
      if (!driver) {
        throw new Error('Motorista não encontrado')
      }
      if (!rideId) {
        throw new Error('Corrida não encontrada')
      }
      const ride = await fetchRideById(rideId)

      if (!ride) {
        throw new Error('Corrida não encontrada')
      }
      if (ride.status !== 'idle') {
        throw new Error('Corrida não está aguardando motorista')
      }

      await syncStatusToServer({ status: 'driver_on_the_way', driver })
      setCurrentMissionId(rideId)
      tracking?.startTracking('RIDE')
    } catch (error: any) {
      console.error('❌ Erro ao confirmar corrida:', error)
      throw error
    }
  }

  const arrivedPickup = async () => {
    try {
      await syncStatusToServer({
        status: 'arrived_pickup',
        waitingStartAt: new Date()
      })
    } catch (error: any) {
      console.error('❌ Erro ao confirmar chegada na recolha:', error)
      throw error
    }
  }

  const pickedUp = async () => {
    try {
      await syncStatusToServer({
        status: 'picked_up',
        waitingEndAt: new Date()
      })
    } catch (error: any) {
      console.error('❌ Erro ao confirmar recolha do pacote:', error)
      throw error
    }
  }

  const arrivedDropoff = async () => {
    try {
      await syncStatusToServer({ status: 'arrived_dropoff' })
    } catch (error: any) {
      console.error('❌ Erro ao confirmar chegada na entrega:', error)
      throw error
    }
  }

  /**
   * Complete the ride with fare recalculation.
   * Final fare = max(original_fare, fare_based_on_actual_distance)
   * This ensures the driver is compensated for longer routes.
   */
  const completed = async (
    photoUri?: string,
    actualDistanceKm?: number,
    waitMinutes?: number
  ) => {
    if (!rideFare) {
      const errorMsg = 'Dados de fare não encontrados para completar a corrida'
      console.error('❌', errorMsg)
      throw new Error(errorMsg)
    }

    let finalFare = rideFare

    // Recalculate fare if actual distance is greater and we have rates
    if (actualDistanceKm && rideRates && actualDistanceKm > 0) {
      const recalculatedFare = calculateFare(
        actualDistanceKm,
        waitMinutes ?? 0,
        rideRates
      )

      // Use the higher fare: max(original, recalculated)
      if (recalculatedFare.total > rideFare.total) {
        finalFare = recalculatedFare
      }
    }

    try {
      // 1. Update wallet and create transactions with final fare
      const transactionResult =
        await updateWalletAndCreateTransactions(finalFare)

      // 2. Update ride status to completed
      await syncStatusToServer({
        status: 'completed',
        fare: finalFare,
        proofDropoffPhoto: photoUri,
        completedAt: new Date()
      })

      setCurrentMissionId(null)
      tracking?.stopTracking()

      return transactionResult
    } catch (error: any) {
      console.error('❌ Erro ao completar corrida:', error)

      // Attempt rollback on failure
      try {
        await syncStatusToServer({ status: 'arrived_dropoff' })
        console.error('🔄 Tentando reverter status para arrived_dropoff')
      } catch (revertError) {
        console.error('❌ Erro ao reverter status:', revertError)
      }
      throw error
    }
  }

  const canceled = async (reason: string) => {
    try {
      await syncStatusToServer({
        status: 'canceled',
        reason,
        canceledAt: new Date()
      })

      setCurrentMissionId(null)
      tracking?.stopTracking()
    } catch (error: any) {
      console.error('❌ Erro ao cancelar corrida:', error)
      throw error
    }
  }

  return {
    confirm,
    arrivedPickup,
    pickedUp,
    arrivedDropoff,
    completed,
    canceled
  }
}
