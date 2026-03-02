// src/services/google/googleApi.ts
import { GOOGLE_API_KEY } from '@/constants/keys'
import { getDistanceInMeters } from '@/helpers/haversine'

// Cache in-memory to prevent spamming the Geocoding API
let lastGeocodedLocation: { lat: number; lng: number; address: string } | null =
  null
const CACHE_RADIUS_METERS = 200 // Only call API if moved more than 200m

export const getAddressFromCoords = async (lat: number, lng: number) => {
  try {
    // Check cache
    if (lastGeocodedLocation) {
      const distance = getDistanceInMeters(
        lastGeocodedLocation.lat,
        lastGeocodedLocation.lng,
        lat,
        lng
      )

      if (distance < CACHE_RADIUS_METERS) {
        console.log(
          `[Geocoding API] Usando cache (${distance.toFixed(0)}m movidos). Endereço: ${lastGeocodedLocation.address}`
        )
        return lastGeocodedLocation.address
      }
    }

    console.log(`[Geocoding API] Fazendo request ($) para Google Maps...`)
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=pt`
    )
    const data = await response.json()

    if (data.status === 'OK') {
      const formattedAddress =
        data.results[0]?.formatted_address || 'Endereço não encontrado'

      // Update cache
      lastGeocodedLocation = { lat, lng, address: formattedAddress }

      return formattedAddress
    } else {
      console.log('Erro na API Geocoding:', data.status)
      return 'Endereço não disponível'
    }
  } catch (err) {
    console.log('Erro ao buscar endereço:', err)
    return 'Erro ao obter endereço'
  }
}
