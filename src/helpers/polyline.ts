/**
 * Polyline utilities for Uber-style progressive route rendering.
 */

type LatLng = { latitude: number; longitude: number }

function distanceSquared(a: LatLng, b: LatLng): number {
  const dLat = a.latitude - b.latitude
  const dLng = a.longitude - b.longitude
  return dLat * dLat + dLng * dLng
}

function findClosestPointIndex(polyline: LatLng[], position: LatLng): number {
  let closestIndex = 0
  let closestDist = Infinity

  for (let i = 0; i < polyline.length; i++) {
    const dist = distanceSquared(polyline[i], position)
    if (dist < closestDist) {
      closestDist = dist
      closestIndex = i
    }
  }

  return closestIndex
}

/**
 * Trim the polyline from the driver's current position to the end.
 * Creates the Uber-style "shrinking polyline" effect.
 */
export function trimPolylineFromPosition(
  polyline: LatLng[],
  currentPosition: LatLng
): LatLng[] {
  if (polyline.length === 0) return []
  if (polyline.length === 1) return [currentPosition, polyline[0]]

  const closestIndex = findClosestPointIndex(polyline, currentPosition)
  const remaining = polyline.slice(closestIndex)

  return [currentPosition, ...remaining.slice(1)]
}

/**
 * Calculate the total distance of a polyline in kilometers (Haversine).
 */
export function polylineDistanceKm(polyline: LatLng[]): number {
  if (polyline.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < polyline.length; i++) {
    totalDistance += haversineKm(polyline[i - 1], polyline[i])
  }
  return totalDistance
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)

  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}
