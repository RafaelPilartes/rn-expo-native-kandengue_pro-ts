// src/components/HomeHeader.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Switch } from 'react-native';
import { Bell, RefreshCw } from 'lucide-react-native';
import { DriverInterface } from '@/interfaces/IDriver';

interface HeaderProps {
  driver: DriverInterface | null;
  onToggleOnline: () => void;
  onNotifications: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  driver,
  onToggleOnline,
  onNotifications,
  onRefresh,
  isRefreshing = false,
}) => {
  const firstName = driver?.name.split(' ')[0] || '';
  const lastName = driver?.name.split(' ')[1] || '';

  return (
    <View className="px-5 py-4 flex-row items-center justify-between mb-2 bg-white">
      <View className="flex-row items-center">
        <Image
          source={{
            uri:
              driver?.photo ??
              'https://cdn-icons-png.flaticon.com/512/3541/3541871.png',
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View>
          <Text className="text-lg font-semibold text-gray-800">
            Olá, {firstName} {lastName}
          </Text>
          <View className="flex-row items-center">
            <Text
              className={`text-sm font-medium ${
                driver?.is_online ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {driver?.is_online ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={driver?.is_online}
              onValueChange={onToggleOnline}
              trackColor={{ true: '#16a34a', false: '#d1d5db' }}
              thumbColor={driver?.is_online ? '#22c55e' : '#f4f4f5'}
              className="ml-2"
            />
          </View>
        </View>
      </View>

      {/* Botões de ação */}
      <View className="flex-row items-center gap-2">
        {/* Botão de atualizar */}
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            disabled={isRefreshing}
            className="bg-gray-100 p-2 rounded-full"
          >
            <RefreshCw
              size={20}
              color={isRefreshing ? '#9CA3AF' : '#6B7280'}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </TouchableOpacity>
        )}
        {/* Notificação */}
        <TouchableOpacity
          onPress={onNotifications}
          activeOpacity={0.7}
          disabled={isRefreshing}
          className="p-2 rounded-full bg-gray-100 items-center justify-center "
        >
          <Bell size={24} color="#6a6f77" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
