"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useAuth } from "../../../context/AuthContext";
import { useDeliveryPartner } from "../../../context/DeliveryPartnerContext";

const DeliveryPartnerAccountScreen = ({
  route,
  navigation,
  deliveryPartnerProfile,
  onProfileUpdate,
}) => {
  const { logout } = useAuth();
  const { isOnline, currentLocation } = useDeliveryPartner();

  const handleEditProfile = () => {
    navigation.navigate("EditDeliveryPartnerProfile", {
      deliveryPartnerProfile,
      onProfileUpdate,
    });
  };

  const handleSwitchToCustomerView = () => {
    Alert.alert(
      "Switch to Customer View",
      "Do you want to switch to the regular customer dashboard?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Switch",
          onPress: () => {
            navigation.replace("Dashboard");
          },
        },
      ]
    );
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
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-semibold">My Account</Text>
      </View>

      <View className="px-4 pb-6">
        {/* Profile Section - Styled like Seller Account */}
        <TouchableOpacity
          onPress={handleEditProfile}
          className="flex flex-row items-center p-4 mt-4 bg-white border border-gray-200 shadow-sm rounded-xl"
        >
          <View className="flex flex-row items-center gap-4 flex-1">
            {deliveryPartnerProfile?.profile_picture_url ? (
              <Image
                source={{ uri: deliveryPartnerProfile.profile_picture_url }}
                className="w-16 h-16 rounded-full"
                style={{ resizeMode: "cover" }}
              />
            ) : (
              <View className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <Feather name="user" size={24} color="#16a34a" />
              </View>
            )}

            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {deliveryPartnerProfile?.first_name}{" "}
                {deliveryPartnerProfile?.last_name}
              </Text>
              <Text className="text-sm text-gray-600">
                {deliveryPartnerProfile?.partner_id}
              </Text>

              <View className="flex flex-row items-center mt-1">
                <View
                  className={`w-2 h-2 mr-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text
                  className={`text-sm font-medium ${
                    isOnline ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </View>

              {currentLocation && (
                <Text className="mt-1 text-sm text-green-600">
                  Location tracking active
                </Text>
              )}
            </View>
          </View>

          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>

        {/* Quick Actions Section - Same layout as Seller's Quick Actions */}
        <View className="mt-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Quick Actions
            </Text>
          </View>

          {/* Help & Support */}
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View className="flex items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
              <MaterialIcons name="help-outline" size={20} color="black" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Help & Support
              </Text>
              <Text className="text-sm text-gray-500">
                Get help with deliveries
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View className="flex items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
              <MaterialIcons name="privacy-tip" size={20} color="black" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Privacy Policy
              </Text>
              <Text className="text-sm text-gray-500">
                Read our privacy terms
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Terms of Service */}
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View className="flex items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
              <MaterialIcons name="description" size={20} color="black" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Terms of Service
              </Text>
              <Text className="text-sm text-gray-500">
                Review delivery partner terms
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Switch to Customer View */}
          <TouchableOpacity
            onPress={handleSwitchToCustomerView}
            className="flex-row items-center p-4"
            activeOpacity={0.7}
          >
            <View className="flex items-center justify-center w-10 h-10 mr-4 bg-green-100 rounded-full">
              <FontAwesome6 name="arrows-rotate" size={20} color="#39B54A" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Switch to Customer View
              </Text>
              <Text className="text-sm text-gray-500">
                Browse and shop as a customer
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default DeliveryPartnerAccountScreen;
