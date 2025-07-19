"use client"

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useState, useEffect } from "react"
import Feather from "@expo/vector-icons/Feather"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import axios from "axios"
import { API_URL } from "../../config/apiConfig"
import { useAuth } from "../../context/AuthContext"

const SellerOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, user } = useAuth()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Using a generic endpoint that might exist for seller orders
      const response = await axios.get(`${API_URL}/api/seller/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          seller_id: user.id,
        },
      })

      if (response.data.success) {
        setOrders(response.data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      // For now, we'll set empty array if endpoint doesn't exist
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "confirmed":
        return "text-blue-600 bg-blue-100"
      case "shipped":
        return "text-purple-600 bg-purple-100"
      case "delivered":
        return "text-green-600 bg-green-100"
      case "cancelled":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const handleUpdateOrderStatus = (orderId, currentStatus) => {
    const statusOptions = ["pending", "confirmed", "shipped", "delivered"]
    const currentIndex = statusOptions.indexOf(currentStatus?.toLowerCase())
    const nextStatus = statusOptions[currentIndex + 1]

    if (nextStatus) {
      Alert.alert("Update Order Status", `Change status to ${nextStatus}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Update", onPress: () => updateOrderStatus(orderId, nextStatus) },
      ])
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/seller/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      Alert.alert("Success", "Order status updated successfully")
    } catch (error) {
      console.error("Error updating order status:", error)
      Alert.alert("Error", "Failed to update order status")
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Orders</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading orders...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-semibold">Orders</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {orders.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10 bg-white border border-gray-200 rounded-lg">
            <Feather name="inbox" size={48} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium">No Orders Yet</Text>
            <Text className="mt-1 text-gray-500 text-center px-4">
              Orders from customers will appear here once you start selling.
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {orders.map((order) => (
              <View key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <View className="p-4">
                  {/* Order Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-semibold">Order #{order.id}</Text>
                    <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      <Text className={`text-xs font-medium capitalize ${getStatusColor(order.status).split(" ")[0]}`}>
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  {/* Customer Info */}
                  <View className="flex-row items-center mb-3">
                    <MaterialIcons name="person" size={16} color="#6b7280" />
                    <Text className="ml-2 text-gray-600">{order.customer_name || "Customer"}</Text>
                  </View>

                  {/* Order Items */}
                  <View className="mb-3">
                    <Text className="text-sm font-medium mb-2">Items:</Text>
                    {order.items?.map((item, index) => (
                      <View key={index} className="flex-row justify-between items-center py-1">
                        <Text className="text-sm text-gray-600">
                          {item.product_name} x{item.quantity}
                        </Text>
                        <Text className="text-sm font-medium">
                          ₱{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    )) || <Text className="text-sm text-gray-500">No items details available</Text>}
                  </View>

                  {/* Order Total */}
                  <View className="flex-row justify-between items-center mb-3 pt-2 border-t border-gray-100">
                    <Text className="text-lg font-semibold">Total:</Text>
                    <Text className="text-lg font-bold text-green-600">
                      ₱{Number.parseFloat(order.total_amount || 0).toFixed(2)}
                    </Text>
                  </View>

                  {/* Order Date */}
                  <View className="flex-row items-center mb-3">
                    <Feather name="calendar" size={16} color="#6b7280" />
                    <Text className="ml-2 text-sm text-gray-600">
                      {new Date(order.created_at || Date.now()).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row space-x-2">
                    <TouchableOpacity className="flex-1 py-2 bg-blue-100 rounded-lg">
                      <Text className="text-center text-blue-600 font-medium">View Details</Text>
                    </TouchableOpacity>
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <TouchableOpacity
                        className="flex-1 py-2 bg-green-100 rounded-lg"
                        onPress={() => handleUpdateOrderStatus(order.id, order.status)}
                      >
                        <Text className="text-center text-green-600 font-medium">Update Status</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default SellerOrdersScreen
