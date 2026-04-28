# Estrutura de Pastas — App Motorista (Kandengue Pro)

## Árvore Completa

```
rn-expo_native-kandengue_pro-ts/
│
├── android/                    # Projecto Android nativo (gerado pelo prebuild)
├── firebase/                   # Ficheiros de configuração Firebase (gitignored)
│   ├── google-services.json    # Android
│   └── GoogleService-Info.plist # iOS
├── assets/                     # Ícones, splash screen, imagens globais
├── plugins/                    # Expo config plugins customizados
├── design-system/              # Tokens de design e temas visuais
│
├── src/
│   ├── App.tsx                  # Componente raiz da aplicação
│   │
│   ├── core/                    # ★ Domain Layer — tipagens e contratos
│   │   ├── entities/           # Driver, Ride, Wallet, ...
│   │   └── interfaces/         # Contratos (IDriverRepository, ...)
│   │
│   ├── domain/                  # Use Cases
│   │   └── usecases/
│   │       ├── ride/           # AcceptRideUseCase, FinishRideUseCase
│   │       ├── driver/         # UpdateDriverStatusUseCase
│   │       └── wallet/         # GetWalletUseCase
│   │
│   ├── modules/                 # Módulos de integração externa
│   │   └── Api/
│   │       ├── firebase/       # Implementação DAO via Firebase SDK
│   │       ├── rest/           # Implementação DAO via Axios (API Fastify)
│   │       └── index.ts        # Factory: selecciona firebase ou rest
│   │
│   ├── services/                # Serviços de hardware — críticos para o motorista
│   │   ├── location/           # ★ GPS tracking (foreground + background)
│   │   │   ├── location.service.ts
│   │   │   └── backgroundTask.ts  # expo-task-manager task definition
│   │   ├── notifications/      # FCM token + handlers de push
│   │   ├── device/             # Info do dispositivo, sensores
│   │   ├── audio/              # Áudio de alertas de corrida
│   │   └── permissions/        # Permissões (location always, notifications)
│   │
│   ├── viewModels/              # ★ ViewModel Layer
│   │   ├── AuthViewModel.ts
│   │   ├── DriverViewModel.ts
│   │   ├── RideTrackingViewModel.ts  # ★ Principal — estado da corrida activa
│   │   ├── RideSummaryViewModel.ts
│   │   └── WalletViewModel.ts
│   │
│   ├── screens/                 # Telas (View Layer — só UI)
│   │   ├── Auth/               # Login, onboarding
│   │   ├── Main/               # Home (mapa), perfil, ganhos
│   │   ├── Rides/              # Corrida activa, ride summary
│   │   └── Map/                # Ecrã de mapa principal com bottom sheet
│   │
│   ├── components/              # Componentes reutilizáveis
│   │   ├── ui/                 # Botões, badges, inputs base
│   │   ├── map/                # DriverMarker, RoutePolyline
│   │   ├── ride/               # RideRequestCard, RideSummaryCard
│   │   │   ├── RideSummaryMap.tsx
│   │   │   ├── PassengerInfo.tsx
│   │   │   ├── FareBreakdown.tsx
│   │   │   └── RouteInfo.tsx
│   │   └── modals/             # Bottom sheets, alertas
│   │
│   ├── context/                 # React Context API
│   │   ├── AlertContext.tsx
│   │   ├── LocationContext.tsx
│   │   └── TrackRideContext.tsx  # ★ Estado do tracking activo
│   │
│   ├── providers/               # Providers globais
│   │   ├── AppProvider.tsx
│   │   ├── NetworkProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── routers/                 # React Navigation
│   │   ├── AuthRouter.tsx
│   │   ├── MainRouter.tsx
│   │   └── RootRouter.tsx
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useRideSummary.ts    # ★ Hook central do ride summary
│   │   ├── useDriverRealtimeLocation.ts
│   │   └── useRouteService.ts   # Rota calculada (throttled 10s)
│   │
│   ├── storage/                 # Persistência local
│   │   ├── store/              # Zustand stores
│   │   └── storageManager.ts
│   │
│   ├── helpers/
│   ├── utils/
│   ├── constants/
│   ├── config/
│   ├── data/
│   ├── types/
│   ├── interfaces/
│   ├── i18n/
│   ├── locales/
│   │   ├── pt/
│   │   └── en/
│   └── styles/
│
├── app.json
├── eas.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Ficheiros Críticos

| Ficheiro                                | Responsabilidade                               |
| --------------------------------------- | ---------------------------------------------- |
| `services/location/location.service.ts` | Controla o tracking GPS (start/stop, modo)     |
| `services/location/backgroundTask.ts`   | Task do expo-task-manager (background)         |
| `viewModels/RideTrackingViewModel.ts`   | Estado central da corrida activa               |
| `hooks/useRideSummary.ts`               | Combina todos os listeners do ride summary     |
| `hooks/useDriverRealtimeLocation.ts`    | Listener Firestore da localização do motorista |
| `context/TrackRideContext.tsx`          | Provider do estado de tracking global          |

---

**Anterior**: [01 — Arquitectura](01-architecture.md) | **Próximo**: [03 — Tech Stack](03-tech-stack.md)
