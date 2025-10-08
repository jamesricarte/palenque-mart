"use client";

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "../../../context/AuthContext";
import { CommonActions } from "@react-navigation/native";

const AdminSettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "Dashboard" }, { name: "Login" }],
            })
          );
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    color = "#16A34A", // default green
    bgColor = "bg-green-100",
    isDestructive = false,
  }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className={`flex items-center justify-center w-10 h-10 mr-4 rounded-full ${
          isDestructive ? "bg-red-100" : bgColor
        }`}
      >
        <Feather
          name={icon}
          size={20}
          color={isDestructive ? "#DC2626" : color}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-medium ${
            isDestructive ? "text-red-600" : "text-gray-900"
          }`}
        >
          {title}
        </Text>
        {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-semibold">Admin Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Info */}
        <View className="p-4 mx-4 mt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <View className="flex-row items-center">
            <View className="flex items-center justify-center w-16 h-16 mr-4 bg-green-100 rounded-full">
              <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                Admin Panel
              </Text>
              <Text className="text-sm text-gray-600">
                Palenque Mart Administration
              </Text>
            </View>
          </View>
        </View>

        {/* Application Management */}
        <View className="mx-4 mt-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Application Management
            </Text>
          </View>

          <SettingItem
            icon="users"
            title="User Management"
            subtitle="Manage user accounts and permissions"
            onPress={() =>
              Alert.alert("Coming Soon", "User management feature coming soon")
            }
          />
          <SettingItem
            icon="file-text"
            title="Application Reports"
            subtitle="Generate reports and analytics"
            onPress={() =>
              Alert.alert("Coming Soon", "Reports feature coming soon")
            }
          />
        </View>

        {/* Support (with System Settings + Logout) */}
        <View className="mx-4 mt-6 mb-10 bg-white border border-gray-200 shadow-sm rounded-xl">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">Support</Text>
          </View>

          <SettingItem
            icon="settings"
            title="System Settings"
            subtitle="Configure application settings"
            onPress={() =>
              Alert.alert("Coming Soon", "System settings coming soon")
            }
            color="#6B7280"
            bgColor="bg-gray-100"
          />
          <SettingItem
            icon="help-circle"
            title="Help & Documentation"
            subtitle="Admin guides and documentation"
            onPress={() =>
              Alert.alert("Coming Soon", "Documentation coming soon")
            }
            color="#6B7280"
            bgColor="bg-gray-100"
          />
          <SettingItem
            icon="mail"
            title="Contact Support"
            subtitle="Get help from technical support"
            onPress={() =>
              Alert.alert("Coming Soon", "Support contact coming soon")
            }
            color="#6B7280"
            bgColor="bg-gray-100"
          />
          <SettingItem
            icon="log-out"
            title="Logout"
            subtitle="Sign out of admin panel"
            onPress={handleLogout}
            isDestructive
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminSettingsScreen;
