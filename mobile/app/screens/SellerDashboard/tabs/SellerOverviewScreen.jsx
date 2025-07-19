"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"

const SellerOverviewScreen = ({ navigation }) => {
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Add your first product", completed: false, screen: "AddProduct" },
    { id: 2, text: "Complete your store profile", completed: false, screen: "SellerSettings" },
    { id: 3, text: "Confirm your payout details", completed: false, screen: "SellerSettings" },
    { id: 4, text: "Review our shipping guide", completed: false, screen: "Help" },
  ])

  const toggleChecklistItem = (id) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const navigateToScreen = (screen) => {
    if (screen) {
      navigation.navigate(screen)
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Seller Dashboard</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Welcome Banner */}
        <View className="p-6 mb-6 bg-blue-600 rounded-lg">
          <Text className="text-2xl font-bold text-white">Welcome, Seller!</Text>
          <Text className="mt-1 text-blue-100">Here's a quick overview of your store.</Text>
        </View>

        {/* Onboarding Checklist */}
        <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg">
          <Text className="mb-4 text-lg font-semibold">Getting Started Checklist</Text>
          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center mb-3"
              onPress={() => navigateToScreen(item.screen)}
            >
              <TouchableOpacity onPress={() => toggleChecklistItem(item.id)} className="p-1">
                <Ionicons
                  name={item.completed ? "checkbox" : "square-outline"}
                  size={24}
                  color={item.completed ? "#16a34a" : "#6b7280"}
                />
              </TouchableOpacity>
              <Text className={`ml-3 flex-1 ${item.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                {item.text}
              </Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View>
          <Text className="mb-4 text-lg font-semibold">Store Performance</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 p-4 bg-white border border-gray-200 rounded-lg">
              <Text className="text-gray-500">Total Sales</Text>
              <Text className="mt-1 text-2xl font-bold">₱0.00</Text>
            </View>
            <View className="flex-1 p-4 bg-white border border-gray-200 rounded-lg">
              <Text className="text-gray-500">Total Orders</Text>
              <Text className="mt-1 text-2xl font-bold">0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default SellerOverviewScreen
