// src/screens/Main/Missions/Missions.tsx
import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Target, Trophy } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { useAppProvider } from '@/providers/AppProvider'
import { useMissionHome } from '@/hooks/useMissionHome'
import { MissionCard } from './components/MissionCard'
import type { MissionType } from '@/types/enum'

type FilterTab = 'all' | MissionType

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'daily', label: 'Diárias' },
  { key: 'weekly', label: 'Semanais' },
  { key: 'monthly', label: 'Mensais' }
]

export default function MissionsScreen() {
  const navigation = useNavigation()
  const { currentDriverData } = useAppProvider()
  const { allMissions, isLoading, hasMissions } = useMissionHome(
    currentDriverData?.id
  )
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [refreshing, setRefreshing] = useState(false)

  const filteredMissions = useMemo(() => {
    if (activeFilter === 'all') return allMissions
    return allMissions.filter(m => m.mission.type === activeFilter)
  }, [allMissions, activeFilter])

  const activeMissions = useMemo(
    () => filteredMissions.filter(m => !m.progress?.is_completed),
    [filteredMissions]
  )

  const completedMissions = useMemo(
    () => filteredMissions.filter(m => m.progress?.is_completed),
    [filteredMissions]
  )

  const onRefresh = async () => {
    setRefreshing(true)
    // The realtime listeners auto-update, so just a brief delay for UX
    setTimeout(() => setRefreshing(false), 800)
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#b31a24" />
          <Text className="text-gray-500 mt-3 text-sm">
            A carregar missões...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-gray-50 p-2.5 rounded-full mr-3"
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">Missões</Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            Complete corridas e ganhe recompensas
          </Text>
        </View>
        <View className="bg-red-50 w-10 h-10 rounded-xl items-center justify-center">
          <Target size={20} color="#b31a24" />
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-5 pt-3 pb-3 border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-full ${
                activeFilter === tab.key ? 'bg-gray-900' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  activeFilter === tab.key ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!hasMissions ? (
          // Empty State
          <View className="items-center justify-center py-20">
            <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Target size={36} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Sem missões ativas
            </Text>
            <Text className="text-sm text-gray-500 text-center px-10">
              Quando houver missões disponíveis, aparecerão aqui. Continue a
              fazer corridas!
            </Text>
          </View>
        ) : (
          <>
            {/* Active Missions */}
            {activeMissions.length > 0 && (
              <View className="mb-6">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Em Progresso ({activeMissions.length})
                </Text>
                {activeMissions.map(item => (
                  <MissionCard
                    key={item.mission.id}
                    mission={item.mission}
                    progress={item.progress}
                    percentage={item.percentage}
                  />
                ))}
              </View>
            )}

            {/* Completed Missions */}
            {completedMissions.length > 0 && (
              <View>
                <View className="flex-row items-center mb-3">
                  <Trophy size={14} color="#16A34A" />
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1.5">
                    Concluídas ({completedMissions.length})
                  </Text>
                </View>
                {completedMissions.map(item => (
                  <MissionCard
                    key={item.mission.id}
                    mission={item.mission}
                    progress={item.progress}
                    percentage={item.percentage}
                  />
                ))}
              </View>
            )}

            {/* No results for filter */}
            {filteredMissions.length === 0 && (
              <View className="items-center py-16">
                <Text className="text-sm text-gray-400">
                  Sem missões {filterTabs.find(t => t.key === activeFilter)?.label.toLowerCase()} de momento.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
