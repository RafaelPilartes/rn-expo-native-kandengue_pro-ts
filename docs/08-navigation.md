# Navegação — App Motorista (Kandengue Pro)

## Stack de Navegação

```
RootRouter
  ├── AuthRouter (não autenticado / não aprovado)
  │   ├── LoginScreen
  │   ├── RegisterScreen
  │   └── PendingApprovalScreen    ← motorista aguarda aprovação
  │
  └── MainRouter (autenticado + aprovado)
      ├── MapScreen (mapa principal + bottom sheet)
      ├── RidesHistoryScreen
      ├── WalletScreen
      ├── ProfileScreen
      └── RideSummaryScreen        ← stack separado para flow de corrida
```

## Bottom Sheet como Navegação de Corrida

O Kandengue Pro usa o **Gorhom Bottom Sheet** como principal interface de gestão de corrida, em vez de navegação por stack. Isso mantém o mapa sempre visível:

```
MapScreen (mapa permanente)
  │
  └── BottomSheet (estado dinâmico)
        ├── IDLE: "À espera de corridas..."
        ├── NEW_RIDE: RideRequestCard (aceitar/recusar)
        ├── PICKUP: Instruções para ir buscar o passageiro
        ├── IN_PROGRESS: Estado da corrida activa
        └── SUMMARY: Ride Summary após terminar
```

## Tipos de Navegadores

| Navegador    | Uso                                         |
| ------------ | ------------------------------------------- |
| Native Stack | AuthRouter, RideSummary completo            |
| Bottom Sheet | Gestão de corrida (sobreposição no mapa)    |
| Bottom Tabs  | MainRouter (Map, Histórico, Wallet, Perfil) |

## Controlo de Acesso

```typescript
// routers/RootRouter.tsx
function RootRouter() {
  const { isAuthenticated } = useAuthStore();
  const { driver } = useDriverProfile();

  if (!isAuthenticated) return <AuthRouter />;
  if (driver?.status === 'pending') return <PendingApprovalScreen />;
  if (driver?.status === 'suspended') return <SuspendedScreen />;
  return <MainRouter />;
}
```

## Notificações → Navegação

Quando o motorista recebe uma notificação de nova corrida, o app navega e expande o bottom sheet:

```typescript
// No FCM handler:
messaging().onMessage(async remoteMessage => {
  if (remoteMessage.data?.type === 'new_ride') {
    rideTrackingStore.setNewRideRequest(remoteMessage.data)
    bottomSheetRef.current?.expand() // abre o bottom sheet
  }
})
```

---

**Anterior**: [07 — Gestão de Estado](07-state-management.md) | **Próximo**: [09 — Build e Deploy](09-build-deploy.md)
