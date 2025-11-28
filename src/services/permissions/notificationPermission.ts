// services/permissions/notificationPermission.ts
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

export interface NotificationPermissionResponse {
  granted: boolean;
  denied: boolean;
  blocked: boolean;
  reason?: string;
}

// 🔹 CORREÇÃO: Constante segura para POST_NOTIFICATIONS
const ANDROID_POST_NOTIFICATIONS = (PERMISSIONS.ANDROID as any)
  .POST_NOTIFICATIONS as Permission | undefined;

// 🔹 Obter permissão de notificação de forma segura
const getNotificationPermission = (): Permission | null => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.REMINDERS; // Notificações no iOS são gerenciadas pelo Firebase
  }

  if (Platform.OS === 'android') {
    const androidVersion = Platform.Version as number;

    // Android 13+ (API level 33) precisa de POST_NOTIFICATIONS
    if (androidVersion >= 33) {
      return ANDROID_POST_NOTIFICATIONS || null;
    }
  }

  return null;
};

export const checkNotificationPermission =
  async (): Promise<NotificationPermissionResponse> => {
    try {
      if (Platform.OS === 'ios') {
        try {
          const authStatus = await messaging().hasPermission();
          return {
            granted: authStatus === messaging.AuthorizationStatus.AUTHORIZED,
            denied: authStatus === messaging.AuthorizationStatus.DENIED,
            blocked:
              authStatus === messaging.AuthorizationStatus.NOT_DETERMINED,
          };
        } catch (firebaseError) {
          console.warn(
            'Erro no Firebase Messaging, usando fallback:',
            firebaseError,
          );
          return {
            granted: false,
            denied: true,
            blocked: false,
            reason: 'firebase_error',
          };
        }
      } else {
        const permission = getNotificationPermission();

        if (permission) {
          const result = await check(permission);
          return {
            granted: result === RESULTS.GRANTED,
            denied: result === RESULTS.DENIED,
            blocked: result === RESULTS.BLOCKED,
          };
        }

        // Android <13 não precisa de permissão explícita
        return { granted: true, denied: false, blocked: false };
      }
    } catch (error) {
      console.error('Erro ao verificar permissão de notificação:', error);
      return { granted: false, denied: true, blocked: false };
    }
  };

export const requestNotificationPermission =
  async (): Promise<NotificationPermissionResponse> => {
    try {
      if (Platform.OS === 'ios') {
        try {
          const authStatus = await messaging().requestPermission();
          return {
            granted: authStatus === messaging.AuthorizationStatus.AUTHORIZED,
            denied: authStatus === messaging.AuthorizationStatus.DENIED,
            blocked:
              authStatus === messaging.AuthorizationStatus.NOT_DETERMINED,
          };
        } catch (firebaseError) {
          console.warn(
            'Erro no Firebase Messaging ao solicitar permissão:',
            firebaseError,
          );
          return {
            granted: false,
            denied: true,
            blocked: false,
            reason: 'firebase_request_failed',
          };
        }
      } else {
        const permission = getNotificationPermission();

        if (permission) {
          const result = await request(permission);
          return {
            granted: result === RESULTS.GRANTED,
            denied: result === RESULTS.DENIED,
            blocked: result === RESULTS.BLOCKED,
          };
        }

        return { granted: true, denied: false, blocked: false };
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return { granted: false, denied: true, blocked: false };
    }
  };

// 🔹 NOVO: Verificar se notificações estão habilitadas no sistema
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const permission = await checkNotificationPermission();
    return permission.granted;
  } catch (error) {
    console.error(
      'Erro ao verificar se notificações estão habilitadas:',
      error,
    );
    return false;
  }
};
