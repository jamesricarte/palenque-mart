"use client"

import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { useState, useEffect } from "react"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useAuth } from "../../../context/AuthContext"
import axios from "axios"
import { API_URL } from "../../../config/apiConfig"

const DeliveryPartnerOrdersScreen = () => {
  const { token } = useAuth()
  const [availableOrders, setAvailableOrders] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableOrders()
  }, [])

  const fetchAvailableOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery-partner/available-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setAvailableOrders(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching available orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchAvailableOrders()
    setRefreshing(false)
  }

  const handleAcceptOrder = (orderId) => {
    Alert.alert("Accept Order", "Are you sure you want to accept this delivery order?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Accept",
        onPress: () => {
          // TODO: Implement order acceptance logic
          Alert.alert("Coming Soon", "Order acceptance feature will be implemented soon.")
        },
      },
    ])
  }

  const renderOrderCard = (order) => (
    <View key={order.assignment_id} className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Order Header */}
      <View className="flex flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900">{order.order_number}</Text>
        <View className="px-3 py-1 bg-green-100 rounded-full">
          <Text className="text-sm font-medium text-green-800">
            ₱{Number.parseFloat(order.delivery_fee).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Order Details */}
      <View className="mb-3">
        <View className="flex flex-row items-center mb-2">
          <MaterialIcons name="shopping-bag" size={16} color="#6b7280" />
          <Text className="ml-2 text-sm text-gray-600">
            {order.item_count} item{order.item_count !== 1 ? "s" : ""} • ₱
            {Number.parseFloat(order.total_amount).toFixed(2)}
          </Text>
        </View>

        <View className="flex flex-row items-start mb-2">
          <MaterialIcons name="location-on" size={16} color="#ef4444" />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-medium text-gray-900">Pickup</Text>
            <Text className="text-sm text-gray-600">{order.pickup_address || "Pickup address not specified"}</Text>
          </View>
        </View>

        <View className="flex flex-row items-start mb-2">
          <MaterialIcons name="location-on" size={16} color="#16a34a" />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-medium text-gray-900">Delivery</Text>
            <Text className="text-sm text-gray-600">
              {order.delivery_street_address}, {order.delivery_barangay}, {order.delivery_city}
            </Text>
            {order.delivery_landmark && (
              <Text className="text-xs text-gray-500">Landmark: {order.delivery_landmark}</Text>
            )}
          </View>
        </View>

        <View className="flex flex-row items-center">
          <MaterialIcons name="person" size={16} color="#6b7280" />
          <Text className="ml-2 text-sm text-gray-600">
            {order.delivery_recipient_name} • {order.delivery_phone_number}
          </Text>
        </View>
      </View>

      {/* Special Instructions */}
      {order.special_instructions && (
        <View className="p-3 mb-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text className="text-sm font-medium text-yellow-800">Special Instructions:</Text>
          <Text className="text-sm text-yellow-700">{order.special_instructions}</Text>
        </View>
      )}

      {/* Delivery Notes */}
      {order.delivery_notes && (
        <View className="p-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="text-sm font-medium text-blue-800">Delivery Notes:</Text>
          <Text className="text-sm text-blue-700">{order.delivery_notes}</Text>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        onPress={() => handleAcceptOrder(order.order_id)}
        className="w-full py-3 bg-green-600 rounded-lg"
      >
        <Text className="font-semibold text-center text-white">Accept Order</Text>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <Text className="text-gray-500">Loading available orders...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-gray-900">Available Orders</Text>
          <Text className="text-sm text-gray-600">
            {availableOrders.length} order{availableOrders.length !== 1 ? "s" : ""} ready for pickup
          </Text>
        </View>

        {/* Orders List */}
        {availableOrders.length > 0 ? (
          availableOrders.map(renderOrderCard)
        ) : (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="inbox" size={64} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium text-gray-500">No Available Orders</Text>
            <Text className="mt-2 text-sm text-center text-gray-400">
              There are no orders ready for pickup at the moment.{"\n"}
              Pull down to refresh.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default DeliveryPartnerOrdersScreen
