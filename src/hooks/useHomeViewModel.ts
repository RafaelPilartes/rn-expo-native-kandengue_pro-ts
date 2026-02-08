import { useEffect, useState, useMemo } from 'react'
import { useAppProvider } from '@/providers/AppProvider'
import { useLocation } from '@/hooks/useLocation'
import { useTrackRide } from '@/hooks/useTrackRide'
import { MIN_AMOUNT } from '@/constants/config'

export type HomeViewState =
  | 'LOADING'
  | 'RIDE_ACTIVE'
  | 'PERMISSION_DENIED'
  | 'OFFLINE'
  | 'ACCOUNT_ISSUE'
  | 'READY'

export type AccountIssueType =
  | 'INACTIVE'
  | 'PENDING'
  | 'NO_WALLET'
  | 'NO_VEHICLE'
  | 'LOW_BALANCE'
  | null

export const useHomeViewModel = () => {
  const {
    currentDriverData,
    rides,
    ridesCount,
    wallet,
    vehicle,
    handleIsOnline,
    handleToggleInvisible,
    handleToDocuments,
    handleToWallet,
    handleDetailsRide,
    handleNotifications,
    navigationMainStack
  } = useAppProvider()

  const {
    isLoading: locationLoading,
    location: currentLocation,
    requestCurrentLocation,
    error: locationError,
    address,
    isGettingAddress,
    fetchAddress,
    missingPermission,
    triggerPermissionFlow,
    isCheckingPermissions
  } = useLocation()

  const {
    currentRide,
    resolveCurrentRide,
    isLoading: isRideLoading
  } = useTrackRide()

  // Initial Setup
  useEffect(() => {
    resolveCurrentRide()
  }, [])

  // Location request when going online
  useEffect(() => {
    if (
      currentDriverData?.is_online &&
      currentDriverData?.status === 'active'
    ) {
      requestCurrentLocation()
    }
  }, [currentDriverData?.is_online, currentDriverData?.status])

  // Determine View State
  const viewState: HomeViewState = useMemo(() => {
    // 1. Wait for Critical Checks
    if (isCheckingPermissions || isRideLoading || !currentDriverData) {
      return 'LOADING'
    }

    if (currentRide) return 'RIDE_ACTIVE'
    if (missingPermission) return 'PERMISSION_DENIED'

    // Check Account Issues
    if (currentDriverData.status !== 'active') return 'ACCOUNT_ISSUE'
    if (!vehicle) return 'ACCOUNT_ISSUE'
    if (!wallet) return 'ACCOUNT_ISSUE'
    if (wallet.balance < MIN_AMOUNT) return 'ACCOUNT_ISSUE'

    if (!currentDriverData.is_online) return 'OFFLINE'

    return 'READY'
  }, [
    currentDriverData,
    currentRide,
    missingPermission,
    vehicle,
    wallet,
    isCheckingPermissions,
    isRideLoading
  ])

  // Determine specific account issue
  const accountIssue: AccountIssueType = useMemo(() => {
    if (currentDriverData?.status === 'inactive') return 'INACTIVE'
    if (currentDriverData?.status === 'pending') return 'PENDING'
    if (!vehicle) return 'NO_VEHICLE'
    if (!wallet) return 'NO_WALLET'
    if (wallet && wallet.balance < MIN_AMOUNT) return 'LOW_BALANCE'
    return null
  }, [currentDriverData, vehicle, wallet])

  return {
    // Data
    currentDriverData,
    wallet,
    vehicle,
    rides,
    ridesCount,
    currentRide,

    // Location Data
    currentLocation,
    address,
    isGettingAddress,
    locationLoading,
    locationError,

    // State
    viewState,
    accountIssue,

    // Actions
    actions: {
      handleIsOnline,
      handleToggleInvisible,
      handleNotifications,
      handleToDocuments,
      handleToWallet,
      handleDetailsRide,
      fetchAddress,
      requestCurrentLocation,
      triggerPermissionFlow,
      resolveCurrentRide
    },
    navigationMainStack // Export navigation directly to avoid nested actions issue
  }
}
