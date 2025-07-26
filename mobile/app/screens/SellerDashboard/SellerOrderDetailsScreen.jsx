"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import axios from "axios";
import DefaultLoadingAnimation from "../../components/DefaultLoadingAnimation";
import OrderTrackingView from "../../components/OrderTrackingView";
import LottieView from "lottie-react-native";

const SellerOrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [riderAccepted, setRiderAccepted] = useState(false);
  const [lookingForRider, setLookingForRider] = useState(false);

  // Dummy rider data
  const dummyRider = {
    id: 1,
    name: "Juan Dela Cruz",
    phone: "+639123456789",
    vehicle_type: "motorcycle",
    license_plate: "ABC-1234",
    rating: 4.8,
    profile_picture: null,
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#F59E0B" },
    { value: "confirmed", label: "Confirmed", color: "#3B82F6" },
    { value: "preparing", label: "Preparing", color: "#8B5CF6" },
    { value: "ready_for_pickup", label: "Ready for Pickup", color: "#10B981" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "#06B6D4" },
    { value: "delivered", label: "Delivered", color: "#059669" },
    { value: "cancelled", label: "Cancelled", color: "#EF4444" },
  ];

  const quickActions = {
    pending: [
      {
        value: "confirmed",
        label: "Accept Order",
        color: "#10B981",
        icon: "check-circle",
        description: "Accept and confirm this order",
      },
      {
        value: "cancelled",
        label: "Decline Order",
        color: "#EF4444",
        icon: "x-circle",
        description: "Decline this order",
      },
    ],
    confirmed: [
      {
        value: "preparing",
        label: "Start Preparing",
        color: "#8B5CF6",
        icon: "clock",
        description: "Begin preparing the order items",
      },
    ],
    preparing: [
      {
        value: "ready_for_pickup",
        label: "Mark Ready",
        color: "#10B981",
        icon: "package",
        description: "Order is ready for pickup by delivery partner",
      },
    ],
    // Removed ready_for_pickup and out_for_delivery actions as requested
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    // Simulate rider acceptance process
    if (order && order.status === "ready_for_pickup") {
      setLookingForRider(true);

      // Simulate rider accepting after 3 seconds
      const timer = setTimeout(() => {
        setRiderAccepted(true);
        setLookingForRider(false);
        setShowTracking(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else if (order && order.status === "out_for_delivery") {
      setRiderAccepted(true);
      setShowTracking(true);
    } else if (order && order.status === "delivered") {
      setRiderAccepted(true);
      setShowTracking(true);
    } else {
      setShowTracking(false);
      setRiderAccepted(false);
      setLookingForRider(false);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/seller/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrder(response.data.data.order);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to fetch order details"
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching order details:", error.response.data);
      Alert.alert("Error", "Failed to fetch order details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus, actionData) => {
    setUpdatingStatus(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/seller/orders/${orderId}/status`,
        {
          status: newStatus,
          notes: actionData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Success",
          `Order ${actionData.label.toLowerCase()} successfully`
        );
        fetchOrderDetails();
        setStatusModalVisible(false);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update order status"
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.color : "#6B7280";
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.label : status;
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

  const formatCurrency = (amount) => {
    return `₱${Number.parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Order Details</Text>
        </View>
        <View className="items-center justify-center flex-1">
          <DefaultLoadingAnimation />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Order Details</Text>
        </View>
        <View className="items-center justify-center flex-1">
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text className="mt-4 text-lg font-medium">Order Not Found</Text>
        </View>
      </View>
    );
  }

  // Show tracking view for accepted riders or delivered orders
  if (showTracking && riderAccepted) {
    return (
      <OrderTrackingView
        order={{ ...order, rider: dummyRider }}
        navigation={navigation}
        onStatusUpdate={handleStatusUpdate}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-semibold">Order Details</Text>
          <Text className="text-sm text-gray-600">{order.order_number}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: getStatusColor(order.status) }}
          >
            {getStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Looking for Rider UI */}
        {lookingForRider && order.status === "ready_for_pickup" && (
          <View className="mx-4 mt-4 border border-blue-200 rounded-lg bg-blue-50">
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <View className="mr-2">
                  <LottieView
                    source={require("../../assets/animations/loading/loading-animation-2-2differentcolors.json")}
                    autoPlay
                    loop
                    style={{ width: 60, height: 30 }}
                  />
                </View>
                <Text className="text-lg font-semibold text-blue-800">
                  Looking for Delivery Partner
                </Text>
              </View>
              <Text className="text-blue-700">
                We're finding the best delivery partner to pick up your order.
                This usually takes 2-5 minutes.
              </Text>
              <View className="flex-row items-center mt-2">
                <Feather name="clock" size={14} color="#06B6D4" />
                <Text className="ml-1 text-sm text-blue-600">
                  Estimated wait time: 2-5 minutes
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Status Progress */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-4 text-lg font-semibold">Order Progress</Text>
            <View className="space-y-3">
              {[
                { status: "pending", label: "Order Received", icon: "inbox" },
                {
                  status: "confirmed",
                  label: "Order Confirmed",
                  icon: "check-circle",
                },
                {
                  status: "preparing",
                  label: "Preparing Items",
                  icon: "clock",
                },
                {
                  status: "ready_for_pickup",
                  label: "Ready for Pickup",
                  icon: "package",
                },
                {
                  status: "out_for_delivery",
                  label: "Out for Delivery",
                  icon: "truck",
                },
                { status: "delivered", label: "Delivered", icon: "check" },
              ].map((step, index) => {
                const isCompleted =
                  statusOptions.findIndex((s) => s.value === order.status) >=
                  statusOptions.findIndex((s) => s.value === step.status);
                const isCurrent = order.status === step.status;

                return (
                  <View key={step.status} className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isCompleted
                          ? "bg-green-500"
                          : isCurrent
                            ? "bg-orange-500"
                            : "bg-gray-200"
                      }`}
                    >
                      <Feather
                        name={step.icon}
                        size={16}
                        color={isCompleted || isCurrent ? "white" : "#6B7280"}
                      />
                    </View>
                    <Text
                      className={`ml-3 ${
                        isCompleted
                          ? "text-green-600 font-medium"
                          : isCurrent
                            ? "text-orange-600 font-medium"
                            : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Order Info */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">
              Order Information
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Order Date:</Text>
                <Text className="font-medium">
                  {formatDate(order.created_at)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Method:</Text>
                <Text className="font-medium capitalize">
                  {order.payment_method.replace(/_/g, " ")}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Status:</Text>
                <Text className="font-medium capitalize">
                  {order.payment_status}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Amount:</Text>
                <Text className="text-lg font-semibold text-orange-600">
                  {formatCurrency(order.seller_total_amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">
              Customer Information
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Name:</Text>
                <Text className="font-medium">
                  {order.customer_first_name} {order.customer_last_name}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Email:</Text>
                <Text className="font-medium">{order.customer_email}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Phone:</Text>
                <Text className="font-medium">{order.customer_phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Delivery Address</Text>
            <View className="p-3 rounded-lg bg-gray-50">
              <Text className="font-medium">
                {order.delivery_recipient_name}
              </Text>
              <Text className="text-gray-600">
                {order.delivery_phone_number}
              </Text>
              <Text className="mt-2 text-gray-600">
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
              {order.delivery_notes && (
                <Text className="mt-1 text-gray-600">
                  Notes: {order.delivery_notes}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Order Items</Text>
            {order.items.map((item, index) => (
              <View
                key={item.id}
                className="flex-row items-center p-3 mb-4 rounded-lg bg-gray-50"
              >
                <View className="w-16 h-16 mr-4 bg-gray-200 rounded-lg">
                  {item.image_keys && (
                    <Image
                      source={{ uri: item.image_keys }}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-medium">
                    {item.product_name}
                  </Text>
                  <Text className="text-gray-600">
                    Quantity: {item.quantity}
                  </Text>
                  <Text className="text-sm text-gray-500 capitalize">
                    {item.unit_type.replace("_", " ")} •{" "}
                    {formatCurrency(item.unit_price)} each
                  </Text>
                </View>
                <Text className="text-lg font-semibold">
                  {formatCurrency(item.total_price)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons - Hidden for ready_for_pickup and out_for_delivery */}
        {quickActions[order.status] && (
          <View className="mx-4 mt-4 mb-8">
            {quickActions[order.status].map((action, index) => (
              <TouchableOpacity
                key={action.value}
                onPress={() => setStatusModalVisible(true)}
                className={`py-4 rounded-lg mb-3 flex-row items-center justify-center ${
                  index === 0 ? "bg-orange-500" : "bg-gray-200"
                }`}
              >
                <Feather
                  name={action.icon}
                  size={20}
                  color={index === 0 ? "white" : "#6B7280"}
                />
                <Text
                  className={`ml-2 text-lg font-semibold ${index === 0 ? "text-white" : "text-gray-700"}`}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View
          className="justify-end flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="p-6 bg-white rounded-t-3xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold">Update Order Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-3 mb-4 rounded-lg bg-gray-50">
              <Text className="font-medium text-gray-900">
                {order.order_number}
              </Text>
              <Text className="text-sm text-gray-600">
                Current Status: {getStatusLabel(order.status)}
              </Text>
            </View>

            {quickActions[order.status]?.map((action) => (
              <TouchableOpacity
                key={action.value}
                onPress={() => handleStatusUpdate(action.value, action)}
                disabled={updatingStatus}
                className="flex-row items-center p-4 mb-3 border border-gray-200 rounded-lg"
                style={{
                  backgroundColor: updatingStatus ? "#F3F4F6" : "white",
                }}
              >
                <View
                  className="items-center justify-center w-10 h-10 mr-4 rounded-full"
                  style={{ backgroundColor: `${action.color}20` }}
                >
                  <Feather name={action.icon} size={20} color={action.color} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-medium ${updatingStatus ? "text-gray-400" : "text-gray-900"}`}
                  >
                    {action.label}
                  </Text>
                  <Text
                    className={`text-sm ${updatingStatus ? "text-gray-300" : "text-gray-500"}`}
                  >
                    {action.description}
                  </Text>
                </View>
                {updatingStatus && <DefaultLoadingAnimation size="small" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SellerOrderDetailsScreen;
