"use client";

import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

import axios from "axios";
import { API_URL } from "../../../config/apiConfig";

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // all, unread, read

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/user`);

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: 1 } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error.response?.data
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/user/read-all`
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: 1 }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error.response?.data
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [user.id])
  );

  const handleNotificationPress = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Handle deep linking and actions from new database columns
    if (notification.action || notification.deep_link) {
      // Handle specific actions
      switch (notification.action) {
        case "open_order_details":
          navigation?.navigate?.("OrderDetails", {
            orderId: notification.reference_id,
            ...notification.extra_data,
          });
          break;
        case "open_chat":
          navigation?.navigate?.("Chat", {
            chatId: notification.reference_id,
            ...notification.extra_data,
          });
          break;
        case "open_delivery_tracking":
          navigation?.navigate?.("DeliveryTracking", {
            deliveryId: notification.reference_id,
            ...notification.extra_data,
          });
          break;
        default:
          // Fallback to legacy navigation logic
          handleLegacyNavigation(notification);
          break;
      }
    } else {
      // Fallback to legacy navigation logic
      handleLegacyNavigation(notification);
    }
  };

  const handleLegacyNavigation = (notification) => {
    switch (notification.type) {
      case "order":
      case "delivery":
        navigation?.navigate?.("OrderDetails", {
          orderId: notification.reference_id || 123,
        });
        break;
      case "chat":
        navigation?.navigate?.("Chat");
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <MaterialIcons name="shopping-bag" size={24} color="#F16B44" />;
      case "delivery":
        return (
          <MaterialIcons name="local-shipping" size={24} color="#4CAF50" />
        );
      case "chat":
        return <Ionicons name="chatbubble" size={24} color="#2196F3" />;
      case "promotion":
        return <MaterialIcons name="local-offer" size={24} color="#FF9800" />;
      case "system":
        return <MaterialIcons name="info" size={24} color="#9C27B0" />;
      default:
        return <Ionicons name="notifications" size={24} color="#9E9E9E" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((notif) => !notif.is_read);
      case "read":
        return notifications.filter((notif) => notif.is_read);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const readCount = notifications.filter((n) => n.is_read).length;

  const FilterButton = ({ filterType, label, count }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-3 ${filter === filterType ? "bg-orange-600" : "bg-gray-100"}`}
      onPress={() => setFilter(filterType)}
    >
      <Text
        className={`text-sm font-medium ${filter === filterType ? "text-white" : "text-gray-700"}`}
      >
        {label} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const renderNotificationItem = (item, index) => (
    <TouchableOpacity
      key={item.id}
      className={`p-4 border-b border-gray-100 ${!item.is_read ? "bg-blue-50" : "bg-white"}`}
      onPress={() => handleNotificationPress(item)}
    >
      <View className="flex-row items-start gap-3">
        <View className="mt-1">{getNotificationIcon(item.type)}</View>
        <View className="flex-1">
          <Text className="mb-1 text-base font-semibold text-gray-900">
            {item.title}
          </Text>
          <Text className="mb-2 text-sm leading-5 text-gray-600">
            {item.message}
          </Text>
          <Text className="text-xs text-gray-400">
            {formatTimeAgo(item.created_at)}
          </Text>
        </View>
        {!item.is_read && (
          <View className="w-2 h-2 mt-2 bg-orange-600 rounded-full" />
        )}
      </View>
    </TouchableOpacity>
  );

  const getEmptyStateMessage = () => {
    switch (filter) {
      case "unread":
        return {
          title: "No unread notifications",
          subtitle: "All caught up! Check back later for new updates.",
        };
      case "read":
        return {
          title: "No read notifications",
          subtitle: "Notifications you've read will appear here.",
        };
      default:
        return {
          title: "No notifications yet",
          subtitle:
            "You'll see notifications about your orders, deliveries, and other important updates here.",
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-semibold">Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="px-3 py-1 bg-orange-100 rounded-full"
            >
              <Text className="text-sm font-medium text-orange-700">
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          <FilterButton
            filterType="all"
            label="All"
            count={notifications.length}
          />
          <FilterButton
            filterType="unread"
            label="Unread"
            count={unreadCount}
          />
          <FilterButton filterType="read" label="Read" count={readCount} />
        </ScrollView>
      </View>

      {/* Content */}
      {filteredNotifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="items-center justify-center flex-1 px-6">
            <Feather name="bell" size={80} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              {emptyState.title}
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              {emptyState.subtitle}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#F16B44"]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.map(renderNotificationItem)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
