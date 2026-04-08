import React, { useEffect, useRef } from 'react';
import { Map } from 'lucide-react-native';
import { View, Text, Animated } from 'react-native';

export const AddressDisplay = ({
  address,
  isLoading = false,
}: {
  address: string;
  isLoading: boolean;
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      opacity.stopAnimation();
    }
  }, [isLoading, opacity]);

  return (
    <View className="py-3 px-5 bg-white rounded-full flex-row items-center shadow-lg border border-gray-100 max-w-[90%]">
      <Map size={20} color="black" />
      {isLoading ? (
        <Animated.View 
          className="h-4 bg-gray-200 rounded ml-3" 
          style={{ width: 150, opacity }} 
        />
      ) : (
        <Text
          className="text-gray-800 ml-3 text-sm font-medium"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flexShrink: 1 }}
        >
          {address}
        </Text>
      )}
    </View>
  );
};
