"use client"

import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useEffect } from "react"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useAuth } from "../../../context/AuthContext"
import axios from "axios"
import { API_URL } from "../../../config/apiConfig"

const DeliveryPartnerHistoryScreen = () => {
  const { token } = useAuth()
  const [deliveryHistory, setDeliveryHistory] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("all")

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "rider_assigned", label: "Assigned" },
  ]

  useEffect(() => {
    fetchDeliveryHistory()
  }, [selectedStatus])

  const fetchDeliveryHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery-partner/delivery-history`, {
        params: {
          status: selectedStatus,
          page: 1,
          limit: 20,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setDeliveryHistory(response.data.data.deliveries)
      }
    } catch (error) {
      console.error("Error fetching delivery history:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchDeliveryHistory()
    setRefreshing(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rider_assigned":
        return "bg-blue-100 text-blue-800"
      case "picked_up":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderDeliveryCard = (delivery) => (
    <View key={delivery.assignment_id} className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <View className="flex flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900">{delivery.order_number}</Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(delivery.status)}`}>
          <Text className="text-sm font-medium capitalize">{delivery.status.replace("_", " ")}</Text>
        </View>
      </View>

      {/* Delivery Details */}
      <View className="mb-3">
        <View className="flex flex-row items-center justify-between mb-2">
          <View className="flex flex-row items-center">
            <MaterialIcons name="shopping-bag" size={16} color="#6b7280" />
            <Text className="ml-2 text-sm text-gray-600">
              {delivery.item_count} item{delivery.item_count !== 1 ? "s" : ""}
            </Text>
          </View>
          <Text className="text-sm font-medium text-gray-900">
            ₱{Number.parseFloat(delivery.delivery_fee).toFixed(2)}
          </Text>
        </View>

        <View className="flex flex-row items-start mb-2">
          <MaterialIcons name="location-on" size={16} color="#16a34a" />
          <View className="flex-1 ml-2">
            <Text className="text-sm text-gray-600">
              {delivery.delivery_street_address}, {delivery.delivery_barangay}, {delivery.delivery_city}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center">
          <MaterialIcons name="person" size={16} color="#6b7280" />
          <Text className="ml-2 text-sm text-gray-600">{delivery.delivery_recipient_name}</Text>
        </View>
      </View>

      {/* Timestamps */}
      <View className="pt-3 border-t border-gray-100">
        {delivery.assigned_at && (
          <Text className="text-xs text-gray-500">Assigned: {formatDate(delivery.assigned_at)}</Text>
        )}
        {delivery.pickup_time && (
          <Text className="text-xs text-gray-500">Picked up: {formatDate(delivery.pickup_time)}</Text>
        )}
        {delivery.delivery_time && (
          <Text className="text-xs text-gray-500">Delivered: {formatDate(delivery.delivery_time)}</Text>
        )}
      </View>
    </View>
  )

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <Text className="text-gray-500">Loading delivery history...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Status Filter */}
      <View className="p-4 bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex flex-row gap-2">
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-full border ${
                  selectedStatus === option.value ? "bg-green-600 border-green-600" : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${selectedStatus === option.value ? "text-white" : "text-gray-700"}`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="p-4">
          {deliveryHistory.length > 0 ? (
            deliveryHistory.map(renderDeliveryCard)
          ) : (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="history" size={64} color="#d1d5db" />
              <Text className="mt-4 text-lg font-medium text-gray-500">No Delivery History</Text>
              <Text className="mt-2 text-sm text-center text-gray-400">
                Your completed deliveries will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default DeliveryPartnerHistoryScreen
