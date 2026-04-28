# Mapas e Localização — App Motorista (Kandengue Pro)

## Visão Geral

O GPS e o mapa são os componentes **mais críticos** do Kandengue Pro. O motorista precisa de:

1. **Enviar** a sua posição em tempo real ao Firestore (lida pelo passageiro)
2. **Ver** o mapa com a rota até ao passageiro (pickup) e ao destino

---

## Tracking GPS — Arquitectura

```
expo-location (foreground) + expo-task-manager (background task)
  │
  │  Intervalo: 5000ms ou 10m (o que ocorrer primeiro)
  │  Accuracy: BestForNavigation
  ▼
LocationService.onLocationUpdate(coords)
  │
  ├── Escreve: rideTracking/{rideId}.location = { lat, lng }
  ├── Escreve: rideTracking/{rideId}.heading = coords.heading
  ├── Appenda: rideTracking/{rideId}.path = arrayUnion({ lat, lng })
  └── Escreve: drivers/{uid}.location = { lat, lng }
```

### Definição da Background Task

```typescript
// services/location/backgroundTask.ts
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'

export const LOCATION_TASK_NAME = 'kandengue-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error)
    return
  }

  const { locations } = data as { locations: Location.LocationObject[] }
  const { coords } = locations[0]

  // Esta função executa mesmo com o app em background
  LocationService.updateRideTracking({
    lat: coords.latitude,
    lng: coords.longitude,
    heading: coords.heading ?? 0,
    speed: (coords.speed ?? 0) * 3.6 // m/s → km/h
  })
})
```

### Iniciar / Parar Tracking

```typescript
// Iniciar (quando corrida é aceite)
await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 5000,
  distanceInterval: 10,
  foregroundService: {
    notificationTitle: 'Kandengue Pro',
    notificationBody: 'Tracking de corrida activo',
    notificationColor: '#e0212d'
  },
  pausesUpdatesAutomatically: false
})

// Parar (quando corrida termina)
await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
```

---

## Rota Calculada — RouteService (Throttled)

Para mostrar a polyline da rota calculada (não apenas a linha directa), o app usa a Google Directions API com throttling de 10 segundos:

```typescript
// hooks/useRouteService.ts
const { route } = useRouteService({
  origin: driverLocation,
  destination: rideDestination,
  throttleMs: 10_000 // máximo 1 pedido a cada 10s
})

// Retorna: Array<{ lat, lng }> — rota real nas estradas
```

---

## Polyline Trimming no Mapa do Motorista

À medida que o motorista avança, a polyline mostra apenas o **troço restante**:

```typescript
function trimPolyline(route: LatLng[], currentPos: LatLng): LatLng[] {
  const closestIdx = findClosestPoint(route, currentPos)
  return route.slice(closestIdx)
}
```

---

## Markers no Mapa

| Marker               | Cor / Ícone                  | Quando                              |
| -------------------- | ---------------------------- | ----------------------------------- |
| Posição do motorista | Ponto azul (própria posição) | Sempre                              |
| Passageiro (pickup)  | Verde                        | Fase de pickup (before in_progress) |
| Destino              | Vermelho                     | Durante in_progress                 |
| Rota calculada       | Polyline vermelha            | Sempre com corrida activa           |

---

## Permissões Necessárias

| Permissão                          | Android | iOS | Obrigatoriedade                 |
| ---------------------------------- | ------- | --- | ------------------------------- |
| `ACCESS_FINE_LOCATION`             | ✅      | —   | Obrigatória                     |
| `ACCESS_BACKGROUND_LOCATION`       | ✅      | —   | Obrigatória para background     |
| `FOREGROUND_SERVICE_LOCATION`      | ✅      | —   | Android 14+                     |
| `NSLocationAlwaysUsageDescription` | —       | ✅  | Obrigatória para background iOS |

> ⚠️ Sem `ACCESS_BACKGROUND_LOCATION` (Android) ou `Always` (iOS), o tracking para quando o app vai para background — **quebra o produto**.

---

**Anterior**: [05 — Firebase](05-firebase.md) | **Próximo**: [07 — Gestão de Estado](07-state-management.md)
