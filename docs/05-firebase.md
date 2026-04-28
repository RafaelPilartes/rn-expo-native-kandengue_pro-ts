# Firebase — App Motorista (Kandengue Pro)

## Serviços Utilizados

| Serviço                      | Uso no App                                     |
| ---------------------------- | ---------------------------------------------- |
| **Firebase Auth**            | Login/logout, sessão do motorista              |
| **Firestore**                | Reads/writes de corridas, GPS tracking, wallet |
| **Firebase Storage**         | Upload de documentos e foto de perfil          |
| **Firebase Cloud Messaging** | Notificações push de novas corridas            |

---

## Configuração

Idêntica ao app do passageiro — ver [04 — Setup Local](04-setup-local.md) para detalhes.

> Bundle ID específico do motorista: **`com.kandengueatrevido.pro`**

---

## Coleções Firestore — Lidas e Escritas pelo Motorista

### `drivers/{uid}` → `DriverInterface`

```typescript
// src/interfaces/IDriver.ts
interface DriverInterface extends UserInterface {
  // campos herdados de UserInterface:
  id?: string
  entity_code?: string
  photo?: string
  name: string
  email: string
  phone: string
  status: UserStatus // 'active' | 'inactive' | 'pending' | 'banned'
  availability: UserAvailability // 'available' | 'on_mission'
  firebase_uid?: string
  created_at?: Date
  updated_at?: Date
  last_login?: Date
  email_verified?: boolean
  phone_verified?: boolean
  last_location_update?: Date

  // campos exclusivos do motorista:
  is_online: boolean
  is_invisible: boolean
  vehicle?: VehicleInterface
  rating?: number
  current_location?: LocationType // { latitude, longitude, heading?, speed?, accuracy? }
}

// src/interfaces/IVehicle.ts
interface VehicleInterface {
  id: string
  user_id: string
  type: VehicleType // 'car' | 'motorcycle' | 'bicycle' | 'truck' | 'scooter'
  brand: string
  model: string
  color: string
  plate: string
  status: VehicleStatusEnumType // 'under_analysis' | 'validated' | 'rejected'
  isDefault?: boolean
  image?: string
  created_at?: Date
  updated_at?: Date
}
```

### `rides/{rideId}` → `RideInterface`

O motorista **lê** corridas disponíveis e **actualiza** o status:

```typescript
// src/interfaces/IRide.ts
interface RideInterface {
  id?: string
  user: UserInterface // dados do passageiro
  driver?: DriverInterface // preenchido pelo motorista ao aceitar
  pickup: GeoLocationType // { description, place_id, name?, latitude, longitude }
  dropoff: GeoLocationType
  status: RideStatusType // ver abaixo
  fare: RideFareInterface
  distance: number
  duration: number
  type: RideType // 'car' | 'motorcycle' | 'bicycle' | 'delivery'
  otp_code?: string
  cancel_reason?: string
  details?: RideDetailsType
  proof_pickup_photo?: string
  proof_dropoff_photo?: string
  waiting_start_at?: Date
  waiting_end_at?: Date
  completed_at?: Date
  canceled_at?: Date
  created_at?: Date
  updated_at?: Date
}

// Estados completos (RideStatusType)
type RideStatusType =
  | 'idle' // aguardando motorista aceitar
  | 'pending' // aceitando / aguardando
  | 'driver_on_the_way' // motorista a caminho do pickup
  | 'arrived_pickup' // motorista chegou ao pickup
  | 'picked_up' // recolheu / iniciou corrida
  | 'arrived_dropoff' // chegou ao destino
  | 'completed' // concluído
  | 'canceled' // cancelado
```

### `rideTracking/{rideId}` → `RideTrackingsInterface` ★

Esta é a coleção mais **escrita** pelo motorista durante uma corrida activa:

```typescript
// src/interfaces/IRideTracking.ts
interface RideTrackingsInterface {
  id: string
  ride_id: string
  path: LiveLocationType[] // historial crescente de todas as localizações
  created_at?: Date
}

// src/types/ride.ts
type LiveLocationType = {
  latitude: number
  longitude: number
  timestamp: Date
}
```

> ⚠️ O campo `path` é actualizado via `arrayUnion` — cada update de GPS adiciona
> um novo `LiveLocationType` ao array sem sobrescrever os anteriores.

### `wallets/{uid}` → `WalletInterface`

```typescript
// src/interfaces/IWallet.ts (via WalletEntity)
interface WalletInterface {
  id?: string
  user: DriverInterface // o motorista dono da wallet
  balance: number
  status: StatusEnumType // 'active' | 'inactive' | 'pending'
  currency: currencyEnumType // 'AOA' | 'USD'
  created_at?: Date
  updated_at?: Date
}
```

> A wallet é lida/actualizada via **API Fastify** (não directamente pelo app).
> O app faz `GET /me/wallet` para obter o saldo actual.

### `rides/{rideId}.fare` → `RideFareInterface`

```typescript
// src/interfaces/IRideFare.ts
interface RideFareInterface {
  total: number
  breakdown: {
    base_fare: number
    distance_cost: number
    wait_cost: number
    insurance_fee: number
    discount?: number
  }
  payouts: {
    driver_earnings: number // ← valor que vai para a wallet do motorista
    company_earnings: number
    pension_fund: number
  }
}
```

---

## FCM — Notificações Push

### Registo do Token

```typescript
// Após login bem-sucedido
const token = await messaging().getToken()
await firestore().collection('fcm_tokens').doc(uid).set({
  token,
  platform: Platform.OS, // 'android' | 'ios'
  updated_at: firestore.FieldValue.serverTimestamp()
})
```

### Tipos de Notificações Recebidas

| Tipo                              | Trigger               | Payload                                   |
| --------------------------------- | --------------------- | ----------------------------------------- |
| Nova corrida disponível           | Cloud Function / API  | `{ rideId, pickup, dropoff, fare.total }` |
| Corrida cancelada pelo passageiro | Cloud Function        | `{ rideId }`                              |
| Pagamento confirmado              | API Fastify (webhook) | `{ amount, txId }`                        |

### Background Handler

```typescript
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (remoteMessage.data?.type === 'new_ride') {
    // Notificação local com acções de aceitar/recusar
  }
})
```

---

**Anterior**: [04 — Setup Local](04-setup-local.md) | **Próximo**: [06 — Mapas e Localização](06-maps-location.md)
