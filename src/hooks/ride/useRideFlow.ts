// src/screens/hooks/useRideFlow.ts
import { RideStatusType } from '@/types/enum'
import { useRidesViewModel } from '@/viewModels/RideViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { useLocation } from '../useLocation'
import { DriverInterface } from '@/interfaces/IDriver'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { useWalletsViewModel } from '@/viewModels/WalletViewModel'
import { useTransactionsViewModel } from '@/viewModels/TransactionViewModel'
import { useAppProvider } from '@/providers/AppProvider'

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

export function useRideFlow(
  rideId: string,
  rideFare?: RideFareInterface | null
) {
  const { driver, setCurrentMissionId } = useAuthStore()
  const { wallet } = useAppProvider()
  const { updateRide, fetchRideById } = useRidesViewModel()
  const { updateWallet } = useWalletsViewModel()
  const { createTransaction } = useTransactionsViewModel()
  const { startTracking, stopTracking } = useLocation()

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
      await updateRide.mutateAsync({
        id: rideId,
        ride: {
          status,
          driver: driver ?? undefined,
          cancel_reason: reason ?? undefined,
          proof_pickup_photo: proofPickupPhoto ?? undefined,
          proof_dropoff_photo: proofDropoffPhoto ?? undefined,
          waiting_start_at: waitingStartAt ?? undefined,
          waiting_end_at: waitingEndAt ?? undefined,
          completed_at: completedAt ?? undefined,
          canceled_at: canceledAt ?? undefined,
          fare: fare ?? undefined
        }
      })
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar status com servidor:', error)
      throw new Error(error.message || 'Erro ao atualizar status da corrida')
    }
  }

  // Atualizar carteira e criar transações
  const updateWalletAndCreateTransactions = async (fare: RideFareInterface) => {
    if (!driver?.id) {
      throw new Error('Driver não encontrado')
    }

    const { payouts } = fare
    const { driver_earnings, company_earnings, pension_fund } = payouts

    try {
      // 1. Buscar carteira atual do motorista
      if (!wallet) {
        throw new Error('Carteira do motorista não encontrada')
      }

      // 2. Calcular débitos e créditos CORRETAMENTE
      const totalDebits = company_earnings + pension_fund
      const newBalance = wallet.balance - totalDebits

      // 3. Atualizar carteira com o valor líquido
      await updateWallet.mutateAsync({
        id: wallet.id as string,
        wallet: {
          balance: newBalance,
          updated_at: new Date()
        }
      })

      // 4. Criar transação de CRÉDITO (ganhos brutos do motorista)
      if (driver_earnings > 0) {
        await createTransaction.mutateAsync({
          wallet_id: wallet.id as string,
          type: 'credit',
          category: 'ride_fee',
          reference_id: rideId,
          amount: driver_earnings,
          description: `Ganhos da corrida #${rideId}`
        })
      }

      // 5. Criar transação de DÉBITO (taxa da empresa)
      // if (totalDebits > 0) {
      //   await createTransaction.mutateAsync({
      //     wallet_id: wallet.id as string,
      //     type: 'debit',
      //     category: 'ride_fee',
      //     reference_id: rideId,
      //     amount: totalDebits,
      //     description: `Taxa de corrida - Corrida #${rideId}`,
      //   });
      // }

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
      startTracking()

      console.log('✅ Corrida confirmada - Motorista a caminho')
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

      console.log('✅ Chegou ao local de recolha')
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

      console.log('✅ Pacote recolhido com sucesso')
    } catch (error: any) {
      console.error('❌ Erro ao confirmar recolha do pacote:', error)
      throw error
    }
  }

  const arrivedDropoff = async () => {
    try {
      await syncStatusToServer({ status: 'arrived_dropoff' })
      console.log('✅ Chegou ao local de entrega')
    } catch (error: any) {
      console.error('❌ Erro ao confirmar chegada na entrega:', error)
      throw error
    }
  }

  const completed = async (photoUri?: string) => {
    if (!rideFare) {
      const errorMsg = 'Dados de fare não encontrados para completar a corrida'
      console.error('❌', errorMsg)
      throw new Error(errorMsg)
    }

    try {
      // 1. Atualizar carteira e criar transações
      const transactionResult =
        await updateWalletAndCreateTransactions(rideFare)

      // 2. Atualizar status da corrida para completed
      await syncStatusToServer({
        status: 'completed',
        fare: rideFare,
        proofDropoffPhoto: photoUri,
        completedAt: new Date()
      })

      setCurrentMissionId(null)
      stopTracking()

      return transactionResult
    } catch (error: any) {
      console.error('❌ Erro ao completar corrida:', error)

      // Tentar reverter para status anterior em caso de erro
      try {
        await syncStatusToServer({ status: 'arrived_dropoff' })
        console.log('🔄 Status revertido para arrived_dropoff')
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
      stopTracking()

      console.log('❌ Corrida cancelada:', reason)
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
