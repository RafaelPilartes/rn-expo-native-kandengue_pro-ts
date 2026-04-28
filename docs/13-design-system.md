# Design System — App Motorista (Kandengue Pro)

O aplicativo utiliza um Design System customizado implementado através do **NativeWind** (Tailwind CSS) e variáveis de tema, muito similar ao da aplicação do Passageiro, mas focado num aspecto mais profissional para o condutor.

## Cores Principais

| Nome       | Uso                                                                      |
| ---------- | ------------------------------------------------------------------------ |
| `primary`  | Elementos de acção principal (ex: Aceitar Corrida, Botão Online/Offline) |
| `accent`   | Cor de destaque para alertas ou acções secundárias                       |
| `baseText` | Cor do texto principal (Light Mode)                                      |
| `baseDark` | Fundos escuros / Dark Mode                                               |

_As cores específicas e hex codes estão definidas no `tailwind.config.js`._

## Espaçamento e Layout

As margens e paddings estão padronizadas usando tokens customizados do Tailwind.

## Dark Mode

O aplicativo suporta alternância completa de tema:

- Útil para motoristas que conduzem à noite.
- Controlado globalmente via `ThemeProvider` e Context API.
- Usamos classes do Tailwind com o prefixo `dark:` para aplicar estilos específicos.

## UI Components Globais

Componentes reutilizáveis devem ser colocados em `src/components/ui/`:

- `CustomButton`: Estilizado com as cores da marca.
- `CustomAlert`: Substituto do `Alert.alert` com 4 variantes (`success`, `error`, `warning`, `info`). Usa animações com `react-native-reanimated`.
- `NetworkStatusBanner`: Mostra quando o dispositivo perde a ligação à Internet.

---

**Anterior**: [12 — Roadmap](12-roadmap.md) | **Próximo**: [14 — Features e Dependências](14-features-tools.md)
