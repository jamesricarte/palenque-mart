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
    color = "#374151",
  }) => (
    <TouchableOpacity
      className="flex flex-row items-center p-4 mb-3 bg-white border border-gray-200 rounded-lg"
      onPress={onPress}
    >
      <View className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-100 rounded-lg">
        <Feather name={icon} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-600">{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Admin Settings</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Admin Info */}
        <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg">
          <View className="flex flex-row items-center">
            <View className="flex items-center justify-center w-16 h-16 mr-4 bg-red-100 rounded-full">
              <Ionicons name="shield-checkmark" size={24} color="#dc2626" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold">Admin Panel</Text>
              <Text className="text-sm text-gray-600">
                Palenque Mart Administration
              </Text>
            </View>
          </View>
        </View>

        {/* Application Management */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold">
            Application Management
          </Text>
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
          <SettingItem
            icon="settings"
            title="System Settings"
            subtitle="Configure application settings"
            onPress={() =>
              Alert.alert("Coming Soon", "System settings coming soon")
            }
          />
        </View>

        {/* Support */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold">Support</Text>
          <SettingItem
            icon="help-circle"
            title="Help & Documentation"
            subtitle="Admin guides and documentation"
            onPress={() =>
              Alert.alert("Coming Soon", "Documentation coming soon")
            }
          />
          <SettingItem
            icon="mail"
            title="Contact Support"
            subtitle="Get help from technical support"
            onPress={() =>
              Alert.alert("Coming Soon", "Support contact coming soon")
            }
          />
        </View>

        {/* Account */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold">Account</Text>
          <SettingItem
            icon="log-out"
            title="Logout"
            subtitle="Sign out of admin panel"
            onPress={handleLogout}
            color="#dc2626"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminSettingsScreen;
