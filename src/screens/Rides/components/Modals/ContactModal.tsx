import React from 'react'
import { Modal, View, Text, TouchableOpacity, Linking } from 'react-native'
import { Phone, MessageCircle } from 'lucide-react-native'

interface ContactModalProps {
  visible: boolean
  onClose: () => void
  contactType: 'call' | 'message' | null
  phone: string | null
}

export const ContactModal: React.FC<ContactModalProps> = ({
  visible,
  onClose,
  contactType,
  phone
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white w-full rounded-3xl p-6 items-center">
          <View
            className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
              contactType === 'call' ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            {contactType === 'call' ? (
              <Phone color="#16A34A" size={28} strokeWidth={2.5} />
            ) : (
              <MessageCircle color="#4B5563" size={30} />
            )}
          </View>

          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            {contactType === 'call' ? 'Ligar para o Cliente' : 'Enviar Mensagem'}
          </Text>

          <Text className="text-gray-500 text-center mb-8">
            Deseja {contactType === 'call' ? 'ligar' : 'enviar mensagem'} para{' '}
            <Text className="font-bold text-gray-700">{phone}</Text>?
          </Text>

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 py-4 bg-gray-100 rounded-xl items-center active:bg-gray-200"
              onPress={onClose}
            >
              <Text className="text-gray-600 font-bold text-base">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-4 rounded-xl items-center ${
                contactType === 'call'
                  ? 'bg-green-600 active:bg-green-700'
                  : 'bg-gray-800 active:bg-gray-900'
              }`}
              onPress={() => {
                onClose()
                if (phone) {
                  if (contactType === 'call') {
                    Linking.openURL(`tel:${phone}`)
                  } else {
                    Linking.openURL(`sms:${phone}`)
                  }
                }
              }}
            >
              <Text className="text-white font-bold text-base">
                {contactType === 'call' ? 'Ligar Agora' : 'Enviar Agora'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
