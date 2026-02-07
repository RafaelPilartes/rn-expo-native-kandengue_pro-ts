// src/hooks/useWalletState.ts
import { useState, useEffect } from 'react'
import { WalletInterface } from '@/interfaces/IWallet'
import { useWalletsViewModel } from '@/viewModels/WalletViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'

interface WalletStateReturn {
  wallet: WalletInterface | null
}

export const useWalletState = (): WalletStateReturn => {
  const { driver } = useAuthStore()
  const { listenByField: listenWalletByField } = useWalletsViewModel()

  const [wallet, setWallet] = useState<WalletInterface | null>(null)

  // Listener para carteira do motorista
  useEffect(() => {
    if (!driver?.id) return

    console.log('🔹 [useWalletState] Iniciando listener de carteira')
    const unsubscribeWallet = listenWalletByField(
      'user.id' as any,
      driver.id,
      setWallet
    )

    return unsubscribeWallet
  }, [driver?.id])

  return {
    wallet
  }
}
