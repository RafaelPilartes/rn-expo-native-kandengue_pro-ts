# Visão Geral — App Motorista (Kandengue Pro)

## O que é

**Kandengue Pro** é a aplicação mobile dedicada aos **motoristas parceiros** do ecossistema Kandengue. Construída com foco em alta performance e reactividade, permite ao motorista gerir corridas, rastrear a sua localização GPS em background, visualizar resumos de viagem e gerir ganhos via wallet.

## Problema que resolve

O motorista precisa de:

1. **Receber e gerir pedidos** de corrida em tempo real
2. **Enviar localização GPS** continuamente (foreground + background), mesmo com o app em segundo plano
3. **Navegar ao passageiro** e ao destino com mapa interactivo
4. **Visualizar o Ride Summary** com breakdown financeiro detalhado
5. **Gerir a wallet** e acompanhar os ganhos

## Contexto no Ecossistema

- Escreve continuamente em `rideTracking/{rideId}` com GPS (lido pelo app passageiro)
- Actualiza `drivers/{uid}.location` a cada ciclo de tracking
- Comunica com a **API Fastify** para operações de wallet e pagamentos
- Recebe **notificações push** FCM quando há novas corridas disponíveis

## Funcionalidades Principais

| Feature             | Descrição                                                          |
| ------------------- | ------------------------------------------------------------------ |
| GPS em background   | expo-location + expo-task-manager (foreground service Android/iOS) |
| Rastreamento activo | Actualização de posição a cada ~5s durante corrida                 |
| Ride Summary        | Componentes modulares com breakdown financeiro                     |
| Polyline de rota    | @mapbox/polyline + trimming da rota percorrida                     |
| Notificações push   | FCM para iOS e Android                                             |
| Bottom Sheets       | Gorhom Bottom Sheet para UX fluida de gestão de corrida            |
| Wallet / Ganhos     | Integração com API Fastify para saldo e transações                 |
| Multilingue         | Português e Inglês (i18next)                                       |
| Dark mode           | ThemeProvider com alternância automática                           |

---

**Próximo**: [01 — Arquitectura](01-architecture.md)
