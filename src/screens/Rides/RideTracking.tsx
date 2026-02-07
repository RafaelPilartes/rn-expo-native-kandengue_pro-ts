import React, { useState, useEffect } from 'react'
import { Text, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, { Marker } from '@/components/map/MapView'

export default function RideTrackingScreen() {
  const [status, setStatus] = useState('Procurando motoboy...')

  useEffect(() => {
    const timer1 = setTimeout(() => setStatus('Motoboy a caminho 🚴‍♂️'), 3000)
    const timer2 = setTimeout(() => setStatus('Entrega em andamento 📦'), 7000)
    const timer3 = setTimeout(() => setStatus('Entrega concluída ✅'), 12000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const markers: Marker[] = [
    {
      coordinates: { latitude: -8.839987, longitude: 13.289437 },
      title: 'Motoboy',
      ...(Platform.OS === 'ios' ? { subtitle: status } : { snippet: status })
    }
  ]

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text className="text-lg font-bold text-center mt-4">{status}</Text>
      <MapView
        style={{ flex: 1, marginTop: 10 }}
        cameraPosition={{
          coordinates: {
            latitude: -8.839987,
            longitude: 13.289437
          },
          zoom: 13
        }}
        markers={markers}
      />
    </SafeAreaView>
  )
}
