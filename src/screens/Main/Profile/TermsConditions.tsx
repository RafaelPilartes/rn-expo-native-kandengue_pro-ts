// src/screens/TermsConditionsScreen.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native'
import {
  FileText,
  Shield,
  CreditCard,
  User,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle
} from 'lucide-react-native'
import PageHeader from '@/components/PageHeader'

export default function TermsConditionsScreen() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['acceptance'])
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

  const handleContactLegal = () => {
    Linking.openURL('mailto:comercial@kandengueatrevido.ao').catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o email.')
    )
  }

  const termsSections = [
    {
      id: 'acceptance',
      icon: CheckCircle,
      title: '1. Aceitação dos Termos',
      content: `Ao utilizar o aplicativo Kandengue Atrevido, operado pela MUXIMA TECH - COMÉRCIO E SERVIÇOS, LDA, você concorda inteiramente com estes Termos e Condições.

Se você não concordar com qualquer parte destes termos, você não deve utilizar o nosso serviço.`
    },
    {
      id: 'services',
      icon: MapPin,
      title: '2. Descrição do Serviço',
      content: `O Kandengue Atrevido é uma plataforma tecnológica que facilita a conexão entre:
      
• Passageiros que buscam serviços de transporte.
• Motoristas parceiros independentes.
• Usuários que necessitam de serviços de entrega.

A MUXIMA TECH atua exclusivamente como intermediária e não fornece serviços de transporte diretamente.`
    },
    {
      id: 'registration',
      icon: User,
      title: '3. Cadastro e Conta',
      content: `Para utilizar o serviço, você deve:

• Ter pelo menos 18 anos de idade.
• Fornecer informações precisas, atuais e completas.
• Manter a segurança de sua senha e identificação da conta.

A MUXIMA TECH reserva-se o direito de suspender contas que violem estes termos ou apresentem comportamento suspeito.`
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: '4. Pagamentos',
      content: `• As tarifas são calculadas automaticamente pelo aplicativo baseadas em distância e tempo estimado.
• O pagamento pode ser feito via dinheiro, carteira digital ou outros métodos integrados.
• Taxas de cancelamento podem ser aplicadas conforme a política vigente.`
    },
    {
      id: 'responsibilities',
      icon: Shield,
      title: '5. Responsabilidades',
      content: `O Usuário concorda em:
• Não utilizar o serviço para fins ilícitos.
• Não transportar materiais perigosos ou proibidos.
• Tratar motoristas e outros usuários com respeito e cortesia.

A violação destas regras pode resultar no banimento permanente da plataforma.`
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: '6. Limitação de Responsabilidade',
      content: `A MUXIMA TECH não se responsabiliza por:
• Danos indiretos, incidentais ou consequentes.
• Atrasos ou falhas decorrentes de causas fora de nosso controle razoável.
• A qualidade ou segurança do serviço de transporte prestado pelo motorista parceiro (embora realizemos verificações de segurança).`
    }
  ]

  return (
    <View className="flex-1 bg-gray-50 p-safe">
      <PageHeader title="Termos de Uso" canGoBack={true} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="bg-white px-6 pb-8 border-b border-gray-100 items-center">
          <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4 border border-gray-100">
            <FileText size={28} color="#374151" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Termos e Condições
          </Text>
          <Text className="text-gray-500 text-center leading-relaxed text-sm max-w-xs">
            Última atualização: Novembro, 2025
            {'\n'}Por favor, leia atentamente antes de usar.
          </Text>
        </View>

        {/* Sections */}
        <View className="px-5 mt-6">
          {termsSections.map(section => {
            const IconComponent = section.icon
            const isExpanded = isSectionExpanded(section.id)

            return (
              <View key={section.id} className="mb-4">
                <TouchableOpacity
                  className={`bg-white rounded-2xl p-5 border border-gray-100 ${isExpanded ? 'border-gray-100' : ''}`}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <IconComponent
                        size={18}
                        color={isExpanded ? '#111827' : '#6B7280'}
                        className="mr-3"
                      />
                      <Text
                        className={`text-base font-bold flex-1 mr-2 ${isExpanded ? 'text-gray-900' : 'text-gray-700'}`}
                      >
                        {section.title}
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color="#374151" />
                    ) : (
                      <ChevronDown size={20} color="#9CA3AF" />
                    )}
                  </View>

                  {isExpanded && (
                    <Text className="text-gray-600 mt-4 leading-7 text-sm">
                      {section.content}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          })}
        </View>

        {/* Contact Legal */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-4"
            onPress={handleContactLegal}
          >
            <View>
              <Text className="font-bold text-gray-900 text-sm">
                Dúvidas sobre os termos?
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                Fale com nosso jurídico
              </Text>
            </View>
            <ExternalLink size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="px-6 mt-8 mb-4">
          <Text className="text-gray-400 text-center text-xs">
            MUXIMA TECH - COMÉRCIO E SERVIÇOS, LDA
            {'\n'}Luanda, Angola
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
