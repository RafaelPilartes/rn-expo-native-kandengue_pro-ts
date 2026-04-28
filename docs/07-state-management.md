# Gestão de Estado — App Motorista (Kandengue Pro)

## Camadas de Estado

```
┌──────────────────────────────────────────┐
│  Zustand (estado global persistido)      │
│  Auth, driver profile, corrida activa    │
├──────────────────────────────────────────┤
│  React Query (server state)              │
│  Histórico de corridas, wallet, perfil   │
├──────────────────────────────────────────┤
│  Context API (estado de UI crítico)      │
│  Alertas, localização activa, tracking   │
├──────────────────────────────────────────┤
│  Gorhom Bottom Sheet (estado de UI)      │
│  Bottom sheet expand/collapse            │
└──────────────────────────────────────────┘
```

---

## Zustand — Stores

### AuthStore

```typescript
interface AuthStore {
  driver: Driver | null
  isAuthenticated: boolean
  setDriver: (driver: Driver | null) => void
  logout: () => void
}
```

### RideTrackingStore (★ Principal)

```typescript
// Estado central da corrida activa
interface RideTrackingStore {
  activeRide: Ride | null
  rideStatus: RideStatus
  isTracking: boolean // GPS background activo?
  passengerLocation: LatLng | null
  destinationLocation: LatLng | null

  setActiveRide: (ride: Ride | null) => void
  setTracking: (active: boolean) => void
  setRideStatus: (status: RideStatus) => void
}
```

### WalletStore

```typescript
interface WalletStore {
  balance: number
  currency: string
  setWallet: (wallet: Wallet) => void
}
```

---

## React Query — Convenções

```typescript
// Queries mais usadas no Kandengue Pro
queryKey: ['rides', 'history', driverId]   // histórico de corridas
queryKey: ['wallet', driverId]             // saldo da wallet
queryKey: ['driver', 'profile', uid]       // perfil do motorista

// Configuração recomendada para dados financeiros:
{
  staleTime: 0,              // sempre frescos
  refetchOnWindowFocus: true,
}
```

---

## Context API — TrackRideContext (★)

O contexto mais crítico — gere o estado completo de uma corrida activa:

```typescript
// context/TrackRideContext.tsx
interface TrackRideContextType {
  rideId: string | null
  phase: 'idle' | 'accepted' | 'pickup' | 'in_progress' | 'summary'

  startTracking: (rideId: string) => Promise<void>
  stopTracking: () => Promise<void>
  updatePhase: (phase: TrackRidePhase) => void
}
```

### Transições de Fase

```
idle
  └── Nova corrida aceite → accepted
        └── Motorista chegou ao passageiro → pickup
              └── Corrida iniciada → in_progress
                    └── Corrida terminada → summary
                          └── Novo ciclo → idle
```

---

## Hook Central: `useRideSummary`

Este hook agrega múltiplos listeners e serviços para o ecrã de Ride Summary:

```typescript
// hooks/useRideSummary.ts
export function useRideSummary(rideId: string) {
  // 1. Dados da corrida (Firestore listener)
  const { ride } = useRideListener(rideId)

  // 2. Localização do motorista (própria posição via GPS)
  const { location, heading } = useCurrentLocation()

  // 3. Rota calculada até destino (throttled 10s)
  const { route } = useRouteService({
    origin: location,
    destination: ride?.destination,
    throttleMs: 10_000
  })

  // 4. Polyline trimming
  const trimmedRoute = useMemo(
    () => trimPolyline(route, location),
    [route, location]
  )

  return { ride, location, heading, trimmedRoute }
}
```

---

## Providers — Ordem de Inicialização

```tsx
<AppProvider>
  {' '}
  {/* Network + Alert */}
  <ThemeProvider>
    <TrackRideProvider>
      {' '}
      {/* Estado de corrida activa */}
      <LocationProvider>
        {' '}
        {/* GPS activo */}
        <NavigationContainer>
          <RootRouter />
        </NavigationContainer>
      </LocationProvider>
    </TrackRideProvider>
  </ThemeProvider>
</AppProvider>
```

---

**Anterior**: [06 — Mapas e Localização](06-maps-location.md) | **Próximo**: [08 — Navegação](08-navigation.md)
