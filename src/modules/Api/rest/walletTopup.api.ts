// src/modules/Api/rest/walletTopup.api.ts
import { getIdToken } from '@react-native-firebase/auth'
import { auth } from '@/config/firebase.config'
import ApiDAO from './Api.dao'

export interface WalletTopupApiRequest {
  walletId: string
  phoneNumber: string
  amount: number
}

export interface WalletTopupApiResponse {
  request_id: string
  status: 'processing'
  originator_conversation_id: string
  conversation_id: string
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('Utilizador não autenticado')
  }

  const token = await getIdToken(currentUser)

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export async function requestWalletTopup(
  data: WalletTopupApiRequest
): Promise<WalletTopupApiResponse> {
  const headers = await getAuthHeaders()

  return ApiDAO.post<WalletTopupApiResponse>(
    '/api/v1/wallet/topups',
    data,
    headers
  )
}
