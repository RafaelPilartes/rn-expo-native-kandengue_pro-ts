import { useEffect, useState, useRef, useCallback } from 'react'
import axios from 'axios'
import polyline from '@mapbox/polyline'
import { GOOGLE_API_KEY } from '@/constants/keys'

type LatLng = { latitude: number; longitude: number }

type UseRideRouteOptions = {
  /** Set to false to disable API calls (useful for caching static routes) */
  enabled?: boolean
}

const ROUTE_THROTTLE_MS = 10_000 // 10 seconds between API calls

export function useRideRoute(
  origin?: LatLng | null,
  destination?: LatLng | null,
  options?: UseRideRouteOptions
) {
  const { enabled = true } = options ?? {}

  const [routeCoords, setRouteCoords] = useState<LatLng[]>([])
  const [distanceText, setDistanceText] = useState('')
  const [durationText, setDurationText] = useState('')
  const [distanceKm, setDistanceKm] = useState(0)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [loading, setLoading] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastFetchRef = useRef(0)
  // Stores latest coords when a timer is already pending (avoids resetting the timer)
  const pendingCoordsRef = useRef<{ oLat: number; oLng: number; dLat: number; dLng: number } | null>(null)

  const clearState = useCallback(() => {
    setRouteCoords([])
    setDistanceText('')
    setDurationText('')
    setDistanceKm(0)
    setDurationMinutes(0)
  }, [])

  useEffect(() => {
    const oLat = origin?.latitude
    const oLng = origin?.longitude
    const dLat = destination?.latitude
    const dLng = destination?.longitude

    if (!oLat || !oLng || !dLat || !dLng) {
      clearState()
      return
    }

    // If disabled, skip entirely (used for static routes already cached)
    if (!enabled) return

    // If a timer is already pending, just update pending coords — don't reset the timer.
    // This is the key fix: GPS ticks every 5s won't reset the 10s throttle window.
    if (timerRef.current) {
      pendingCoordsRef.current = { oLat, oLng, dLat, dLng }
      return
    }

    // Cancel any in-flight request (new coords supersede old request)
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const fetchRoute = async (lat: number, lng: number, dstLat: number, dstLng: number) => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        setLoading(true)
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lng}&destination=${dstLat},${dstLng}&key=${GOOGLE_API_KEY}&mode=driving&language=pt-BR&region=BR`
        const res = await axios.get(url.replace(/\s+/g, ''), {
          signal: controller.signal
        })

        if (controller.signal.aborted) return

        const route = res.data.routes?.[0]
        if (!route) return

        const leg = route.legs[0]
        const decoded = polyline.decode(route.overview_polyline.points)
        const coords = decoded.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng
        }))

        setRouteCoords(coords)
        setDistanceKm(leg.distance.value / 1000)
        setDurationMinutes(Math.round(leg.duration.value / 60))
        setDistanceText(leg.distance.text)
        setDurationText(leg.duration.text)
        lastFetchRef.current = Date.now()
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.warn('useRideRoute error:', err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }

        // After fetch completes, check if there are pending coords that arrived while we were fetching
        if (pendingCoordsRef.current) {
          const pending = pendingCoordsRef.current
          pendingCoordsRef.current = null
          scheduleNextFetch(pending.oLat, pending.oLng, pending.dLat, pending.dLng)
        }
      }
    }

    const scheduleNextFetch = (lat: number, lng: number, dstLat: number, dstLng: number) => {
      const timeSinceLastFetch = Date.now() - lastFetchRef.current
      const delay = timeSinceLastFetch < ROUTE_THROTTLE_MS
        ? ROUTE_THROTTLE_MS - timeSinceLastFetch
        : 0

      if (delay === 0) {
        fetchRoute(lat, lng, dstLat, dstLng)
      } else {
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          // Use the latest pending coords if available, otherwise use the scheduled ones
          const coords = pendingCoordsRef.current ?? { oLat: lat, oLng: lng, dLat: dstLat, dLng: dstLng }
          pendingCoordsRef.current = null
          fetchRoute(coords.oLat, coords.oLng, coords.dLat, coords.dLng)
        }, delay)
      }
    }

    scheduleNextFetch(oLat, oLng, dLat, dLng)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
      pendingCoordsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude, enabled])

  return {
    routeCoords,
    distanceKm,
    durationMinutes,
    distance: distanceText,
    duration: durationText,
    loading
  }
}
