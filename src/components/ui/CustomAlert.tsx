import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react-native'
import { useAlert, AlertType } from '@/context/AlertContext'

// Map types to colors and icons
const TYPE_CONFIG: Record<AlertType, { color: string; bg: string; icon: any }> =
  {
    success: { color: '#10B981', bg: '#D1FAE5', icon: CheckCircle },
    error: { color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
    warning: { color: '#F59E0B', bg: '#FEF3C7', icon: AlertTriangle },
    info: { color: '#3B82F6', bg: '#DBEAFE', icon: Info }
  }

export const CustomAlert = () => {
  const { alertState, hideAlert } = useAlert()
  const {
    visible,
    title,
    message,
    type = 'info',
    buttons,
    cancelable = true
  } = alertState

  // Animations
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.8)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 })
      scale.value = withSpring(1, { damping: 15 })
    } else {
      opacity.value = withTiming(0, { duration: 150 })
      scale.value = withTiming(0.8, { duration: 150 })
    }
  }, [visible])

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }))

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }))

  const handleClose = () => {
    if (!visible) return
    // Animate out then hide
    opacity.value = withTiming(0, { duration: 150 }, finished => {
      if (finished) {
        runOnJS(hideAlert)()
      }
    })
  }

  // Handle Overlay Press
  const onOverlayPress = () => {
    if (cancelable) handleClose()
  }

  if (!visible && opacity.value === 0) return null

  const Config = TYPE_CONFIG[type]
  const Icon = Config.icon

  // Default button if none provided
  const actionButtons =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: 'OK', onPress: handleClose, style: 'default' }]

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.container, animatedContentStyle]}>
              {/* Header Icon */}
              <View
                style={[styles.iconContainer, { backgroundColor: Config.bg }]}
              >
                <Icon size={32} color={Config.color} />
              </View>

              {/* Content */}
              <View className="mt-4 items-center">
                <Text className="text-xl font-bold text-gray-900 text-center font-sans tracking-tight">
                  {title}
                </Text>
                <Text className="text-gray-500 text-center mt-2 px-2 font-sans leading-5">
                  {message}
                </Text>
              </View>

              {/* Buttons */}
              <View className="flex-row mt-6 w-full justify-end space-x-3 gap-2">
                {actionButtons.map((btn, index) => {
                  const isCancel = btn.style === 'cancel'
                  const isDestructive = btn.style === 'destructive'

                  // Primary style for the last button usually (or distinct logic)
                  // Let's make all non-cancel buttons have color text, or bg
                  // Simple design: Text buttons for secondary, Filled for Primary?
                  // Let's mimic iOS alert style: Rows or Columns, but horizontal flexible

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        handleClose()
                        btn.onPress?.()
                      }}
                      className={`flex-1 py-3 rounded-xl items-center justify-center ${
                        isDestructive
                          ? 'bg-red-50'
                          : isCancel
                            ? 'bg-gray-100'
                            : 'bg-primary-200' // Primary
                      }`}
                      style={{ minHeight: 48 }}
                    >
                      <Text
                        className={`font-semibold text-base ${
                          isDestructive
                            ? 'text-red-600'
                            : isCancel
                              ? 'text-gray-700'
                              : 'text-white'
                        }`}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999
  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  }
})
