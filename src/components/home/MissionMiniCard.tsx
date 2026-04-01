// src/components/home/MissionMiniCard.tsx
import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Target, ChevronRight, Trophy } from 'lucide-react-native'
import { formatMoney } from '@/utils/formattedNumber'
import { useMissionHome } from '@/hooks/useMissionHome'
import type { MissionType } from '@/types/enum'

interface MissionMiniCardProps {
  driverId: string | undefined
  onPress: () => void
}

const typeLabel: Record<MissionType, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal'
}

export const MissionMiniCard: React.FC<MissionMiniCardProps> = ({
  driverId,
  onPress
}) => {
  const { bestMission, isLoading, hasMissions } = useMissionHome(driverId)

  if (isLoading) {
    return (
      <View className="mx-5 mb-3 bg-white rounded-2xl p-4 flex-row items-center justify-center"
        style={{
          shadowColor: '#2424244b',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
          elevation: 1
        }}
      >
        <ActivityIndicator size="small" color="#b31a24" />
      </View>
    )
  }

  if (!hasMissions || !bestMission) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="mx-5 mb-3 bg-white rounded-2xl p-4 flex-row items-center justify-between"
        style={{
          shadowColor: '#2424244b',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
          elevation: 1
        }}
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-gray-50">
            <Target size={20} color="#9CA3AF" />
          </View>
          <View>
            <Text className="text-sm font-bold text-gray-900">Missões</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Sem missões ativas · Ver histórico
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color="#9CA3AF" />
      </TouchableOpacity>
    )
  }

  const { mission, progress, percentage } = bestMission
  const current = progress?.current_count ?? 0
  const isCompleted = progress?.is_completed ?? false

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mx-5 mb-3 bg-white rounded-2xl p-4"
      style={{
        shadowColor: '#2424244b',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1
      }}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
            isCompleted ? 'bg-green-100' : 'bg-red-50'
          }`}
        >
          {isCompleted ? (
            <Trophy size={20} color="#16A34A" />
          ) : (
            <Target size={20} color="#b31a24" />
          )}
        </View>

        {/* Info */}
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
              {isCompleted
                ? 'Missão concluída!'
                : `Complete ${mission.target} corridas`}
            </Text>
            <View className="bg-gray-100 px-2 py-0.5 rounded-full ml-2">
              <Text className="text-[10px] font-bold text-gray-500 uppercase">
                {typeLabel[mission.type]}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="flex-row items-center">
            <View className="flex-1 h-2 bg-gray-100 rounded-full mr-3 overflow-hidden">
              <View
                className={`h-full rounded-full ${
                  isCompleted ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </View>
            <Text className="text-xs font-bold text-gray-500">
              {current}/{mission.target}
            </Text>
          </View>
        </View>

        {/* Reward + Arrow */}
        <View className="items-end">
          <Text className="text-sm font-bold text-green-600 mb-0.5">
            +{formatMoney(mission.reward, 0)}
          </Text>
          <ChevronRight size={16} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  )
}
