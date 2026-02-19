// src/screens/About.tsx
import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native'
import {
  Info,
  Mail,
  Smartphone,
  MapPin,
  ChevronRight
} from 'lucide-react-native'
import PageHeader from '@/components/PageHeader'
import { APP_VERSION, BUILD_NUMBER } from '@/constants/config'

export default function AboutScreen() {
  const handleContact = (type: 'site' | 'email' | 'tel') => {
    let url = ''
    switch (type) {
      case 'site':
        url = 'https://kandengueatrevido.ao'
        break // Placeholder
      case 'email':
        url = 'mailto:Comercial@kandengueatrevido.ao'
        break
      case 'tel':
        url = 'tel:928888745'
        break
    }

    Linking.openURL(url).catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o link.')
    )
  }

  return (
    <View className="flex-1 bg-gray-50 p-safe">
      <PageHeader title="Sobre" canGoBack={true} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Hero */}
        <View className="items-center py-10">
          <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-5 border border-gray-100">
            {/* Logo Placeholder - idealmente seria uma Image */}
            <Info size={40} color="#000" strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 tracking-tight">
            Kandengue Atrevido
          </Text>
          <Text className="text-gray-500 font-medium mt-1">
            Versão {APP_VERSION} ({BUILD_NUMBER})
          </Text>
        </View>

        {/* Company Info Card */}
        <View className="px-5 mb-6">
          <Text className="text-sm font-semibold text-gray-500 uppercase mb-3 ml-1 tracking-wider">
            Informações da Empresa
          </Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="p-5 border-b border-gray-50">
              <Text className="text-xs text-gray-400 font-medium mb-1">
                Entidade Responsável
              </Text>
              <Text className="text-base font-bold text-gray-900 leading-snug">
                MUXIMA TECH - COMÉRCIO E SERVIÇOS, LDA
              </Text>
            </View>
            <View className="p-5 flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-gray-400 font-medium mb-1">
                  NIF
                </Text>
                <Text className="text-base font-semibold text-gray-800">
                  5002662523
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contacts */}
        <View className="px-5 mb-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase mb-3 ml-1 tracking-wider">
            Contactos
          </Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <TouchableOpacity
              onPress={() => handleContact('tel')}
              className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
            >
              <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                <Smartphone size={20} color="#374151" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  Telefone Comercial
                </Text>
                <Text className="text-xs text-gray-500">928 888 745</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleContact('email')}
              className="flex-row items-center p-4 active:bg-gray-50"
            >
              <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                <Mail size={20} color="#374151" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  Email Comercial
                </Text>
                <Text className="text-xs text-gray-500">
                  Comercial@kandengueatrevido.ao
                </Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location (Optional/Placeholder based on context) */}
        <View className="px-5">
          <View className="bg-white rounded-2xl border border-gray-100 p-5 flex-row items-start">
            <MapPin size={20} color="#374151" className="mt-0.5" />
            <View className="ml-4 flex-1">
              <Text className="text-sm font-bold text-gray-900 mb-1">
                Luanda, Angola
              </Text>
              <Text className="text-xs text-gray-500 leading-relaxed">
                Nossa sede está localizada no coração da cidade, focada em mover
                Angola para o futuro.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Credits */}
        <View className="mt-10 items-center flex-col">
          <Text className="text-gray-400 text-xs">
            © 2024 Muxima Tech. Todos os direitos reservados.
          </Text>
          <Text className="text-gray-400 text-xs">
            Desenvolvido por Rafael Pilartes
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
