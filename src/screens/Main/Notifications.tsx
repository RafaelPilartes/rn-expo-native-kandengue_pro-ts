// src/screens/Notifications.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Info, Gift, Car, Bike } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '@/components/PageHeader';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();

  const notifications = [
    {
      id: 1,
      date: 'Hoje',
      items: [
        {
          id: 'n1',
          title: 'Nova corrida concluída',
          message: 'Sua viagem de carro foi finalizada com sucesso.',
          icon: <Car size={22} color="#2563EB" />,
        },
        {
          id: 'n2',
          title: 'Promoção disponível',
          message: 'Ganhe 20% de desconto na próxima entrega.',
          icon: <Gift size={22} color="#16A34A" />,
        },
      ],
    },
    {
      id: 2,
      date: 'Ontem',
      items: [
        {
          id: 'n3',
          title: 'Atualização do app',
          message: 'Nova versão disponível para melhorar sua experiência.',
          icon: <Info size={22} color="#F59E0B" />,
        },
      ],
    },
    {
      id: 3,
      date: 'Semana passada',
      items: [
        {
          id: 'n4',
          title: 'Viagem de mota concluída',
          message: 'Sua corrida de mota terminou com sucesso.',
          icon: <Bike size={22} color="#DC2626" />,
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <PageHeader title="Notificações" canGoBack={true} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {notifications.map(section => (
          <View key={section.id} className="mb-6">
            {/* Título da seção */}
            <Text className="text-gray-500 font-semibold mb-3">
              {section.date}
            </Text>

            {/* Lista de notificações */}
            {section.items.map(notif => (
              <View
                key={notif.id}
                className="bg-white rounded-xl shadow p-4 flex-row items-start mb-3"
              >
                <View className="mt-1">{notif.icon}</View>
                <View className="ml-3 flex-1">
                  <Text className="text-gray-900 font-semibold">
                    {notif.title}
                  </Text>
                  <Text className="text-gray-600 mt-1">{notif.message}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
