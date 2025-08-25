"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const OrdersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (route.params?.initialStatus) {
      setSelectedStatus(route.params.initialStatus);
    }
  }, [route.params?.initialStatus]);

  const statusOptions = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "ready_for_pickup", label: "Ready for Pickup" },
    { key: "on_the_way", label: "On the Way" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const fetchOrders = async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        params: { status: selectedStatus, limit: 20 },
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error.response.data);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const showLoading = firstLoadRef.current; // only first time
      firstLoadRef.current = false;
      fetchOrders(showLoading);
    }, [user, selectedStatus])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready_for_pickup: "bg-indigo-100 text-indigo-800",
      rider_assigned: "bg-orange-100 text-orange-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      rider_assigned: "On the Way",
      out_for_delivery: "On the Way",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderCard = (order) => (
    <TouchableOpacity
      key={order.id}
      className="p-4 mb-4 bg-white rounded-lg shadow-sm"
      onPress={() => navigation.navigate("OrderDetails", { orderId: order.id })}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          {order.order_number}
        </Text>
        <View
          className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
        >
          <Text className="text-xs font-medium">
            {getStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        {order.store_logo_url ? (
          <Image
            source={{ uri: order.store_logo_url }}
            className="w-6 h-6 mr-2 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex items-center justify-center w-6 h-6 mr-2 bg-gray-200 rounded-full">
            <MaterialCommunityIcons
              name="storefront-outline"
              size={12}
              color="#6B7280"
            />
          </View>
        )}
        <Text className="text-sm text-gray-600">
          {order.store_names || "Multiple stores"}
        </Text>
      </View>

      {/* First product display with image */}
      {order.first_product_name && (
        <View className="flex-row items-center p-2 mb-3 rounded-md bg-gray-50">
          {order.first_product_image_url ? (
            <Image
              source={{ uri: order.first_product_image_url }}
              className="w-12 h-12 mr-3 rounded-md"
              resizeMode="cover"
            />
          ) : (
            <View className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-200 rounded-md">
              <MaterialCommunityIcons
                name="image-off-outline"
                size={20}
                color="#6B7280"
              />
            </View>
          )}
          <View className="flex-1">
            <Text
              className="text-sm font-medium text-gray-800"
              numberOfLines={1}
            >
              {order.first_product_name}
            </Text>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-xs text-gray-500">
                {order.first_product_quantity} x ₱
                {Number.parseFloat(order.first_product_price).toFixed(2)}
              </Text>
              {order.item_count > 1 && (
                <Text className="text-xs font-medium text-orange-600">
                  +{order.item_count - 1} more
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-gray-600">
          {order.item_count} item{order.item_count !== 1 ? "s" : ""}
        </Text>
        <Text className="text-lg font-semibold text-orange-600">
          ₱{Number.parseFloat(order.total_amount).toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">
          {formatDate(order.created_at)}
        </Text>
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="cash" size={14} color="#059669" />
          <Text className="ml-1 text-xs text-gray-500">Cash on Delivery</Text>
        </View>
      </View>

      {order.status === "delivered" && (
        <View className="flex-row items-center pt-2 mt-2 border-t border-gray-200">
          <Feather name="check-circle" size={14} color="#059669" />
          <Text className="ml-1 text-xs text-green-600">
            Delivered on {formatDate(order.delivered_at)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">My Orders</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1 px-6">
          <Feather name="shopping-bag" size={80} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Login Required
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Please login to view your orders
          </Text>
          <TouchableOpacity
            className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="font-semibold text-white">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">My Orders</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <Text className="mt-4 text-gray-600">Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">My Orders</Text>
        </View>
      </View>
      {/* Status Filter */}
      <View className="p-4 bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                className={`px-4 py-2 rounded-full ${selectedStatus === option.key ? "bg-orange-600" : "bg-gray-200"}`}
                onPress={() => setSelectedStatus(option.key)}
              >
                <Text
                  className={`text-sm font-medium ${selectedStatus === option.key ? "text-white" : "text-gray-700"}`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length > 0 ? (
          orders.map(renderOrderCard)
        ) : (
          <View className="items-center justify-center px-6 flex-1 h-[70vh]">
            <Feather name="shopping-bag" size={80} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              No orders found
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              {selectedStatus === "all"
                ? "You haven't placed any orders yet"
                : `No ${selectedStatus.replace(/_/g, " ")} orders found`}
            </Text>
            <TouchableOpacity
              className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Text className="font-semibold text-white">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;
