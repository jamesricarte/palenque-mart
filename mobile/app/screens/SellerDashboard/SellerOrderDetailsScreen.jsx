"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MapView, { Marker } from "react-native-maps";
import LottieView from "lottie-react-native";
import { useAuth } from "../../context/AuthContext";
import { useSeller } from "../../context/SellerContext";
import { API_URL } from "../../config/apiConfig";
import axios from "axios";
import DefaultLoadingAnimation from "../../components/DefaultLoadingAnimation";
import { useFocusEffect } from "@react-navigation/native";

const SellerOrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { token, user } = useAuth();
  const {
    createDeliveryAssignment,
    startTrackingDeliveryPartner,
    stopTrackingDeliveryPartner,
    deliveryPartnerLocation,
    refreshOrdersData,
    sellerId,
    socketMessage,
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

  const [deliveryPartnerUnreadCount, setDeliveryPartnerUnreadCount] =
    useState(0);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#F59E0B" },
    { value: "confirmed", label: "Confirmed", color: "#3B82F6" },
    { value: "preparing", label: "Preparing", color: "#8B5CF6" },
    { value: "ready_for_pickup", label: "Ready for Pickup", color: "#10B981" },
    { value: "rider_assigned", label: "Rider Assigned", color: "#06B6D4" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "#06B6D4" },
    { value: "delivered", label: "Delivered", color: "#059669" },
    { value: "cancelled", label: "Cancelled", color: "#EF4444" },
    { value: "refunded", label: "Refunded", color: "#EF4444" },
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
    { value: "refunded", label: "Refunded", color: "#EF4444" },
  ];

  const quickActions = {
    pending: [
      {
        value: "confirmed",
        label: "Accept Order",
        message: "accepted",
        color: "#10B981",
        icon: "check-circle",
        description: "Accept and confirm this order",
      },
      {
        value: "cancelled",
        label: "Decline Order",
        message: "declined",
        color: "#EF4444",
        icon: "x-circle",
        description: "Decline this order",
      },
    ],
    confirmed: [
      {
        value: "preparing",
        label: "Start Preparing",
        message: "started preparing",
        color: "#8B5CF6",
        icon: "clock",
        description: "Begin preparing the order items",
      },
    ],
    preparing: [
      {
        value: "ready_for_pickup",
        label: "Mark Ready",
        message: "marked ready",
        color: "#10B981",
        icon: "package",
        description: "Order is ready for pickup by delivery partner",
      },
    ],
  };

  const preorderQuickActions = {
    pending: [
      {
        value: "confirmed",
        label: "Accept Preorder",
        message: "accepted",
        color: "#10B981",
        icon: "check-circle",
        description: "Accept and confirm this preorder",
      },
      {
        value: "cancelled",
        label: "Decline Preorder",
        message: "declined",
        color: "#EF4444",
        icon: "x-circle",
        description: "Decline this preorder",
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

  useFocusEffect(
    useCallback(() => {
      if (order && order.delivery_partner) {
        fetchDeliveryPartnerUnreadCount();
      }
    }, [order])
  );

  useEffect(() => {
    if (socketMessage && socketMessage.data.orderId === Number(orderId)) {
      fetchDeliveryPartnerUnreadCount();
    }
  }, [socketMessage, orderId]);

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
          latitude: Number.parseFloat(
            order.delivery_partner?.location?.latitude || null
          ),
          longitude: Number.parseFloat(
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
      console.error(
        "Error fetching order details:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPartnerUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/unread-count?userId=${sellerId}&userType=seller&orderId=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDeliveryPartnerUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
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
            await createDeliveryAssignment(
              orderId,
              parseFloat(order.delivery_fee)
            );
            console.log("Delivery assignment created successfully");
          } catch (error) {
            console.error("Error creating delivery assignment:", error);
            // Don't fail the status update if delivery assignment creation fails
          }
        }

        let successMessage = `Order ${actionData.message.toLowerCase()} successfully`;
        if (order.order_type === "preorder" && newStatus === "confirmed") {
          successMessage =
            "Preorder accepted successfully. This preorder will become a normal order when items are available.";
        }

        Alert.alert("Success", successMessage);
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

  const handleMessageDeliveryPartner = async () => {
    try {
      // Get conversation ID for seller-delivery partner chat
      const response = await axios.get(
        `${API_URL}/api/chat/seller/conversation-id/${order.delivery_partner.id}?orderId=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        navigation.navigate("SellerDeliveryPartnerChat", {
          conversationId: response.data.data.conversationId,
          deliveryPartnerId: order.delivery_partner.id,
          deliveryPartnerName: `${order.delivery_partner.first_name} ${order.delivery_partner.last_name}`,
          deliveryPartnerProfilePicture: order.delivery_partner.profile_picture,
          orderId: orderId,
          orderNumber: order.order_number,
          deliveryStatus: order.status,
        });
      }
    } catch (error) {
      console.error("Error getting conversation ID:", error);
      Alert.alert("Error", "Failed to open chat");
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
    const date = new Date(dateString.replace(" ", "T"));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₱${Number.parseFloat(amount).toFixed(2)}`;
  };

  const calculateDeliveryProgress = () => {
    if (!order.delivery_assignment) return 0;

    const status = order.delivery_assignment.status;
    switch (status) {
      case "looking_for_rider":
        return 25;
      case "rider_assigned":
        return 50;
      case "picked_up":
        return 75;
      case "delivered":
        return 100;
      default:
        return 0;
    }
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
      <View className="flex-1 bg-white">
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

  const isPreorderOrder = order.order_type === "preorder";

  return (
    <View className="flex-1 bg-white">
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

      <ScrollView
        className="flex-1"
        style={{
          marginBottom:
            (isPreorderOrder && preorderQuickActions[order.status]) ||
            (!isPreorderOrder && quickActions[order.status])
              ? 130
              : 0,
        }}
      >
        {isPreorderOrder && (
          <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <View className="items-center justify-center w-8 h-8 mr-3 bg-purple-100 rounded-full">
                  <Feather name="clock" size={16} color="#8B5CF6" />
                </View>
                <Text className="text-lg font-semibold text-purple-800">
                  Preorder Information
                </Text>
              </View>

              <View className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                <Text className="mb-2 text-sm font-medium text-purple-800">
                  This is a preorder. Items will be available on the expected
                  date.
                </Text>

                {order.preorder_deposit_paid > 0 && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-purple-600">
                      Deposit Paid:
                    </Text>
                    <Text className="text-sm font-medium text-purple-800">
                      {formatCurrency(order.preorder_deposit_paid)}
                    </Text>
                  </View>
                )}

                {order.remaining_balance > 0 && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-purple-600">
                      Remaining Balance:
                    </Text>
                    <Text className="text-sm font-medium text-purple-800">
                      {formatCurrency(order.remaining_balance)}
                    </Text>
                  </View>
                )}

                {order.items &&
                  order.items[0] &&
                  order.items[0].expected_availability_date && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-purple-600">
                        Expected Available:
                      </Text>
                      <Text className="text-sm font-medium text-purple-800">
                        {formatDate(order.items[0].expected_availability_date)}
                      </Text>
                    </View>
                  )}
              </View>
            </View>
          </View>
        )}

        {/* Looking for Rider UI - Centered and Beautiful */}
        {order.status === "ready_for_pickup" && (
          <View className="items-center justify-center flex-1 px-4 mt-4">
            <View className="items-center p-8 bg-white border border-gray-200 rounded-md">
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
                  {order.delivery_partner.profile_picture ? (
                    <Image
                      source={{ uri: order.delivery_partner.profile_picture }}
                      className="w-12 h-12 mr-3 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-cyan-200">
                      <Feather name="user" size={20} color="#06B6D4" />
                    </View>
                  )}
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
                  <View className="flex-col items-end">
                    <View
                      className="px-2 py-1 mb-2 rounded-full"
                      style={{
                        backgroundColor: `${getDeliveryStatusColor(order.delivery_assignment.status)}20`,
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{
                          color: getDeliveryStatusColor(
                            order.delivery_assignment.status
                          ),
                        }}
                      >
                        {getDeliveryStatusLabel(
                          order.delivery_assignment.status
                        )}
                      </Text>
                    </View>
                    {/* Message button for delivery partner */}
                    {[
                      "rider_assigned",
                      "out_for_delivery",
                      "delivered",
                      "cancelled",
                      "refunded",
                    ].includes(order.status) && (
                      <View className="relative">
                        <TouchableOpacity
                          onPress={handleMessageDeliveryPartner}
                          className="flex-row items-center px-3 py-1 bg-orange-100 rounded-full"
                        >
                          <Feather
                            name="message-circle"
                            size={14}
                            color="#EA580C"
                          />
                          <Text className="ml-1 text-xs font-medium text-orange-600">
                            Message
                          </Text>
                        </TouchableOpacity>
                        {deliveryPartnerUnreadCount > 0 && (
                          <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center">
                            <Text className="text-xs font-bold text-white">
                              {deliveryPartnerUnreadCount > 99
                                ? "99+"
                                : deliveryPartnerUnreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Delivery Progress */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-medium text-gray-800">
                    Delivery Progress
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {calculateDeliveryProgress()}%
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-200 rounded-full">
                  <View
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${calculateDeliveryProgress()}%` }}
                  />
                </View>
              </View>

              {/* Map Section */}
              {["rider_assigned", "out_for_delivery"].includes(order.status) &&
                (order.pickup_coordinates || order.delivery_coordinates) && (
                  <View className="mb-4">
                    <TouchableOpacity
                      onPress={() => setFullScreenMapVisible(true)}
                      className="relative h-48 overflow-hidden rounded-lg"
                    >
                      <MapView
                        style={{ height: 200 }}
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
                      {order.status === "out_for_delivery" &&
                      order.delivery_assignment?.status === "picked_up" ? (
                        <View className="absolute px-3 py-1 rounded-full bg-cyan-500 top-3 left-3">
                          <Text className="text-xs font-medium text-white">
                            Delivery Partner
                          </Text>
                        </View>
                      ) : (
                        <View className="absolute px-3 py-1 bg-green-500 rounded-full top-3 left-3">
                          <Text className="text-xs font-medium text-white">
                            Pickup
                          </Text>
                        </View>
                      )}

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
                )}
            </View>
          </View>
        )}

        {/* Order Status Progress */}
        <View className="mx-4 mt-4 bg-white border border-gray-200 rounded-md">
          <View className="p-4">
            <Text className="mb-2 text-lg font-semibold">Order Progress</Text>
            <View className="space-y-3">
              {[
                {
                  status: "pending",
                  label: "Order Received",
                  icon: "inbox",
                },
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
                { status: "cancelled", label: "Cancelled", icon: "x" },
                { status: "refunded", label: "Refunded", icon: "x" },
              ].map((step, index) => {
                let isCompleted;
                if (
                  order.status === "cancelled" ||
                  order.status === "refunded"
                ) {
                  isCompleted = step.status === "pending";
                } else {
                  isCompleted =
                    statusOptions.findIndex((s) => s.value === order.status) >=
                    statusOptions.findIndex((s) => s.value === step.status);
                }
                const isCurrent = order.status === step.status;

                return (
                  <View key={step.status} className="flex-row items-center">
                    <View
                      className={`w-8 h-8 mt-2 rounded-full items-center justify-center ${
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

        {/* Order Items */}
        <View className="mx-4 mt-4 bg-white border border-gray-200 rounded-md">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Order Items</Text>
            {order.items.map((item, index) => (
              <View
                key={item.id}
                className="flex-row items-center p-3 mb-4 bg-white rounded-lg"
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
                  <View className="flex-row items-center">
                    <Text className="text-lg font-medium">
                      {item.product_name}
                    </Text>
                    {isPreorderOrder && (
                      <View className="px-2 py-1 ml-2 bg-purple-100 rounded">
                        <Text className="text-xs font-medium text-purple-800">
                          Preorder
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-600">
                    Quantity: {item.quantity}
                  </Text>
                  <Text className="text-sm text-gray-500 capitalize">
                    {item.unit_type.replace("_", " ")} •{" "}
                    {formatCurrency(item.unit_price)} each
                  </Text>
                  {isPreorderOrder && item.expected_availability_date && (
                    <Text className="mt-1 text-xs text-purple-600">
                      Available: {formatDate(item.expected_availability_date)}
                    </Text>
                  )}
                  {isPreorderOrder && item.preorder_status && (
                    <Text className="mt-1 text-xs text-purple-600 capitalize">
                      Status: {item.preorder_status.replace("_", " ")}
                    </Text>
                  )}
                </View>
                <Text className="text-lg font-semibold">
                  {formatCurrency(item.total_price)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View className="mx-4 mt-4 bg-white border border-gray-200 rounded-md">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Order Summary</Text>
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
        <View className="mx-4 mt-4 bg-white border border-gray-200 rounded-md">
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
        <View className="mx-4 mt-4 mb-2 bg-white border border-gray-200 rounded-md">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold">Delivery Address</Text>
            <View className="p-3 bg-white rounded-lg">
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
      </ScrollView>

      {((isPreorderOrder && preorderQuickActions[order.status]) ||
        (!isPreorderOrder && quickActions[order.status])) && (
        <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-200">
          {(isPreorderOrder
            ? preorderQuickActions[order.status]
            : quickActions[order.status]
          )?.map((action, index) => (
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
              <Text className="text-xl font-semibold">
                {isPreorderOrder
                  ? "Update Preorder Status"
                  : "Update Order Status"}
              </Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-3 mb-4 bg-white rounded-lg">
              <Text className="font-medium text-gray-900">
                {order.order_number}
              </Text>
              <Text className="text-sm text-gray-600">
                Current Status: {getStatusLabel(order.status)}
              </Text>
              {isPreorderOrder && (
                <Text className="text-sm text-purple-600">
                  Order Type: Preorder
                </Text>
              )}
            </View>

            {(isPreorderOrder
              ? preorderQuickActions[order.status]
              : quickActions[order.status]
            )?.map((action) => (
              <TouchableOpacity
                key={action.value}
                onPress={() => handleStatusUpdate(action.value, action)}
                disabled={updatingStatus}
                className="flex-row items-center p-4 mb-3 border border-gray-200 rounded-md"
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
        animationType="slide"
        onRequestClose={() => setFullScreenMapVisible(false)}
      >
        <View className="flex-1">
          <View className="flex-row items-center px-4 pt-16 pb-4 bg-white border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setFullScreenMapVisible(false)}
              className="mr-4"
            >
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold">Delivery Tracking</Text>
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

              {/* Pickup Location Label */}
              {order.status === "out_for_delivery" &&
              order.delivery_assignment?.status === "picked_up" ? (
                <View className="absolute px-4 py-2 rounded-full bg-cyan-500 top-4 left-4">
                  <Text className="font-medium text-white">
                    Delivery Partner
                  </Text>
                </View>
              ) : (
                <View className="absolute px-4 py-2 bg-green-500 rounded-full top-4 left-4">
                  <Text className="font-medium text-white">
                    Pickup Location
                  </Text>
                </View>
              )}

              {/* Delivery Location Label */}
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
