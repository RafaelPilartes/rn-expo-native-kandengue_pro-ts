// src/screens/PrivacyPolicyScreen.tsx
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import {
  Shield,
  ChevronDown,
  ChevronUp,
  Lock,
  Eye,
  User,
  Share2,
  FileText
} from 'lucide-react-native'
import PageHeader from '@/components/PageHeader'

export default function PrivacyPolicyScreen() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['introduction'])
  )

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections)
    if (newSections.has(section)) {
      newSections.delete(section)
    } else {
      newSections.add(section)
    }
    setExpandedSections(newSections)
  }

  const isSectionExpanded = (section: string) => expandedSections.has(section)

  const sections = [
    {
      id: 'introduction',
      title: '1. Introdução',
      icon: Shield,
      content: `A MUXIMA TECH - COMÉRCIO E SERVIÇOS, LDA ("Kandengue Atrevido") valoriza sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossos serviços.

Ao utilizar nosso aplicativo, você concorda com a coleta e uso de informações de acordo com esta política.`
    },
    {
      id: 'information-collection',
      title: '2. Informações que Coletamos',
      icon: User,
      content: `Coletamos diferentes tipos de informações para fornecer e melhorar nosso serviço:

• Informações Pessoais: Nome, endereço de e-mail, número de telefone e foto de perfil.
• Dados de Geolocalização: Coletamos sua localização precisa para conectar motoristas e passageiros e rastrear entregas.
• Dados de Pagamento: Detalhes de transações e métodos de pagamento (processados de forma segura).
• Dados do Dispositivo: Modelo do aparelho, sistema operacional e identificadores únicos.`
    },
    {
      id: 'how-we-use',
      title: '3. Uso das Informações',
      icon: Eye,
      content: `Utilizamos seus dados para:

• Facilitar e processar corridas e entregas.
• Processar pagamentos e prevenir fraudes.
• Melhorar a segurança e a eficiência da plataforma.
• Enviar notificações importantes sobre o serviço.
• Analisar tendências de uso para melhorias futuras.`
    },
    {
      id: 'information-sharing',
      title: '4. Compartilhamento de Dados',
      icon: Share2,
      content: `Não vendemos seus dados pessoais. Compartilhamos informações apenas nas seguintes situações:

• Com Motoristas/Passageiros: Apenas os dados necessários para a realização do serviço (nome, foto, localização).
• Prestadores de Serviço: Empresas que processam pagamentos ou hospedagem de dados.
• Obrigações Legais: Quando exigido por lei ou autoridades competentes.`
    },
    {
      id: 'data-security',
      title: '5. Segurança',
      icon: Lock,
      content: `A MUXIMA TECH implementa medidas de segurança rigorosas para proteger seus dados, incluindo criptografia e controles de acesso restritos. No entanto, nenhum método de transmissão pela internet é 100% seguro.`
    },
    {
      id: 'user-rights',
      title: '6. Seus Direitos',
      icon: FileText,
      content: `Você tem direito a solicitar acesso, correção ou exclusão de seus dados pessoais. Entre em contato com nosso suporte para exercer esses direitos.`
    },
    {
      id: 'contact',
      title: '7. Fale Conosco',
      content: `Se tiver dúvidas sobre esta Política de Privacidade, entre em contato:

MUXIMA TECH - COMÉRCIO E SERVIÇOS, LDA
NIF: 5002662523
Email: privacy@kandengueatrevido.ao
Telefone: 928 888 745`
    }
  ]

  return (
    <View className="flex-1 bg-gray-50 p-safe">
      <PageHeader title="Política de Privacidade" canGoBack={true} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Summary */}
        <View className="bg-white justify-center items-center px-6 pb-8 border-b border-gray-100">
          <View className="bg-blue-50 w-12 h-12 rounded-xl items-center justify-center mb-4">
            <Shield size={24} color="#2563EB" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Sua privacidade é nossa prioridade
          </Text>
          <Text className="text-gray-500 text-sm">
            Esta política descreve como a MUXIMA TECH trata seus dados pessoais.
            {'\n'}Última atualização: Novembro, 2025
          </Text>
        </View>

        {/* Sections */}
        <View className="px-5 mt-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            const isExpanded = isSectionExpanded(section.id)

            return (
              <View key={section.id} className="mb-4">
                <TouchableOpacity
                  className={`bg-white rounded-2xl p-5 border border-gray-100 ${isExpanded ? 'border-blue-100 bg-blue-50' : ''}`}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      {IconComponent && (
                        <View
                          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isExpanded ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <IconComponent
                            size={14}
                            color={isExpanded ? '#2563EB' : '#6B7280'}
                          />
                        </View>
                      )}
                      <Text
                        className={`text-base font-bold flex-1 mr-2 ${isExpanded ? 'text-blue-900' : 'text-gray-900'}`}
                      >
                        {section.title}
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp
                        size={20}
                        color={isExpanded ? '#2563EB' : '#9CA3AF'}
                      />
                    ) : (
                      <ChevronDown size={20} color="#9CA3AF" />
                    )}
                  </View>

                  {isExpanded && (
                    <Text className="text-gray-600 mt-4 text-sm">
                      {section.content}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <View className="px-6 mb-6 mt-2">
          <Text className="text-center text-xs text-gray-400">
            © 2025 MUXIMA TECH. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
