"use client"

import { View, Text, TouchableOpacity } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

const CreateLivestreamScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200 flex-row items-center">
        <Text className="text-xl font-semibold">Create Livestream</Text>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center p-8">
        <View className="items-center justify-center w-20 h-20 mb-6 bg-blue-100 rounded-full">
          <Ionicons name="videocam" size={40} color="#3b82f6" />
        </View>

        <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">Livestream Feature</Text>

        <Text className="text-lg text-gray-600 text-center mb-8">This feature will be implemented soon</Text>

        <Text className="text-sm text-gray-500 text-center leading-6">
          We're working hard to bring you the ability to create and manage livestreams. Stay tuned for updates!
        </Text>
      </View>
    </View>
  )
}

export default CreateLivestreamScreen
