import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

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

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return labels[status] || status;
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
          <PersonalizedLoadingAnimation />
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
          <Feather name="alert-circle" size={64} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Order not found
          </Text>
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
              {order.order_number}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
            >
              <Text className="text-sm font-medium">
                {getStatusLabel(order.status)}
              </Text>
            </View>
          </View>

          <Text className="text-sm text-gray-600">
            Placed on {formatDate(order.created_at)}
          </Text>

          {order.delivered_at && (
            <Text className="text-sm text-green-600">
              Delivered on {formatDate(order.delivered_at)}
            </Text>
          )}
        </View>

        {/* Order Items */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Items
          </Text>

          {order.items.map((item, index) => (
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
                  {item.product_name}
                </Text>

                <View className="flex-row items-center mt-1">
                  {item.store_logo_key ? (
                    <Image
                      source={{ uri: item.store_logo_key }}
                      className="w-4 h-4 mr-2 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={16}
                      color="#6B7280"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-sm text-gray-600">
                    {item.store_name}
                  </Text>
                </View>

                <Text className="text-sm text-gray-500">
                  {formatUnitType(item.unit_type)}
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm text-gray-600">
                    ₱{parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
                  </Text>
                  <Text className="font-medium text-orange-600">
                    ₱{parseFloat(item.total_price).toFixed(2)}
                  </Text>
                </View>

                {item.preparation_options && (
                  <View className="mt-2">
                    <Text className="text-xs text-gray-500">Preparation:</Text>

                    <View className="flex-row flex-wrap mt-1">
                      {Object.entries(
                        typeof item.preparation_options === "string"
                          ? JSON.parse(item.preparation_options)
                          : item.preparation_options
                      ).map(
                        ([option, selected]) =>
                          selected && (
                            <View
                              key={option}
                              className="px-2 py-1 mb-1 mr-1 bg-blue-100 rounded-full"
                            >
                              <Text className="text-xs text-blue-800 capitalize">
                                {option.replace("_", " ")}
                              </Text>
                            </View>
                          )
                      )}
                    </View>
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

          <View>
            <Text className="text-base font-medium text-gray-900">
              {order.recipient_name}
            </Text>
            <Text className="text-gray-600">{order.phone_number}</Text>
            <Text className="mt-1 text-gray-700">
              {order.street_address}, {order.barangay}
            </Text>
            <Text className="text-gray-700">
              {order.city}, {order.province} {order.postal_code}
            </Text>
            {order.landmark && (
              <Text className="text-sm text-gray-500">
                Landmark: {order.landmark}
              </Text>
            )}
          </View>

          {order.delivery_notes && (
            <View className="p-3 mt-3 rounded-lg bg-gray-50">
              <Text className="text-sm font-medium text-gray-700">
                Delivery Notes:
              </Text>
              <Text className="text-sm text-gray-600">
                {order.delivery_notes}
              </Text>
            </View>
          )}
        </View>

        {/* Payment & Summary */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Payment Summary
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">
                ₱{parseFloat(order.subtotal).toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900">
                ₱{parseFloat(order.delivery_fee).toFixed(2)}
              </Text>
            </View>

            {order.voucher_discount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-green-600">
                  Voucher Discount{" "}
                  {order.voucher_code && `(${order.voucher_code})`}
                </Text>
                <Text className="text-green-600">
                  -₱{parseFloat(order.voucher_discount).toFixed(2)}
                </Text>
              </View>
            )}

            <View className="pt-2 border-t border-gray-200">
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold text-gray-900">
                  Total
                </Text>
                <Text className="text-lg font-semibold text-orange-600">
                  ₱{parseFloat(order.total_amount).toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center pt-2">
              <MaterialCommunityIcons name="cash" size={16} color="#059669" />
              <Text className="ml-2 text-sm text-gray-600">
                Cash on Delivery
              </Text>
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
      {(order.status === "pending" || order.status === "confirmed") && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="items-center p-4 border border-red-600 rounded-lg"
            onPress={() => {
              Alert.alert(
                "Cancel Order",
                "Are you sure you want to cancel this order?",
                [
                  { text: "No", style: "cancel" },
                  {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: () => {
                      // TODO: Implement cancel order functionality
                      Alert.alert(
                        "Cancel Order",
                        "This feature will be implemented soon!"
                      );
                    },
                  },
                ]
              );
            }}
          >
            <Text className="font-semibold text-red-600">Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrderDetailsScreen;
