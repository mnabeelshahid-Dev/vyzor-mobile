import React from 'react';
import { View, Text } from 'react-native';

const TailwindTest: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500 p-4">
      <Text className="text-white text-xl font-bold mb-4">
        Tailwind is Working! 🎉
      </Text>
      <View className="bg-white rounded-lg p-4 shadow-lg">
        <Text className="text-gray-800 text-center">
          This box is styled with Tailwind CSS
        </Text>
      </View>
    </View>
  );
};

export default TailwindTest;
