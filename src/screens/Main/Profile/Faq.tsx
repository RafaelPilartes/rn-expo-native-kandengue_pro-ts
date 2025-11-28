// src/screens/Faq.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '@/components/PageHeader';

const faqData = [
  {
    question: 'Como faço para solicitar uma viagem?',
    answer:
      'Abra o aplicativo, escolha o ponto de partida e o destino, selecione o tipo de transporte e confirme a solicitação.',
  },
  {
    question: 'Quais são os métodos de pagamento aceitos?',
    answer:
      'O Kandengue Atrevido aceita pagamentos via dinheiro, cartão e carteira digital (quando disponível).',
  },
  {
    question: 'Posso cancelar uma viagem?',
    answer:
      'Sim, você pode cancelar antes do motorista iniciar o trajeto. Dependendo da situação, poderá haver uma taxa de cancelamento.',
  },
  {
    question: 'O aplicativo funciona em qualquer lugar?',
    answer:
      'Atualmente o Kandengue Atrevido funciona nas principais cidades, e estamos expandindo para novas regiões.',
  },
];

export default function FaqScreen() {
  const navigation = useNavigation<any>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <PageHeader title="Perguntas Frequentes" canGoBack={true} />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-6">
          <HelpCircle size={60} color="#E0212D" />
          <Text className="text-2xl font-bold text-primary-200 mt-3">
            Perguntas Frequentes
          </Text>
        </View>

        {faqData.map((item, index) => (
          <View
            key={index}
            className="mb-4 bg-white rounded-xl shadow px-4 py-3"
          >
            <TouchableOpacity
              onPress={() => toggleItem(index)}
              className="flex-row justify-between items-center"
            >
              <Text className="text-base font-semibold text-gray-800">
                {item.question}
              </Text>
              {openIndex === index ? (
                <ChevronUp size={20} color="gray" />
              ) : (
                <ChevronDown size={20} color="gray" />
              )}
            </TouchableOpacity>
            {openIndex === index && (
              <Text className="mt-2 text-gray-600 text-sm leading-5">
                {item.answer}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
