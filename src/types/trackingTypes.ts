// src/types/trackingTypes.ts
import * as Location from 'expo-location'

/**
 * Tracking modes for driver location monitoring
 *
 * - OFFLINE: Driver is offline, no tracking
 * - INVISIBLE: Driver is online but not visible/tracked (privacy mode)
 * - AVAILABILITY: Driver is online and visible, tracked every 30s
 * - RIDE: Driver is on an active ride, tracked every 5s with high precision
 */
export type TrackingMode = 'OFFLINE' | 'INVISIBLE' | 'AVAILABILITY' | 'RIDE'

/**
 * Configuration for each tracking mode
 */
export interface TrackingConfig {
  mode: TrackingMode
  accuracy: Location.Accuracy
  timeInterval: number // milliseconds
  distanceInterval: number // meters
  updateTarget: 'driver' | 'ride_tracking'
  fieldName: string
}

/**
 * Predefined tracking configurations for each mode
 */
export const TRACKING_CONFIGS: Record<TrackingMode, Partial<TrackingConfig>> = {
  OFFLINE: {
    mode: 'OFFLINE'
    // No tracking configuration needed
  },
  INVISIBLE: {
    mode: 'INVISIBLE'
    // No tracking - driver is online but location not updated
  },
  AVAILABILITY: {
    mode: 'AVAILABILITY',
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 30000, // 30 seconds
    distanceInterval: 20, // 20 meters
    updateTarget: 'driver',
    fieldName: 'current_location'
  },
  RIDE: {
    mode: 'RIDE',
    accuracy: Location.Accuracy.High,
    timeInterval: 5000, // 5 seconds
    distanceInterval: 5, // 5 meters
    updateTarget: 'ride_tracking',
    fieldName: 'path'
  }
}

/**
 * Determine the appropriate tracking mode based on driver state
 *
 * Priority:
 * 1. If offline -> OFFLINE
 * 2. If on active ride -> RIDE (overrides invisible)
 * 3. If invisible flag set -> INVISIBLE
 * 4. If online -> AVAILABILITY
 */
export function determineTrackingMode(
  is_online: boolean,
  is_invisible: boolean,
  currentMissionId: string | null
): TrackingMode {
  if (!is_online) return 'OFFLINE'
  if (currentMissionId) return 'RIDE' // Ride takes priority over invisible
  if (is_invisible) return 'INVISIBLE'
  return 'AVAILABILITY'
}
