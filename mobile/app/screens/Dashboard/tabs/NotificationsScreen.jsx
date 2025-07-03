import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"

const NotificationsScreen = ({ navigation }) => {
  const [filter, setFilter] = useState("all") // all, unread, read
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "Order Delivered Successfully",
      message: "Your order #PM12345 has been delivered to your address.",
      time: "2 hours ago",
      isRead: false,
      icon: "package",
      color: "bg-green-500",
    },
    {
      id: 2,
      type: "promotion",
      title: "Flash Sale Alert!",
      message: "Up to 70% off on electronics. Limited time offer!",
      time: "4 hours ago",
      isRead: false,
      icon: "tag",
      color: "bg-red-500",
    },
    {
      id: 3,
      type: "order",
      title: "Order Shipped",
      message: "Your order #PM12344 is on the way. Track your package.",
      time: "1 day ago",
      isRead: true,
      icon: "truck",
      color: "bg-blue-500",
    },
    {
      id: 4,
      type: "system",
      title: "Account Security Update",
      message: "Your password was successfully changed.",
      time: "2 days ago",
      isRead: true,
      icon: "shield",
      color: "bg-orange-500",
    },
    {
      id: 5,
      type: "promotion",
      title: "New Seller Joined",
      message: "TechWorld Store is now available on Palenque Mart!",
      time: "3 days ago",
      isRead: false,
      icon: "store",
      color: "bg-purple-500",
    },
    {
      id: 6,
      type: "order",
      title: "Payment Confirmed",
      message: "Payment for order #PM12343 has been processed successfully.",
      time: "5 days ago",
      isRead: true,
      icon: "credit-card",
      color: "bg-green-500",
    },
  ])

  const getIconComponent = (iconName, color) => {
    switch (iconName) {
      case "package":
        return <Feather name="package" size={20} color="white" />
      case "tag":
        return <Feather name="tag" size={20} color="white" />
      case "truck":
        return <Feather name="truck" size={20} color="white" />
      case "shield":
        return <Feather name="shield" size={20} color="white" />
      case "store":
        return <FontAwesome6 name="store" size={20} color="white" />
      case "credit-card":
        return <Feather name="credit-card" size={20} color="white" />
      default:
        return <Feather name="bell" size={20} color="white" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead
    if (filter === "read") return notification.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleNotificationPress = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    )
    // Temporary functionality - would navigate to relevant screen
    console.log(`Notification ${notificationId} pressed`)
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
    Alert.alert("Success", "All notifications marked as read")
  }

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            setNotifications([])
            Alert.alert("Success", "All notifications cleared")
          },
        },
      ],
    )
  }

  const handleDeleteNotification = (notificationId) => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
        },
      },
    ])
  }

  return (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex flex-row items-center gap-2">
          <Text className="text-xl font-semibold">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
              <Text className="text-xs text-white font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text className="text-black font-semibold">Mark All</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="flex flex-row bg-white border-b border-gray-200">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "read", label: "Read" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-3 ${filter === tab.key ? "border-b-2 border-black" : ""}`}
            onPress={() => setFilter(tab.key)}
          >
            <Text className={`text-center font-semibold ${filter === tab.key ? "text-black" : "text-gray-500"}`}>
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && ` (${unreadCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Action Buttons */}
        {notifications.length > 0 && (
          <View className="flex flex-row gap-3 p-4 bg-white border-b border-gray-200">
            <TouchableOpacity
              className="flex-1 py-2 border border-gray-300 rounded-lg"
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Text className={`text-center font-semibold ${unreadCount === 0 ? "text-gray-400" : "text-black"}`}>
                Mark All Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 py-2 border border-red-300 rounded-lg" onPress={handleClearAll}>
              <Text className="text-center font-semibold text-red-500">Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <View className="p-4">
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                className={`mb-3 bg-white rounded-lg border border-gray-200 ${
                  !notification.isRead ? "border-l-4 border-l-blue-500" : ""
                }`}
                onPress={() => handleNotificationPress(notification.id)}
              >
                <View className="p-4">
                  <View className="flex flex-row items-start gap-3">
                    {/* Icon */}
                    <View className={`w-10 h-10 ${notification.color} rounded-lg flex items-center justify-center`}>
                      {getIconComponent(notification.icon)}
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex flex-row items-start justify-between mb-1">
                        <Text
                          className={`text-base font-semibold ${!notification.isRead ? "text-black" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </Text>
                        {!notification.isRead && <View className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                      </View>

                      <Text className="text-sm text-gray-600 mb-2">{notification.message}</Text>

                      <View className="flex flex-row items-center justify-between">
                        <Text className="text-xs text-gray-500">{notification.time}</Text>
                        <TouchableOpacity onPress={() => handleDeleteNotification(notification.id)}>
                          <Feather name="trash-2" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Empty State */
          <View className="flex items-center justify-center p-8 mt-16">
            <View className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Feather name="bell-off" size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-semibold text-gray-700 mb-2">No Notifications</Text>
            <Text className="text-center text-gray-500">
              {filter === "all"
                ? "You don't have any notifications yet."
                : filter === "unread"
                  ? "No unread notifications."
                  : "No read notifications."}
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Settings Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity className="flex flex-row items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg">
          <Feather name="settings" size={20} color="black" />
          <Text className="font-semibold">Notification Settings</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default NotificationsScreen
