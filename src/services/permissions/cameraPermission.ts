import { PermissionsAndroid, Platform } from 'react-native'

export async function ensureCameraPermission() {
  if (Platform.OS !== 'android') return true

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Permissão para usar a câmera',
      message: 'O app precisa acessar a câmera.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar'
    }
  )

  return granted === PermissionsAndroid.RESULTS.GRANTED
}
