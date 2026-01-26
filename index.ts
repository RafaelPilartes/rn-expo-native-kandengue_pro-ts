import { registerRootComponent } from 'expo'

import App from './src/App'


if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
}

registerRootComponent(App)
