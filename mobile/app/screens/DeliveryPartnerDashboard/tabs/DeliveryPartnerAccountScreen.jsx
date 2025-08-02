"use client";

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "../../../context/AuthContext";

const DeliveryPartnerAccountScreen = ({
  route,
  navigation,
  deliveryPartnerProfile,
  onProfileUpdate,
}) => {
  const { logout } = useAuth();

  const handleEditProfile = () => {
    navigation.navigate("EditDeliveryPartnerProfile", {
      deliveryPartnerProfile,
      onProfileUpdate,
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  const formatAvailabilityHours = (hours) => {
    if (!hours || typeof hours !== "object") return "Not set";

    const days = Object.keys(hours);
    const availableDays = days.filter((day) => hours[day]?.available);

    if (availableDays.length === 0) return "Not available";

    return availableDays
      .map(
        (day) =>
          `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours[day].start} - ${hours[day].end}`
      )
      .join(", ");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Profile Header */}
        <View className="p-6 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <View className="flex flex-row items-center mb-4">
            <View className="flex items-center justify-center w-16 h-16 mr-4 bg-green-100 rounded-full">
              <Feather name="user" size={32} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                {deliveryPartnerProfile?.first_name}{" "}
                {deliveryPartnerProfile?.last_name}
              </Text>
              <Text className="text-sm text-gray-600">
                {deliveryPartnerProfile?.partner_id}
              </Text>
              <View className="flex flex-row items-center mt-1">
                <View
                  className={`w-3 h-3 rounded-full mr-2 ${
                    deliveryPartnerProfile?.is_online
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
                <Text
                  className={`text-sm font-medium ${
                    deliveryPartnerProfile?.is_online
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {deliveryPartnerProfile?.is_online ? "Online" : "Offline"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleEditProfile}
            className="w-full py-3 bg-green-600 rounded-lg"
          >
            <Text className="font-semibold text-center text-white">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Information */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Vehicle Information
          </Text>

          <View className="space-y-3">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Vehicle Type</Text>
              <Text className="text-sm font-medium text-gray-900 capitalize">
                {deliveryPartnerProfile?.vehicle_type}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Make & Model</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_make}{" "}
                {deliveryPartnerProfile?.vehicle_model}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Year</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_year}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Color</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_color}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">License Number</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.license_number}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Registration</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_registration}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Stats */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Performance
          </Text>

          <View className="flex flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-green-600">
                {typeof deliveryPartnerProfile?.rating === "number"
                  ? deliveryPartnerProfile.rating.toFixed(1)
                  : "5.0"}
              </Text>
              <Text className="text-sm text-gray-600">Rating</Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-600">
                {deliveryPartnerProfile?.total_deliveries || 0}
              </Text>
              <Text className="text-sm text-gray-600">Total Deliveries</Text>
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Emergency Contact
          </Text>

          <View className="space-y-3">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Name</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.emergency_contact_name}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Phone</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.emergency_contact_phone}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Relation</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.emergency_contact_relation}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Account
          </Text>

          <TouchableOpacity className="flex flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg">
            <MaterialIcons name="help-outline" size={20} color="#6b7280" />
            <Text className="flex-1 ml-3 text-sm font-medium text-gray-900">
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg">
            <MaterialIcons name="privacy-tip" size={20} color="#6b7280" />
            <Text className="flex-1 ml-3 text-sm font-medium text-gray-900">
              Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg">
            <MaterialIcons name="description" size={20} color="#6b7280" />
            <Text className="flex-1 ml-3 text-sm font-medium text-gray-900">
              Terms of Service
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex flex-row items-center p-3 border border-red-200 rounded-lg bg-red-50"
          >
            <MaterialIcons name="logout" size={20} color="#dc2626" />
            <Text className="flex-1 ml-3 text-sm font-medium text-red-600">
              Logout
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default DeliveryPartnerAccountScreen;
