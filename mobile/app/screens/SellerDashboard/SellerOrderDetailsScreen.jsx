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
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "../../context/AuthContext";
import { useSeller } from "../../context/SellerContext";
import { API_URL } from "../../config/apiConfig";
import axios from "axios";
import DefaultLoadingAnimation from "../../components/DefaultLoadingAnimation";
import LottieView from "lottie-react-native";
import MapView, { Marker } from "react-native-maps";

const SellerOrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { token } = useAuth();
  const {
    createDeliveryAssignment,
    startTrackingDeliveryPartner,
    stopTrackingDeliveryPartner,
    deliveryPartnerLocation,
    refreshOrdersData,
  } = useSeller();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [fullScreenMapVisible, setFullScreenMapVisible] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("15-25 min");
  const [deliveryPartnerCoordinates, setDeliveryPartnerCoordinates] =
    useState(null);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#F59E0B" },
    { value: "confirmed", label: "Confirmed", color: "#3B82F6" },
    { value: "preparing", label: "Preparing", color: "#8B5CF6" },
    { value: "ready_for_pickup", label: "Ready for Pickup", color: "#10B981" },
    { value: "rider_assigned", label: "Rider Assigned", color: "#06B6D4" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "#06B6D4" },
    { value: "delivered", label: "Delivered", color: "#059669" },
    { value: "cancelled", label: "Cancelled", color: "#EF4444" },
  ];

  const deliveryStatusOptions = [
    {
      value: "looking_for_rider",
      label: "Looking for Rider",
      color: "#F59E0B",
    },
    { value: "rider_assigned", label: "Rider Assigned", color: "#06B6D4" },
    { value: "picked_up", label: "Picked Up", color: "#8B5CF6" },
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
  };

  useEffect(() => {
    fetchOrderDetails();

    return () => stopTrackingDeliveryPartner();
  }, []);

  useEffect(() => {
    if (refreshOrdersData) fetchOrderDetails();
  }, [refreshOrdersData]);

  useEffect(() => {
    // Simulate delivery progress
    if (order?.delivery_assignment?.status === "picked_up") {
      setDeliveryProgress(0.8); // 80% progress
      setEstimatedTime("10-15 min");
    } else if (order?.delivery_assignment?.status === "delivered") {
      setDeliveryProgress(1.0); // 100% progress
      setEstimatedTime("Delivered");
    } else if (order?.delivery_assignment?.status === "rider_assigned") {
      setDeliveryProgress(0.4); // 40% progress
      setEstimatedTime("Waiting for pickup");
    }
  }, [order?.delivery_assignment?.status]);

  useEffect(() => {
    if (order) {
      if (deliveryPartnerLocation) {
        setDeliveryPartnerCoordinates(deliveryPartnerLocation);
      } else {
        setDeliveryPartnerCoordinates({
          latitude: parseFloat(
            order.delivery_partner?.location?.latitude || null
          ),
          longitude: parseFloat(
            order.delivery_partner?.location?.longitude || null
          ),
        });
      }
    }
  }, [order, deliveryPartnerLocation]);

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
        const orderDetails = response.data.data.order;

        if (
          orderDetails &&
          ["rider_assigned", "out_for_delivery"].includes(
            orderDetails.status
          ) &&
          ["rider_assigned", "picked_up"].includes(
            orderDetails.delivery_assignment?.status
          ) &&
          orderDetails.delivery_partner
        ) {
          startTrackingDeliveryPartner(orderDetails.delivery_partner?.id);
        } else {
          stopTrackingDeliveryPartner();
        }
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
        if (newStatus === "ready_for_pickup") {
          try {
            await createDeliveryAssignment(orderId);
            console.log("Delivery assignment created successfully");
          } catch (error) {
            console.error("Error creating delivery assignment:", error);
            // Don't fail the status update if delivery assignment creation fails
          }
        }
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

  const getDeliveryStatusColor = (status) => {
    const statusOption = deliveryStatusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.color : "#6B7280";
  };

  const getDeliveryStatusLabel = (status) => {
    const statusOption = deliveryStatusOptions.find(
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
        {/* Looking for Rider UI - Centered and Beautiful */}
        {order.status === "ready_for_pickup" && (
          <View className="items-center justify-center flex-1 px-8 mt-4">
            <View className="items-center p-8 bg-white shadow-lg rounded-2xl">
              <View>
                <LottieView
                  source={require("../../assets/animations/loading/loading-animation-2-2differentcolors.json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
              <Text className="mb-3 text-2xl font-bold text-center text-gray-800">
                Looking for Delivery Partner
              </Text>
              <Text className="mb-4 leading-6 text-center text-gray-600">
                We're finding the best delivery partner to pick up your order.
                This usually takes 2-5 minutes.
              </Text>
              <View className="flex-row items-center px-4 py-2 rounded-full bg-blue-50">
                <Feather name="clock" size={16} color="#06B6D4" />
                <Text className="ml-2 font-medium text-blue-600">
                  Estimated wait time: 2-5 minutes
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Delivery Assignment Section */}
        {order.delivery_assignment && (
          <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
            <View className="p-4">
              <Text className="mb-4 text-lg font-semibold">
                Delivery Partner
              </Text>

              {/* Delivery Partner Info */}
              {order.delivery_partner && (
                <View className="flex-row items-center p-3 mb-4 rounded-lg bg-cyan-50">
                  <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-cyan-200">
                    <Feather name="user" size={20} color="#06B6D4" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">
                      {order.delivery_partner.first_name}{" "}
                      {order.delivery_partner.last_name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {order.delivery_partner.phone}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Feather name="star" size={12} color="#F59E0B" />
                      <Text className="ml-1 text-xs text-gray-600">
                        {order.delivery_partner.rating}/5.0 •{" "}
                        {order.delivery_partner.vehicle_type}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Map Section for Rider Assigned and Beyond */}
              {["rider_assigned", "out_for_delivery"].includes(order.status) &&
                order.pickup_coordinates &&
                order.delivery_coordinates && (
                  <View className="mb-4 bg-white rounded-lg shadow-sm">
                    <View>
                      {/* Map Preview */}
                      <TouchableOpacity
                        onPress={() => setFullScreenMapVisible(true)}
                        className="relative h-48 overflow-hidden rounded-lg"
                      >
                        <MapView
                          style={{ flex: 1 }}
                          region={{
                            latitude:
                              (order.pickup_coordinates.latitude +
                                order.delivery_coordinates.latitude) /
                              2,
                            longitude:
                              (order.pickup_coordinates.longitude +
                                order.delivery_coordinates.longitude) /
                              2,
                            latitudeDelta:
                              Math.abs(
                                order.pickup_coordinates.latitude -
                                  order.delivery_coordinates.latitude
                              ) *
                                2 +
                              0.01,
                            longitudeDelta:
                              Math.abs(
                                order.pickup_coordinates.longitude -
                                  order.delivery_coordinates.longitude
                              ) *
                                2 +
                              0.01,
                          }}
                          scrollEnabled={false}
                          zoomEnabled={false}
                        >
                          <Marker
                            coordinate={order.pickup_coordinates}
                            title="Pickup Location"
                            pinColor="#10B981"
                          />
                          <Marker
                            coordinate={order.delivery_coordinates}
                            title="Delivery Location"
                            pinColor="#EF4444"
                          />
                          {deliveryPartnerCoordinates && (
                            <Marker
                              coordinate={deliveryPartnerCoordinates}
                              title="Delivery Partner Location"
                              pinColor="#06B6D4"
                            />
                          )}
                        </MapView>

                        {/* Pickup Location Label */}
                        <View className="absolute px-3 py-1 bg-green-500 rounded-full top-3 left-3">
                          <Text className="text-xs font-medium text-white">
                            Pickup
                          </Text>
                        </View>

                        {/* Delivery Location Label */}
                        <View className="absolute px-3 py-1 bg-red-500 rounded-full top-3 right-3">
                          <Text className="text-xs font-medium text-white">
                            Delivery
                          </Text>
                        </View>

                        {/* Tap to expand indicator */}
                        <View className="absolute px-3 py-1 bg-black bg-opacity-50 rounded-full bottom-3 right-3">
                          <Text className="text-xs text-white">
                            Tap to expand
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              {/* Delivery Status */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-600">Delivery Status:</Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${getDeliveryStatusColor(order.delivery_assignment.status)}20`,
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: getDeliveryStatusColor(
                        order.delivery_assignment.status
                      ),
                    }}
                  >
                    {getDeliveryStatusLabel(order.delivery_assignment.status)}
                  </Text>
                </View>
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

              {/* Delivery Progress */}
              <View className="space-y-3">
                {[
                  {
                    status: "looking_for_rider",
                    label: "Looking for Rider",
                    icon: "search",
                  },
                  {
                    status: "rider_assigned",
                    label: "Rider Assigned",
                    icon: "user-check",
                  },
                  {
                    status: "picked_up",
                    label: "Order Picked Up",
                    icon: "package",
                  },
                  {
                    status: "delivered",
                    label: "Order Delivered",
                    icon: "check-circle",
                  },
                ].map((step, index) => {
                  const isCompleted =
                    deliveryStatusOptions.findIndex(
                      (s) => s.value === order.delivery_assignment.status
                    ) >=
                    deliveryStatusOptions.findIndex(
                      (s) => s.value === step.status
                    );
                  const isCurrent =
                    order.delivery_assignment.status === step.status;

                  return (
                    <View key={step.status} className="flex-row items-center">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          isCompleted
                            ? "bg-green-500"
                            : isCurrent
                              ? "bg-orange-500"
                              : "bg-gray-200"
                        }`}
                      >
                        <Feather
                          name={step.icon}
                          size={12}
                          color={isCompleted || isCurrent ? "white" : "#6B7280"}
                        />
                      </View>
                      <Text
                        className={`ml-3 text-sm ${
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

              {/* Delivery Times */}
              <View className="mt-4 space-y-2">
                {order.delivery_assignment.assigned_at && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Assigned At:</Text>
                    <Text className="font-medium">
                      {formatDate(order.delivery_assignment.assigned_at)}
                    </Text>
                  </View>
                )}
                {order.delivery_assignment.pickup_time && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Picked Up At:</Text>
                    <Text className="font-medium">
                      {formatDate(order.delivery_assignment.pickup_time)}
                    </Text>
                  </View>
                )}
                {order.delivery_assignment.delivery_time && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Delivered At:</Text>
                    <Text className="font-medium">
                      {formatDate(order.delivery_assignment.delivery_time)}
                    </Text>
                  </View>
                )}
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
                  status: "rider_assigned",
                  label: "Rider Assigned",
                  icon: "user-check",
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
        <View className="mx-4 mt-4 mb-4 bg-white rounded-lg shadow-sm">
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

        {/* Delivered Confirmation */}
        {order.status === "delivered" && (
          <View className="mx-4 mb-8 border border-green-200 rounded-lg bg-green-50">
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

        {/* Action Buttons */}
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

      {/* Full Screen Map Modal */}
      <Modal
        visible={fullScreenMapVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setFullScreenMapVisible(false)}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center px-4 pt-16 pb-4 bg-white border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setFullScreenMapVisible(false)}
              className="mr-4"
            >
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold">Delivery Map</Text>
          </View>

          {/* Full Screen Map */}
          {order && order.pickup_coordinates && order.delivery_coordinates && (
            <View className="relative flex-1">
              <MapView
                style={{ flex: 1 }}
                region={{
                  latitude:
                    (order.pickup_coordinates.latitude +
                      order.delivery_coordinates.latitude) /
                    2,
                  longitude:
                    (order.pickup_coordinates.longitude +
                      order.delivery_coordinates.longitude) /
                    2,
                  latitudeDelta:
                    Math.abs(
                      order.pickup_coordinates.latitude -
                        order.delivery_coordinates.latitude
                    ) *
                      2 +
                    0.01,
                  longitudeDelta:
                    Math.abs(
                      order.pickup_coordinates.longitude -
                        order.delivery_coordinates.longitude
                    ) *
                      2 +
                    0.01,
                }}
              >
                <Marker
                  coordinate={order.pickup_coordinates}
                  title="Pickup Location"
                  description="Your store location"
                  pinColor="#10B981"
                />
                <Marker
                  coordinate={order.delivery_coordinates}
                  title="Delivery Location"
                  description="Customer delivery address"
                  pinColor="#EF4444"
                />

                {deliveryPartnerCoordinates && (
                  <Marker
                    coordinate={deliveryPartnerCoordinates}
                    title="Delivery Partner Location"
                    pinColor="#06B6D4"
                  />
                )}
              </MapView>

              {/* Location Labels */}
              <View className="absolute px-4 py-2 bg-green-500 rounded-full top-4 left-4">
                <Text className="font-medium text-white">Pickup Location</Text>
              </View>

              <View className="absolute px-4 py-2 bg-red-500 rounded-full top-4 right-4">
                <Text className="font-medium text-white">
                  Delivery Location
                </Text>
              </View>

              {/* Order Info Card */}
              <View className="absolute p-4 bg-white rounded-lg shadow-lg bottom-4 left-4 right-4">
                <Text className="mb-2 text-lg font-semibold">
                  {order.order_number}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">
                    {order.delivery_recipient_name}
                  </Text>
                  <Text className="font-semibold text-orange-600">
                    {formatCurrency(order.seller_total_amount)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default SellerOrderDetailsScreen;
