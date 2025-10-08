"use client";

import { View, Text, ScrollView, RefreshControl, Image } from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "../../../context/AuthContext";
import { useDeliveryPartner } from "../../../context/DeliveryPartnerContext";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";

const DeliveryPartnerOverviewScreen = ({ route }) => {
  const { token } = useAuth();
  const { currentLocation, isOnline } = useDeliveryPartner();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const deliveryPartnerProfile = route?.params?.deliveryPartnerProfile;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/delivery-partner/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <Text className="text-gray-500">Loading overview...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 pt-16">
        <View className="flex-row items-center justify-between mb-4">
          <Image
            source={require("../../../assets/images/Palenque-Logo-v1.png")}
            className="h-16 w-52"
            resizeMode="cover"
          />
        </View>
      </View>
      <View className="p-4">
        {/* Online Status Display */}
        <View></View>

        {/* Stats Cards */}
        <View className="flex flex-row flex-wrap gap-4 mb-4">
          {/* Total Deliveries */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <Feather name="truck" size={24} color="#16a34a" />
              <Text className="text-2xl font-bold text-gray-900">
                {stats?.totalDeliveries || 0}
              </Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">
              Total Deliveries
            </Text>
          </View>

          {/* Monthly Deliveries */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <MaterialIcons name="calendar-today" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-900">
                {stats?.monthlyDeliveries || 0}
              </Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">
              This Month
            </Text>
          </View>

          {/* Total Earnings */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <MaterialIcons name="attach-money" size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-900">
                ₱{stats?.totalEarnings?.toFixed(2) || "0.00"}
              </Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">
              Total Earnings
            </Text>
          </View>

          {/* Monthly Earnings */}
          <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <View className="flex flex-row items-center justify-between mb-2">
              <MaterialIcons name="trending-up" size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-gray-900">
                ₱{stats?.monthlyEarnings?.toFixed(2) || "0.00"}
              </Text>
            </View>
            <Text className="text-sm font-medium text-gray-600">
              This Month
            </Text>
          </View>
        </View>

        {/* Rating Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <View className="flex flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold">Your Rating</Text>
              <Text className="text-sm text-gray-600">
                Based on customer feedback
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text className="ml-1 text-2xl font-bold text-gray-900">
                {stats?.rating?.toFixed(1) || "5.0"}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Vehicle Information
          </Text>

          <View className="space-y-3">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Vehicle Type</Text>
              <Text className="text-sm font-medium text-gray-900 capitalize">
                {deliveryPartnerProfile?.vehicle_type || "N/A"}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Make & Model</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_make || "N/A"}{" "}
                {deliveryPartnerProfile?.vehicle_model || ""}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Year</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_year || "N/A"}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Color</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_color || "N/A"}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">License Number</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.license_number || "N/A"}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Registration</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.vehicle_registration || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Card */}
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

        {/* Emergency Contact Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Emergency Contact
          </Text>

          <View className="space-y-3">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Name</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.emergency_contact_name || "N/A"}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Phone</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.emergency_contact_phone || "N/A"}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Relation</Text>
              <Text className="text-sm font-medium text-gray-900">
                {deliveryPartnerProfile?.emergency_contact_relation || "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DeliveryPartnerOverviewScreen;
