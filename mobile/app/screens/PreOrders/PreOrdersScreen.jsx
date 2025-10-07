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
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const PreOrdersScreen = () => {
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
    { key: "all", label: "All Pre-Orders" },
    { key: "pending_availability", label: "Pending" },
    { key: "available", label: "Available" },
    { key: "ready_for_final_payment", label: "Ready to Pay" },
    { key: "completed", label: "Completed" },
  ];

  const fetchPreOrders = async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/preorders`, {
        params: { status: selectedStatus, limit: 20 },
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error("Error fetching pre-orders:", error.response?.data);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const showLoading = firstLoadRef.current;
      firstLoadRef.current = false;
      fetchPreOrders(showLoading);
    }, [user, selectedStatus])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPreOrders(false);
  };

  const getPreOrderStatusColor = (status) => {
    const colors = {
      pending_availability: "bg-yellow-100 text-yellow-800",
      available: "bg-green-100 text-green-800",
      ready_for_final_payment: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPreOrderStatusLabel = (status) => {
    const labels = {
      pending_availability: "Pending Availability",
      available: "Available",
      ready_for_final_payment: "Ready for Payment",
      completed: "Completed",
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

  const formatUnitType = (unitType) => {
    const unitMap = {
      per_kilo: "Per Kilo",
      per_250g: "Per 250g",
      per_500g: "Per 500g",
      per_piece: "Per Piece",
      per_bundle: "Per Bundle",
      per_pack: "Per Pack",
      per_liter: "Per Liter",
      per_dozen: "Per Dozen",
    };
    return unitMap[unitType] || unitType;
  };

  const renderPreOrderCard = (order) => (
    <TouchableOpacity
      key={order.id}
      className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm"
      onPress={() => navigation.navigate("OrderDetails", { orderId: order.id })}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          {order.order_number}
        </Text>
        <View
          className={`px-2 py-1 rounded-full ${getPreOrderStatusColor(order.order_status)}`}
        >
          <Text className="text-sm font-medium text-gray-900">
            {order.order_status.charAt(0).toUpperCase() +
              order.order_status.slice(1).replace(/_/g, " ")}
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
        <Text className="text-sm text-gray-600">{order.store_name}</Text>
      </View>

      {/* Pre-order Items */}
      {order.items.map((item, index) => (
        <View
          key={index}
          className="flex-row items-center p-2 mb-3 rounded-md bg-white"
        >
          {item.product_image_url ? (
            <Image
              source={{ uri: item.product_image_url }}
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
              {item.product_name}
            </Text>
            <Text className="text-xs text-gray-500">
              {item.quantity} x ₱{Number.parseFloat(item.unit_price).toFixed(2)}{" "}
              ({formatUnitType(item.unit_type)})
            </Text>
            <View className="flex-row items-center justify-between mt-1">
              <View
                className={`px-2 py-1 rounded-full ${getPreOrderStatusColor(item.preorder_status)}`}
              >
                <Text className="text-xs font-medium">
                  {getPreOrderStatusLabel(item.preorder_status)}
                </Text>
              </View>
              <Text className="text-sm font-medium text-orange-600">
                ₱{Number.parseFloat(item.total_price).toFixed(2)}
              </Text>
            </View>
            {item.expected_availability_date && (
              <Text className="text-xs text-secondary mt-1">
                Expected:{" "}
                {new Date(item.expected_availability_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      ))}

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-gray-600">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
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
          <Feather name="clock" size={14} color="#2563EB" />
          <Text className="ml-1 text-xs text-gray-500">Pre-Order</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 pt-16 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="mr-6 text-xl font-semibold">My Pre-Orders</Text>
          <View></View>
        </View>

        <View className="items-center justify-center flex-1 px-6">
          <Feather name="clock" size={80} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Login Required
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Please login to view your pre-orders
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
        <View className="flex-row items-center justify-between p-4 pt-16 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="mr-6 text-xl font-semibold">My Pre-Orders</Text>
          <View></View>
        </View>

        <View className="items-center justify-center flex-1">
          <Text className="mt-4 text-gray-600">Loading pre-orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-16 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="mr-6 text-xl font-semibold">My Pre-Orders</Text>
        <View></View>
      </View>

      {/* Status Filter */}
      <View className="p-4 bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                className={`px-4 py-2 rounded-full ${selectedStatus === option.key ? "bg-primary" : "bg-gray-200"}`}
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
          orders.map(renderPreOrderCard)
        ) : (
          <View className="items-center justify-center px-6 flex-1 h-[70vh]">
            <Feather name="clock" size={80} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              No pre-orders found
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              {selectedStatus === "all"
                ? "You haven't placed any pre-orders yet"
                : `No ${selectedStatus.replace(/_/g, " ")} pre-orders found`}
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

export default PreOrdersScreen;
