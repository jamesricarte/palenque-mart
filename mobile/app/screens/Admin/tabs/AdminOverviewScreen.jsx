"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
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
      <View className="flex flex-row justify-between">
        <View className="items-center">
          <Text className="text-xl font-bold text-yellow-600">
            {stats.pending}
          </Text>
          <Text className="text-xs text-gray-600">Pending</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-blue-600">
            {stats.under_review}
          </Text>
          <Text className="text-xs text-gray-600">Review</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-green-600">
            {stats.approved}
          </Text>
          <Text className="text-xs text-gray-600">Approved</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-red-600">
            {stats.rejected}
          </Text>
          <Text className="text-xs text-gray-600">Rejected</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-semibold">Admin Overview</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">Loading overview...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Admin Overview</Text>
        <TouchableOpacity onPress={() => fetchOverview(true)}>
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>
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
          <Text className="mb-4 text-lg font-semibold">Quick Stats</Text>
          <View className="flex flex-row mb-4">
            <StatCard
              title="Total Sellers"
              value={overviewData?.seller?.total || 0}
              subtitle={`${overviewData?.seller?.recentApplications || 0} this week`}
              color="border-blue-200 bg-blue-50"
              icon={<Feather name="store" size={20} color="#2563eb" />}
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
            color="border-blue-200 bg-blue-50"
          />

          {/* Delivery Partner Applications Status */}
          <StatusCard
            title="Delivery Partner Applications"
            stats={overviewData?.deliveryPartner?.stats || {}}
            color="border-green-200 bg-green-50"
          />

          {/* Quick Actions */}
          <View className="mt-4">
            <Text className="mb-4 text-lg font-semibold">Quick Actions</Text>
            <View className="space-y-3">
              <TouchableOpacity
                className="flex flex-row items-center p-4 bg-white border border-gray-200 rounded-lg"
                onPress={() =>
                  navigation.navigate("Sellers", { filter: "pending" })
                }
              >
                <View className="flex items-center justify-center w-10 h-10 mr-3 bg-yellow-100 rounded-lg">
                  <Ionicons name="time-outline" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium">Review Pending Sellers</Text>
                  <Text className="text-sm text-gray-600">
                    {overviewData?.seller?.stats?.pending || 0} applications
                    waiting
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#6b7280" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex flex-row items-center p-4 bg-white border border-gray-200 rounded-lg"
                onPress={() =>
                  navigation.navigate("Delivery", { filter: "pending" })
                }
              >
                <View className="flex items-center justify-center w-10 h-10 mr-3 bg-yellow-100 rounded-lg">
                  <Ionicons name="time-outline" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium">
                    Review Pending Delivery Partners
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {overviewData?.deliveryPartner?.stats?.pending || 0}{" "}
                    applications waiting
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminOverviewScreen;
