"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

const { width, height } = Dimensions.get("window");

const OrderTrackingView = ({ order, navigation, onStatusUpdate }) => {
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("15-25 min");

  useEffect(() => {
    // Simulate delivery progress
    if (order.status === "out_for_delivery") {
      setDeliveryProgress(0.8); // 80% progress
      setEstimatedTime("10-15 min");
    } else if (order.status === "delivered") {
      setDeliveryProgress(1.0); // 100% progress
      setEstimatedTime("Delivered");
    } else if (order.status === "ready_for_pickup") {
      setDeliveryProgress(0.4); // 40% progress
      setEstimatedTime("Waiting for pickup");
    }
  }, [order.status]);

  const formatCurrency = (amount) => {
    return `₱${Number.parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMarkDelivered = () => {
    if (order.status === "out_for_delivery") {
      Alert.alert(
        "Mark as Delivered",
        "Are you sure this order has been delivered to the customer?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Delivered",
            onPress: () =>
              onStatusUpdate("delivered", {
                label: "Mark Delivered",
                description:
                  "Order has been successfully delivered to customer",
              }),
          },
        ]
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-semibold">Order Tracking</Text>
          <Text className="text-sm text-gray-600">{order.order_number}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${order.status === "delivered" ? "bg-green-100" : "bg-blue-100"}`}
        >
          <Text
            className={`text-sm font-medium ${order.status === "delivered" ? "text-green-800" : "text-blue-800"}`}
          >
            {order.status === "delivered" ? "Delivered" : "In Transit"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Map Placeholder */}
        <View className="mx-4 mt-4 overflow-hidden bg-white rounded-lg shadow-sm">
          <View
            className="items-center justify-center bg-gradient-to-br from-blue-100 to-green-100"
            style={{ height: height * 0.3 }}
          >
            {/* Static Map UI */}
            <View className="absolute top-4 left-4 right-4">
              <View className="p-3 bg-white rounded-lg shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 mr-2 bg-green-500 rounded-full" />
                  <Text className="text-sm font-medium">Pickup Location</Text>
                </View>
                <Text className="ml-5 text-xs text-gray-600">Your Store</Text>
              </View>
            </View>

            <View className="absolute bottom-4 left-4 right-4">
              <View className="p-3 bg-white rounded-lg shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 mr-2 bg-red-500 rounded-full" />
                  <Text className="text-sm font-medium">Delivery Location</Text>
                </View>
                <Text className="ml-5 text-xs text-gray-600">
                  {order.delivery_barangay}, {order.delivery_city}
                </Text>
              </View>
            </View>

            {/* Delivery Vehicle Icon */}
            <View className="p-4 bg-white rounded-full shadow-lg">
              <Feather name="truck" size={32} color="#3B82F6" />
            </View>

            {/* Route Line */}
            <View
              className="absolute w-1 bg-blue-300 opacity-50 top-20 bottom-20 left-1/2"
              style={{ transform: [{ translateX: -2 }] }}
            />
          </View>
        </View>

        {/* Delivery Status */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold">Delivery Status</Text>
              <Text
                className={`text-sm font-medium ${order.status === "delivered" ? "text-green-600" : "text-blue-600"}`}
              >
                {estimatedTime}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="mb-4">
              <View className="h-2 bg-gray-200 rounded-full">
                <View
                  className={`h-2 rounded-full ${order.status === "delivered" ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${deliveryProgress * 100}%` }}
                />
              </View>
            </View>

            {/* Status Steps - Updated with Rider Accepted */}
            <View className="space-y-3">
              {[
                {
                  status: "rider_accepted",
                  label: "Rider Accepted Order",
                  time: formatDate(order.updated_at),
                  completed: true,
                },
                {
                  status: "picked_up",
                  label: "Order Picked Up",
                  time:
                    order.status === "out_for_delivery" ||
                    order.status === "delivered"
                      ? formatDate(order.updated_at)
                      : "Pending",
                  completed:
                    order.status === "out_for_delivery" ||
                    order.status === "delivered",
                },
                {
                  status: "in_transit",
                  label: "On the Way",
                  time:
                    order.status === "out_for_delivery" ||
                    order.status === "delivered"
                      ? "In Progress"
                      : "Pending",
                  completed:
                    order.status === "out_for_delivery" ||
                    order.status === "delivered",
                },
                {
                  status: "delivered",
                  label: "Delivered",
                  time:
                    order.status === "delivered"
                      ? formatDate(order.delivered_at || order.updated_at)
                      : "Pending",
                  completed: order.status === "delivered",
                },
              ].map((step, index) => (
                <View key={step.status} className="flex-row items-center">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      step.completed ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {step.completed ? (
                      <Feather name="check" size={14} color="white" />
                    ) : (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text
                      className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {step.label}
                    </Text>
                    <Text className="text-sm text-gray-500">{step.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Delivery Partner Info - Updated with Rider Details */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Delivery Partner</Text>
            <View className="flex-row items-center">
              <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-300 rounded-full">
                {order.rider?.profile_picture ? (
                  <Image
                    source={{ uri: order.rider.profile_picture }}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="user" size={20} color="#6B7280" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-medium">
                  {order.rider?.name || "Juan Dela Cruz"}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Feather name="star" size={12} color="#F59E0B" />
                  <Text className="ml-1 text-sm text-gray-600">
                    {order.rider?.rating || "4.8"} •{" "}
                    {order.rider?.vehicle_type || "Motorcycle"}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500">
                  {order.rider?.license_plate || "ABC-1234"}
                </Text>
              </View>
              <TouchableOpacity className="px-4 py-2 bg-green-500 rounded-lg">
                <Feather name="phone" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Customer Details</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Name:</Text>
                <Text className="font-medium">
                  {order.customer_first_name} {order.customer_last_name}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Phone:</Text>
                <Text className="font-medium">
                  {order.delivery_phone_number}
                </Text>
              </View>
            </View>

            <View className="p-3 mt-3 rounded-lg bg-gray-50">
              <Text className="mb-1 font-medium text-gray-700">
                Delivery Address:
              </Text>
              <Text className="text-gray-600">
                {order.delivery_street_address}
              </Text>
              <Text className="text-gray-600">
                {order.delivery_barangay}, {order.delivery_city},{" "}
                {order.delivery_province}
              </Text>
              {order.delivery_landmark && (
                <Text className="mt-1 text-gray-600">
                  Landmark: {order.delivery_landmark}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Order Summary</Text>
            {order.items.slice(0, 2).map((item, index) => (
              <View key={item.id} className="flex-row items-center mb-3">
                <View className="w-12 h-12 mr-3 bg-gray-200 rounded-lg">
                  {item.image_keys && (
                    <Image
                      source={{ uri: item.image_keys }}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-medium">{item.product_name}</Text>
                  <Text className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </Text>
                </View>
                <Text className="font-semibold">
                  {formatCurrency(item.total_price)}
                </Text>
              </View>
            ))}

            {order.items.length > 2 && (
              <Text className="mb-3 text-sm text-gray-500">
                +{order.items.length - 2} more items
              </Text>
            )}

            <View className="pt-3 border-t border-gray-200">
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold">Total:</Text>
                <Text className="text-lg font-semibold text-orange-600">
                  {formatCurrency(order.seller_total_amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}

        {/* Delivered Confirmation */}
        {order.status === "delivered" && (
          <View className="mx-4 mt-4 mb-8 border border-green-200 rounded-lg bg-green-50">
            <View className="items-center p-4">
              <View className="items-center justify-center w-16 h-16 mb-3 bg-green-500 rounded-full">
                <Feather name="check" size={32} color="white" />
              </View>
              <Text className="mb-1 text-lg font-semibold text-green-800">
                Order Delivered Successfully!
              </Text>
              <Text className="text-center text-green-700">
                This order has been completed and delivered to the customer.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderTrackingView;
