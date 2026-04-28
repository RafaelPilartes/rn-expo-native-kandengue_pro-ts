# Arquitectura — App Motorista (Kandengue Pro)

## Padrão Arquitectural

O Kandengue Pro segue **Clean Architecture + MVVM** com os **Princípios SOLID**, idêntico ao app do passageiro mas com foco adicional em **performance de GPS em background** e **gestão de estado de corrida reactiva**.

```
┌────────────────────────────────────────┐
│           View Layer                   │
│   Screens/ + Components/               │
│   (apenas apresentação visual)         │
├────────────────────────────────────────┤
│         ViewModel Layer                │
│   viewModels/ (Zustand + React Query)  │
│   RideTrackingViewModel, DriverViewModel│
├────────────────────────────────────────┤
│          Domain Layer                  │
│   domain/usecases/                     │
│   (corridas, tracking, wallet)         │
├────────────────────────────────────────┤
│     Repository / Module Layer          │
│   modules/Api/ (firebase/ + rest/)     │
├────────────────────────────────────────┤
│           Core Layer                   │
│   core/entities/ + core/interfaces/   │
└────────────────────────────────────────┘
```

## Fluxo de Dados

```
Screen (ex: RideSummaryScreen)
  │
  ▼
ViewModel (useRideSummaryViewModel)
  │  combina múltiplos hooks
  ▼
useRideSummary (hook central)
  ├── Firestore listener: rides/{rideId}
  ├── useDriverRealtimeLocation → rideTracking/{rideId}
  └── RouteService (throttled 10s) → API Fastify → rota calculada
  │
  ▼
State → Zustand store
  │
  ▼
Map + RideSummaryCard + SubComponents re-renderizam
```

## GPS Tracking — Arquitectura de Background

O tracking GPS é o componente mais crítico do Kandengue Pro:

```
expo-location (foreground) + expo-task-manager (background)
  │
  │  5s interval durante corrida activa
  ▼
LocationService.updateLocation(coords)
  │
  ├── Firestore write: rideTracking/{rideId}.location
  ├── Firestore write: rideTracking/{rideId}.path  (array append)
  └── Firestore write: drivers/{uid}.location
```

**Foreground service** (Android): garante que o processo não é terminado pelo sistema operativo.
**Background location** (iOS): requer permissão `NSLocationAlwaysUsageDescription`.

## Ride Summary — Componentes Modulares

O ecrã de resumo de corrida foi refactorizado para componentes independentes:

```
RideSummaryScreen
  ├── RideSummaryMap (mapa com polyline e marcadores)
  │   ├── DriverMarker (posição em tempo real)
  │   ├── PickupMarker
  │   └── DestinationMarker
  │
  ├── RideSummaryCard (informação da corrida)
  │   ├── PassengerInfo
  │   ├── RouteInfo
  │   └── FareBreakdown
  │
  └── RideActionButtons (aceitar/recusar/terminar)
```

## Gestão de Estado

| Ferramenta              | Responsabilidade                                    |
| ----------------------- | --------------------------------------------------- |
| **Zustand**             | Estado global (driver auth, wallet, corrida activa) |
| **React Query**         | Histórico de corridas, dados do perfil              |
| **Context API**         | Localização em tempo real, alertas, tema            |
| **Gorhom Bottom Sheet** | Estado dos modais de corrida                        |

## Bottom Sheet Flow (UX de Corrida)

```
Estado IDLE
  └── BottomSheet minimizado (apenas status)

Nova corrida disponível
  └── BottomSheet expande → RideRequestCard
        ├── Aceitar → estado 'accepted' → tracking inicia
        └── Recusar → volta a IDLE

Corrida activa
  └── BottomSheet mostra progresso
        └── Chegada ao destino → Terminar → RideSummary
```

---

**Anterior**: [00 — Visão Geral](00-overview.md) | **Próximo**: [02 — Estrutura de Pastas](02-project-structure.md)
