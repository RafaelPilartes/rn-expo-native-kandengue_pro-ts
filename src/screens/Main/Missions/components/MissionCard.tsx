// src/screens/Main/Missions/components/MissionCard.tsx
import React from 'react'
import { View, Text } from 'react-native'
import {
  Target,
  Trophy,
  Clock,
  CalendarDays,
  CalendarRange,
  Check,
  Banknote
} from 'lucide-react-native'
import { formatMoney } from '@/utils/formattedNumber'
import { MissionEntity } from '@/core/entities/Mission'
import { MissionProgressEntity } from '@/core/entities/MissionProgress'

interface MissionCardProps {
  mission: MissionEntity
  progress: MissionProgressEntity | null
  percentage: number
}

const typeConfig = {
  daily: { label: 'Diária', icon: Clock, color: '#F59E0B' },
  weekly: { label: 'Semanal', icon: CalendarDays, color: '#3B82F6' },
  monthly: { label: 'Mensal', icon: CalendarRange, color: '#8B5CF6' }
} as const

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  progress,
  percentage
}) => {
  const current = progress?.current_count ?? 0
  const isCompleted = progress?.is_completed ?? false
  const isPaid = progress?.is_paid ?? false
  const config = typeConfig[mission.type]
  const TypeIcon = config.icon

  const getStatusBadge = () => {
    if (isPaid) {
      return { label: 'Pago', bg: 'bg-green-100', text: 'text-green-700' }
    }
    if (isCompleted) {
      return { label: 'Concluída', bg: 'bg-green-100', text: 'text-green-700' }
    }
    return { label: 'Em progresso', bg: 'bg-gray-100', text: 'text-gray-600' }
  }

  const status = getStatusBadge()

  return (
    <View
      className="bg-white rounded-2xl p-5 mb-3"
      style={{
        shadowColor: '#2424244b',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1
      }}
    >
      {/* Top Row: Type + Status */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mr-2"
            style={{ backgroundColor: `${config.color}18` }}
          >
            <TypeIcon size={16} color={config.color} />
          </View>
          <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: config.color }}>
            {config.label}
          </Text>
        </View>

        <View className={`px-2.5 py-1 rounded-full ${status.bg}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-wider ${status.text}`}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Mission Title */}
      <View className="flex-row items-center mb-1">
        {isCompleted ? (
          <Trophy size={18} color="#16A34A" />
        ) : (
          <Target size={18} color="#b31a24" />
        )}
        <Text className="text-base font-bold text-gray-900 ml-2">
          {isCompleted
            ? 'Missão concluída!'
            : `Complete ${mission.target} corridas`}
        </Text>
      </View>

      <Text className="text-sm text-gray-500 mb-4">
        {isCompleted
          ? `Parabéns! Completaste ${current} corridas.`
          : `Faltam ${Math.max(mission.target - current, 0)} corridas para completar.`}
      </Text>

      {/* Progress Bar */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-xs font-medium text-gray-400">Progresso</Text>
          <Text className="text-xs font-bold text-gray-700">
            {current}/{mission.target} ({Math.round(percentage)}%)
          </Text>
        </View>

        <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>

      {/* Reward */}
      <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-3">
        <View className="flex-row items-center">
          <Banknote size={18} color="#16A34A" />
          <Text className="text-sm font-medium text-gray-600 ml-2">
            Recompensa
          </Text>
        </View>
        <Text className="text-base font-bold text-green-600">
          +{formatMoney(mission.reward, 0)}
        </Text>
      </View>

      {/* Completed Rides Summary */}
      {progress && progress.completed_ride_ids.length > 0 && (
        <View className="mt-3 flex-row items-center">
          <Check size={14} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 ml-1.5">
            {progress.completed_ride_ids.length} corrida{progress.completed_ride_ids.length !== 1 ? 's' : ''} contabilizada{progress.completed_ride_ids.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  )
}
