"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.data.order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready_for_pickup: "bg-indigo-100 text-indigo-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return statusMap[status] || status;
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelOrder = () => {
    return order && ["pending", "confirmed"].includes(order.status);
  };

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: cancelOrder },
    ]);
  };

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/orders/${orderId}/cancel`
      );
      if (response.data.success) {
        Alert.alert("Success", "Order cancelled successfully");
        fetchOrderDetails(); // Refresh order details
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      Alert.alert("Error", "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Order Details</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="mt-4 text-gray-600">Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Order Details</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <Text className="text-gray-600">Order not found</Text>
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
          <Text className="ml-4 text-xl font-semibold">Order Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Order Status */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Order #{order.order_number}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
            >
              <Text className="text-sm font-medium">
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Order Date</Text>
              <Text className="text-gray-900">
                {formatDate(order.created_at)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Payment Method</Text>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="cash" size={16} color="#059669" />
                <Text className="ml-1 text-gray-900">Cash on Delivery</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Payment Status</Text>
              <Text className="text-gray-900 capitalize">
                {order.payment_status.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Store Information - Display once since order is per store */}
        {order.items && order.items.length > 0 && (
          <View className="p-4 mb-4 bg-white rounded-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Store Information
            </Text>
            <View className="flex-row items-center">
              {order.items[0].store_logo_key ? (
                <Image
                  source={{ uri: order.items[0].store_logo_key }}
                  className="w-12 h-12 mr-3 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-200 rounded-full">
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={20}
                    color="#6B7280"
                  />
                </View>
              )}
              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  {order.items[0].store_name}
                </Text>
                <Text className="text-sm text-gray-600">
                  Seller ID: {order.items[0].seller_seller_id}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Items
          </Text>

          {order.items?.map((item, index) => (
            <View
              key={index}
              className="flex-row pb-4 mb-4 border-b border-gray-200 last:border-b-0 last:mb-0"
            >
              <View className="mr-4">
                {item.image_keys ? (
                  <Image
                    source={{ uri: item.image_keys }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                    <Feather name="image" size={20} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {formatUnitType(item.unit_type)}
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm text-gray-600">
                    Qty: {item.quantity} × ₱
                    {Number.parseFloat(item.unit_price).toFixed(2)}
                  </Text>
                  <Text className="font-medium text-orange-600">
                    ₱{Number.parseFloat(item.total_price).toFixed(2)}
                  </Text>
                </View>

                {/* Item Status */}
                <View className="mt-2">
                  <View
                    className={`self-start px-2 py-1 rounded-full ${getStatusColor(item.item_status)}`}
                  >
                    <Text className="text-xs font-medium">
                      {getStatusText(item.item_status)}
                    </Text>
                  </View>
                </View>

                {/* Preparation Options */}
                {item.preparation_options &&
                  Object.keys(item.preparation_options).length !== 0 &&
                  Object.keys(JSON.parse(item.preparation_options)).some(
                    (key) => JSON.parse(item.preparation_options)[key]
                  ) && (
                    <View className="mt-2">
                      <Text className="text-xs text-gray-500">
                        Preparation:{" "}
                        {Object.entries(JSON.parse(item.preparation_options))
                          .filter(([key, value]) => value)
                          .map(
                            ([key]) =>
                              key.charAt(0).toUpperCase() + key.slice(1)
                          )
                          .join(", ")}
                      </Text>
                    </View>
                  )}

                {/* Seller Notes */}
                {item.seller_notes && (
                  <View className="mt-2">
                    <Text className="text-xs text-gray-500">
                      Note: {item.seller_notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Delivery Address
          </Text>

          <View className="space-y-1">
            <Text className="font-medium text-gray-900">
              {order.delivery_recipient_name}
            </Text>
            <Text className="text-gray-600">{order.delivery_phone_number}</Text>
            <Text className="text-gray-700">
              {order.delivery_street_address}, {order.delivery_barangay}
            </Text>
            <Text className="text-gray-700">
              {order.delivery_city}, {order.delivery_province}{" "}
              {order.delivery_postal_code}
            </Text>
            {order.delivery_landmark && (
              <Text className="text-sm text-gray-500">
                Landmark: {order.delivery_landmark}
              </Text>
            )}
            {order.delivery_notes && (
              <Text className="text-sm text-gray-500">
                Notes: {order.delivery_notes}
              </Text>
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Summary
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">
                ₱{Number.parseFloat(order.subtotal).toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900">
                ₱{Number.parseFloat(order.delivery_fee).toFixed(2)}
              </Text>
            </View>

            {order.voucher_discount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-green-600">Voucher Discount</Text>
                <Text className="text-green-600">
                  -₱{Number.parseFloat(order.voucher_discount).toFixed(2)}
                </Text>
              </View>
            )}

            <View className="pt-2 border-t border-gray-200">
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold text-gray-900">
                  Total
                </Text>
                <Text className="text-lg font-semibold text-orange-600">
                  ₱{Number.parseFloat(order.total_amount).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <View className="p-4 bg-white rounded-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Order Timeline
            </Text>

            {order.statusHistory.map((history, index) => (
              <View key={index} className="flex-row items-start mb-3 last:mb-0">
                <View className="items-center justify-center w-3 h-3 mt-1 mr-3 bg-orange-600 rounded-full" />
                <View className="flex-1">
                  <Text className="font-medium text-gray-900 capitalize">
                    {history.status.replace("_", " ")}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {formatDate(history.created_at)}
                  </Text>
                  {history.notes && (
                    <Text className="text-sm text-gray-500">
                      {history.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {canCancelOrder() && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="items-center p-4 border border-red-600 rounded-lg"
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text className="font-semibold text-red-600">Cancel Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrderDetailsScreen;
