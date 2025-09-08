"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../../context/AuthContext";
import { useSeller } from "../../../context/SellerContext";
import { API_URL } from "../../../config/apiConfig";
import axios from "axios";
import DefaultLoadingAnimation from "../../../components/DefaultLoadingAnimation";

const SellerOrdersScreen = ({ navigation }) => {
  const { token } = useAuth();
  const { createDeliveryAssignment, setTriggerWebSocket, refreshOrdersData } =
    useSeller();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const firstLoadRef = useRef(true);

  const statusOptions = [
    { value: "all", label: "All Orders", color: "#6B7280", count: 0 },
    { value: "preorder", label: "Pre-orders", color: "#8B5CF6", count: 0 },
    {
      value: "pending",
      label: "New Orders",
      color: "#F59E0B",
      count: 0,
      priority: true,
    },
    { value: "confirmed", label: "Confirmed", color: "#3B82F6", count: 0 },
    {
      value: "preparing",
      label: "Preparing",
      color: "#8B5CF6",
      count: 0,
      priority: true,
    },
    {
      value: "ready_for_pickup",
      label: "Ready",
      color: "#10B981",
      count: 0,
      priority: true,
    },
    {
      value: "rider_assigned",
      label: "Rider Assigned",
      color: "#06B6D4",
      count: 0,
    },
    {
      value: "out_for_delivery",
      label: "Out for Delivery",
      color: "#06B6D4",
      count: 0,
    },
    { value: "delivered", label: "Delivered", color: "#059669", count: 0 },
    { value: "cancelled", label: "Cancelled", color: "#EF4444", count: 0 },
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

  const fetchOrders = async (showFilterLoading = false) => {
    if (firstLoadRef.current) {
      setLoading(true);
      firstLoadRef.current = false;
    }

    if (showFilterLoading) setFilterLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/seller/orders`, {
        params: { status: selectedStatus },
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
        const allOrders = response.data.data.orders;
        statusOptions.forEach((status) => {
          if (status.value === "all") {
            status.count = allOrders.length;
          } else if (status.value === "preorder") {
            status.count = allOrders.filter(
              (order) =>
                order.items &&
                order.items.some((item) => item.is_preorder_enabled === 1)
            ).length;
          } else {
            status.count = allOrders.filter(
              (order) => order.status === status.value
            ).length;
          }
        });

        setTriggerWebSocket(true);
      }
    } catch (error) {
      console.error(
        "Error fetching orders:",
        error.response?.data || error.message
      );
    } finally {
      if (loading) setLoading(false);
      if (showFilterLoading) setFilterLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrdersCallback = useCallback(
    (showFilterLoading = false) => fetchOrders(showFilterLoading),
    [token, selectedStatus]
  );

  useFocusEffect(
    useCallback(() => {
      fetchOrdersCallback(true);
    }, [fetchOrdersCallback])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrdersCallback();
  }, [fetchOrdersCallback]);

  useEffect(() => {
    if (refreshOrdersData) fetchOrdersCallback();
  }, [refreshOrdersData]);

  const handleQuickAction = async (orderId, newStatus, actionData) => {
    setUpdatingStatus(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/seller/orders/${orderId}/status`,
        {
          status: newStatus,
          notes: actionData.description,
        }
      );

      if (response.data.success) {
        if (newStatus === "ready_for_pickup") {
          try {
            await createDeliveryAssignment(orderId);
            console.log("Delivery assignment created successfully");
          } catch (error) {
            console.error("Error creating delivery assignment:", error);
          }
        }

        Alert.alert(
          "Success",
          `Order ${actionData.message.toLowerCase()} successfully`
        );
        fetchOrdersCallback();
        setQuickActionModalVisible(false);
        setSelectedOrder(null);
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
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const formatCurrency = (amount) => {
    return `₱${Number.parseFloat(amount).toFixed(2)}`;
  };

  const openQuickActionModal = (order) => {
    setSelectedOrder(order);
    setQuickActionModalVisible(true);
  };

  const navigateToOrderDetails = (orderId) => {
    navigation.navigate("SellerOrderDetails", { orderId });
  };

  const getOrderPriority = (order) => {
    const urgentStatuses = ["pending", "preparing"];
    return urgentStatuses.includes(order.status);
  };

  const renderOrderCard = (order) => {
    const hasPreorderItems =
      order.items && order.items.some((item) => item.is_preorder_enabled === 1);

    return (
      <TouchableOpacity
        key={order.id}
        onPress={() => navigateToOrderDetails(order.id)}
        className={`mx-4 mt-4 bg-white rounded-lg shadow-sm ${
          getOrderPriority(order) ? "border-l-4 border-orange-500" : ""
        } ${hasPreorderItems ? "border-r-4 border-purple-500" : ""}`}
      >
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold">
                  {order.order_number}
                </Text>
              </View>
              <Text className="mt-1 text-sm text-gray-500">
                {formatDate(order.created_at)}
              </Text>
            </View>
            <View className="items-end gap-1.5">
              {hasPreorderItems && (
                <View className="px-3 py-1 bg-purple-100 rounded-full">
                  <Text className="text-sm font-medium text-purple-800">
                    Pre-order
                  </Text>
                </View>
              )}
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${getStatusColor(order.status)}20`,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </Text>
              </View>

              {getOrderPriority(order) && (
                <View className="flex-row items-center">
                  <Feather name="clock" size={12} color="#F59E0B" />
                  <Text className="ml-1 text-xs font-medium text-orange-600">
                    Needs Attention
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-sm text-gray-700">
              {order.customer_first_name} {order.customer_last_name}
            </Text>
            <Text className="text-lg font-semibold text-orange-600">
              {formatCurrency(order.seller_total_amount)}
            </Text>
          </View>
        </View>

        {order.items && order.items.length > 0 && (
          <View className="px-4 py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-12 h-12 mr-3 bg-gray-200 rounded-lg">
                {order.items[0].image_keys ? (
                  <Image
                    source={{ uri: order.items[0].image_keys }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex items-center justify-center w-full h-full">
                    <MaterialCommunityIcons
                      name="image-off-outline"
                      size={20}
                      color="#6B7280"
                    />
                  </View>
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-medium text-gray-800" numberOfLines={1}>
                    {order.items[0].product_name}
                  </Text>
                  {order.items[0].is_preorder_enabled === 1 && (
                    <View className="px-1 py-0.5 ml-2 bg-purple-100 rounded">
                      <Text className="text-xs font-medium text-purple-800">
                        Pre
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-500">
                  Qty: {order.items[0].quantity} •{" "}
                  {formatCurrency(order.items[0].unit_price)} each
                </Text>
                {order.items[0].is_preorder_enabled === 1 &&
                  order.items[0].expected_availability_date && (
                    <Text className="text-xs text-purple-600">
                      Available:{" "}
                      {formatDate(order.items[0].expected_availability_date)}
                    </Text>
                  )}
                {order.items.length > 1 && (
                  <Text className="mt-1 text-xs font-medium text-orange-600">
                    +{order.items.length - 1} more item
                    {order.items.length > 2 ? "s" : ""}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-600">
              {order.item_count} item(s)
            </Text>
            <Text className="text-sm text-gray-600 capitalize">
              {order.payment_method.replace(/_/g, " ")}
            </Text>
          </View>

          {hasPreorderItems && (
            <View className="p-3 mb-3 border border-purple-200 rounded-lg bg-purple-50">
              <View className="flex-row items-center">
                <Feather name="clock" size={16} color="#8B5CF6" />
                <Text className="ml-2 text-sm font-medium text-purple-800">
                  Contains Pre-order Items
                </Text>
              </View>
              <Text className="mt-1 text-xs text-purple-600">
                This order includes items that are available for pre-order
              </Text>
            </View>
          )}

          {quickActions[order.status] && (
            <View className="flex-row gap-3">
              {quickActions[order.status].map((action, index) => (
                <TouchableOpacity
                  key={action.value}
                  onPress={() => openQuickActionModal(order)}
                  className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                    index === 0 ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <Feather
                    name={action.icon}
                    size={16}
                    color={index === 0 ? "white" : "#6B7280"}
                  />
                  <Text
                    className={`ml-2 font-medium ${index === 0 ? "text-white" : "text-gray-700"}`}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {order.status === "ready_for_pickup" && (
            <View className="p-3 mt-3 border border-green-200 rounded-lg bg-green-50">
              <View className="flex-row items-center">
                <Feather name="search" size={16} color="#10B981" />
                <Text className="ml-2 text-sm font-medium text-green-800">
                  Looking for Delivery Partner
                </Text>
              </View>
              <Text className="mt-1 text-xs text-green-600">
                Your order is ready and we're finding a delivery partner to pick
                it up
              </Text>
            </View>
          )}

          {order.status === "out_for_delivery" && (
            <View className="p-3 mt-3 border border-blue-200 rounded-lg bg-blue-50">
              <View className="flex-row items-center">
                <Feather name="truck" size={16} color="#06B6D4" />
                <Text className="ml-2 text-sm font-medium text-blue-800">
                  Out for Delivery
                </Text>
              </View>
              <Text className="mt-1 text-xs text-blue-600">
                Your order is on the way to the customer
              </Text>
            </View>
          )}

          {order.status === "rider_assigned" && order.delivery_partner && (
            <View className="p-3 mt-3 border rounded-lg border-cyan-200 bg-cyan-50">
              <View className="flex-row items-center">
                <Feather name="user-check" size={16} color="#06B6D4" />
                <Text className="ml-2 text-sm font-medium text-cyan-800">
                  Rider Assigned
                </Text>
              </View>
              <Text className="mt-1 text-xs text-cyan-600">
                {order.delivery_partner.first_name}{" "}
                {order.delivery_partner.last_name} will pick up your order
              </Text>
              <View className="flex-row items-center mt-1">
                <Feather name="star" size={12} color="#06B6D4" />
                <Text className="ml-1 text-xs text-cyan-600">
                  {order.delivery_partner.rating}/5.0 •{" "}
                  {order.delivery_partner.vehicle_type}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-semibold">Order Management</Text>
        </View>
        <View className="items-center justify-center flex-1">
          <DefaultLoadingAnimation />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Order Management</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status.value}
              onPress={() => {
                setFilterLoading(true);
                setSelectedStatus(status.value);
              }}
              className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${
                selectedStatus === status.value ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${selectedStatus === status.value ? "text-white" : "text-gray-700"}`}
              >
                {status.label}
              </Text>
              {status.count > 0 && (
                <View
                  className={`ml-2 px-2 py-1 rounded-full ${
                    selectedStatus === status.value
                      ? "bg-white bg-opacity-20"
                      : "bg-orange-500"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${selectedStatus === status.value ? "text-white" : "text-white"}`}
                  >
                    {status.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filterLoading ? (
          <View className="h-[80vh] justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : orders?.length > 0 ? (
          orders?.map(renderOrderCard)
        ) : (
          <View className="items-center justify-center flex-1 h-[80vh]">
            <Feather name="inbox" size={48} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium">No Orders Found</Text>
            <Text className="px-8 mt-2 text-center text-gray-500">
              {selectedStatus === "all"
                ? "You haven't received any orders yet. Orders will appear here when customers place them."
                : `No ${getStatusLabel(selectedStatus).toLowerCase()} orders at the moment.`}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={quickActionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setQuickActionModalVisible(false);
          setSelectedOrder(null);
        }}
      >
        <View
          className="justify-end flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="p-6 bg-white rounded-t-3xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold">Quick Actions</Text>
              <TouchableOpacity
                onPress={() => {
                  setQuickActionModalVisible(false);
                  setSelectedOrder(null);
                }}
              >
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <View className="p-3 mb-4 rounded-lg bg-gray-50">
                  <Text className="font-medium text-gray-900">
                    {selectedOrder.order_number}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {selectedOrder.customer_first_name}{" "}
                    {selectedOrder.customer_last_name}
                  </Text>
                  <Text className="text-sm font-medium text-orange-600">
                    {formatCurrency(selectedOrder.seller_total_amount)}
                  </Text>
                </View>

                {quickActions[selectedOrder.status]?.map((action) => (
                  <TouchableOpacity
                    key={action.value}
                    onPress={() =>
                      handleQuickAction(selectedOrder.id, action.value, action)
                    }
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
                      <Feather
                        name={action.icon}
                        size={20}
                        color={action.color}
                      />
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
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SellerOrdersScreen;
