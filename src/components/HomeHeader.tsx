// src/components/HomeHeader.tsx
import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet
} from 'react-native'
import { Bell, Eye, EyeOff } from 'lucide-react-native'
import { DriverInterface } from '@/interfaces/IDriver'

interface HeaderProps {
  driver: DriverInterface | null
  onToggleOnline: () => void
  onToggleInvisible: () => void
  onNotifications: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  notificationCount?: number
}

const Header: React.FC<HeaderProps> = ({
  driver,
  onToggleOnline,
  onToggleInvisible,
  onNotifications,
  notificationCount = 0
}) => {
  const firstName = driver?.name.split(' ')[0] || ''

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {/* Avatar com Status Indicator */}
        <View style={{ position: 'relative', marginRight: 12 }}>
          <Image
            source={{
              uri:
                driver?.photo ??
                'https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
            }}
            style={styles.avatar}
          />
          {/* Status Indicator */}
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: driver?.is_online ? '#22C55E' : '#9CA3AF' }
            ]}
          />
        </View>

        {/* Info do motorista */}
        <View style={{ flex: 1 }}>
          <Text className="text-lg font-bold text-gray-900">
            Olá, {firstName}!
          </Text>

          {/* Status com Switch */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4,
              gap: 8
            }}
          >
            <Text
              style={[
                styles.statusText,
                { color: driver?.is_online ? '#22C55E' : '#6B7280' }
              ]}
            >
              {driver?.is_online ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={driver?.is_online}
              onValueChange={onToggleOnline}
              trackColor={{ true: '#22C55E', false: '#E5E7EB' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />

            {/* Modo Invisível */}
            {driver?.is_online && (
              <TouchableOpacity
                onPress={onToggleInvisible}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 4
                }}
                activeOpacity={0.7}
              >
                {driver?.is_invisible ? (
                  <EyeOff size={14} color="#9CA3AF" />
                ) : (
                  <Eye size={14} color="#6B7280" />
                )}
                <Text className="text-xs font-medium text-gray-600">
                  {driver?.is_invisible ? 'Invisível' : 'Visível'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Botão de Notificações */}
      <TouchableOpacity
        onPress={onNotifications}
        style={styles.notificationButton}
        activeOpacity={0.7}
      >
        <Bell size={22} color="#374151" />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#F3F4F6'
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  }
})

export default Header
