"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const AdminOverviewScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`${API_URL}/api/admin/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setOverviewData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const StatCard = ({ title, value, subtitle, color, icon, onPress }) => (
    <TouchableOpacity
      className={`flex-1 p-4 rounded-lg border ${color} mr-2`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold">{title}</Text>
        {icon}
      </View>
      <Text className="mb-1 text-2xl font-bold">{value}</Text>
      {subtitle && <Text className="text-sm text-gray-600">{subtitle}</Text>}
    </TouchableOpacity>
  );

  const StatusCard = ({ title, stats, color }) => (
    <View className={`p-4 rounded-lg border ${color} mb-4`}>
      <Text className="mb-3 text-lg font-semibold">{title}</Text>
      <View className="flex flex-row justify-around">
        <View className="items-center">
          <Text className="text-xl font-bold text-yellow-600">
            {stats.pending || 0}
          </Text>
          <Text className="text-xs text-gray-600">Pending</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-blue-600">
            {stats.under_review || 0}
          </Text>
          <Text className="text-xs text-gray-600">Review</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-orange-500">
            {stats.needs_resubmission || 0}
          </Text>
          <Text className="text-xs text-gray-600">Resubmit</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-green-600">
            {stats.approved || 0}
          </Text>
          <Text className="text-xs text-gray-600">Approved</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-red-600">
            {stats.rejected || 0}
          </Text>
          <Text className="text-xs text-gray-600">Rejected</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-4 pt-16 pb-5 bg-white">
          <Image
            source={require("../../../assets/images/Palenque-Logo-v1.png")}
            className="h-16 w-52"
            resizeMode="cover"
          />
        </View>
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">Loading overview...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white ">
        <View className="flex-row items-center justify-between">
          <Image
            source={require("../../../assets/images/Palenque-Logo-v1.png")}
            className="h-16 w-52"
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOverview(true)}
          />
        }
      >
        {/* Quick Stats */}
        <View className="p-4">
          <Text className="mb-4 text-xl font-semibold">Quick Stats</Text>
          <View className="flex flex-row mb-4">
            <StatCard
              title="Total Sellers"
              value={overviewData?.seller?.total || 0}
              subtitle={`${overviewData?.seller?.recentApplications || 0} this week`}
              color="border-orange-200 bg-orange-50"
              icon={
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={20}
                  color="#F16B44"
                />
              }
              onPress={() => navigation.navigate("Sellers")}
            />
            <StatCard
              title="Total Delivery"
              value={overviewData?.deliveryPartner?.total || 0}
              subtitle={`${overviewData?.deliveryPartner?.recentApplications || 0} this week`}
              color="border-green-200 bg-green-50"
              icon={<Feather name="truck" size={20} color="#16a34a" />}
              onPress={() => navigation.navigate("Delivery")}
            />
          </View>

          {/* Seller Applications Status */}
          <StatusCard
            title="Seller Applications"
            stats={overviewData?.seller?.stats || {}}
            color="border-orange-200 bg-orange-50"
          />

          {/* Delivery Partner Applications Status */}
          <StatusCard
            title="Delivery Partner Applications"
            stats={overviewData?.deliveryPartner?.stats || {}}
            color="border-green-200 bg-green-50"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminOverviewScreen;
