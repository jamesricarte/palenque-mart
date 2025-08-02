"use client"

import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { useState, useEffect } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Feather from "@expo/vector-icons/Feather"
import { useAuth } from "../../../context/AuthContext"
import axios from "axios"
import { API_URL } from "../../../config/apiConfig"

const DeliveryPartnerOverviewScreen = ({ route }) => {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [isOnline, setIsOnline] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery-partner/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setStats(response.data.data)
        setIsOnline(response.data.data.isOnline)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline

      const response = await axios.put(
        `${API_URL}/api/delivery-partner/toggle-online-status`,
        {
          is_online: newStatus,
          current_location_lat: null, // You can implement location tracking here
          current_location_lng: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setIsOnline(newStatus)
        Alert.alert("Status Updated", `You are now ${newStatus ? "online" : "offline"}`)
      }
    } catch (error) {
      console.error("Error toggling online status:", error)
      Alert.alert("Error", "Failed to update online status")
    }
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <Text className="text-gray-500">Loading overview...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4">
        {/* Online Status Toggle */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <View className="flex flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold">Online Status</Text>
              <Text className="text-sm text-gray-600">
                {isOnline ? "You're online and available for deliveries" : "You're offline"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className={`px-4 py-2 rounded-lg ${isOnline ? "bg-red-500" : "bg-green-500"}`}
            >
              <Text className="font-semibold text-white">{isOnline ? "Go Offline" : "Go Online"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex flex-row flex-wrap gap-4 mb-6">
          {/* Total Deliveries */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <Feather name="truck" size={24} color="#16a34a" />
              <Text className="text-2xl font-bold text-gray-900">{stats?.totalDeliveries || 0}</Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">Total Deliveries</Text>
          </View>

          {/* Monthly Deliveries */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <MaterialIcons name="calendar-today" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-900">{stats?.monthlyDeliveries || 0}</Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">This Month</Text>
          </View>

          {/* Total Earnings */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <MaterialIcons name="attach-money" size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-900">₱{stats?.totalEarnings?.toFixed(2) || "0.00"}</Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">Total Earnings</Text>
          </View>

          {/* Monthly Earnings */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <MaterialIcons name="trending-up" size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-gray-900">₱{stats?.monthlyEarnings?.toFixed(2) || "0.00"}</Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">This Month</Text>
          </View>
        </View>

        {/* Rating Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <View className="flex flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold">Your Rating</Text>
              <Text className="text-sm text-gray-600">Based on customer feedback</Text>
            </View>
            <View className="flex flex-row items-center">
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text className="ml-1 text-2xl font-bold text-gray-900">{stats?.rating?.toFixed(1) || "5.0"}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="mb-4 text-lg font-semibold">Quick Actions</Text>

          <TouchableOpacity className="flex flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg">
            <View className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
              <MaterialIcons name="assignment" size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">View Available Orders</Text>
              <Text className="text-sm text-gray-600">Check orders ready for pickup</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg">
            <View className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
              <MaterialIcons name="history" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">Delivery History</Text>
              <Text className="text-sm text-gray-600">View past deliveries</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center p-3 border border-gray-200 rounded-lg">
            <View className="flex items-center justify-center w-10 h-10 mr-3 bg-purple-100 rounded-lg">
              <MaterialIcons name="person" size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">Update Profile</Text>
              <Text className="text-sm text-gray-600">Manage your account settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default DeliveryPartnerOverviewScreen
