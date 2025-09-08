"use client"

import { View, Text } from "react-native"

const SellerAnalyticsScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200 w-full">
        <Text className="text-xl font-semibold">Analytics</Text>
      </View>

      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-lg font-medium text-gray-600 text-center">This feature will be implemented soon</Text>
      </View>
    </View>
  )
}

export default SellerAnalyticsScreen
