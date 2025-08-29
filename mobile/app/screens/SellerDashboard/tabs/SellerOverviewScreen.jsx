"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";

import { API_URL } from "../../../config/apiConfig";
import { useSeller } from "../../../context/SellerContext";

const SellerOverviewScreen = ({ navigation }) => {
  const { refreshTransactionData, refreshAnalyticsData } = useSeller();

  const [stats, setStats] = useState({
    totalOrders: 0,
    monthlyOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    dailyEarnings: 0,
    averageOrderValue: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSellerStats = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/api/seller/stats`);

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching seller stats:", error);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellerStats();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSellerStats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSellerStats();
    }, [])
  );

  useEffect(() => {
    if (refreshTransactionData || refreshAnalyticsData) {
      fetchSellerStats();
    }
  }, [refreshTransactionData, refreshAnalyticsData]);

  const formatCurrency = (amount) => {
    return `₱${Number.parseFloat(amount).toFixed(2)}`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Seller Dashboard</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <View className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  Welcome Back!
                </Text>
                <Text className="mt-1 text-gray-600">
                  Here's how your store is performing today
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="w-2 h-2 mr-2 bg-green-500 rounded-full" />
                  <Text className="text-sm font-medium text-green-600">
                    Store Active
                  </Text>
                </View>
              </View>
              <View className="items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                <MaterialIcons name="store" size={24} color="#ea580c" />
              </View>
            </View>
          </View>

          {loading ? (
            <View className="items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="mt-2 text-gray-500">Loading overview...</Text>
            </View>
          ) : error ? (
            <View className="items-center px-5 py-6 mx-4 my-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <View className="items-center justify-center w-12 h-12 mb-3 rounded-full shadow-sm bg-red-50">
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
              </View>

              <Text className="mb-2 text-lg font-semibold text-center text-gray-800">
                Something went wrong
              </Text>

              <Text className="mb-4 text-sm leading-5 text-center text-gray-500">
                {error ||
                  "Unable to load data. Please check your connection and try again."}
              </Text>

              <TouchableOpacity
                onPress={onRefresh}
                className="bg-blue-600 px-5 py-2.5 rounded-lg flex-row items-center"
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-sm font-semibold text-white">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="flex-row flex-wrap gap-4 mb-6">
                {/* Total Earnings */}
                <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <MaterialIcons
                      name="attach-money"
                      size={24}
                      color="#f59e0b"
                    />
                    <Text className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalEarnings)}
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-600">
                    Total Earnings
                  </Text>
                </View>

                {/* Total Orders */}
                <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Feather name="shopping-bag" size={24} color="#16a34a" />
                    <Text className="text-2xl font-bold text-gray-900">
                      {stats.totalOrders}
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-600">
                    Total Orders
                  </Text>
                </View>

                {/* Monthly Earnings */}
                <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <MaterialIcons
                      name="trending-up"
                      size={24}
                      color="#10b981"
                    />
                    <Text className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyEarnings)}
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-600">
                    This Month
                  </Text>
                </View>

                {/* Pending Orders */}
                <View className="flex-1 min-w-[45%] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <MaterialIcons
                      name="pending-actions"
                      size={24}
                      color="#f59e0b"
                    />
                    <Text className="text-2xl font-bold text-gray-900">
                      {stats.pendingOrders}
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </Text>
                </View>
              </View>

              <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-semibold text-gray-900">
                      Average Order Value
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Based on all completed orders
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="calculator"
                      size={24}
                      color="#6366f1"
                    />
                    <Text className="ml-2 text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.averageOrderValue)}
                    </Text>
                  </View>
                </View>
              </View>

              {stats.topProducts && stats.topProducts.length > 0 && (
                <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <Text className="mb-4 text-lg font-semibold text-gray-900">
                    Top Selling Products
                  </Text>
                  {stats.topProducts.slice(0, 3).map((product, index) => (
                    <View
                      key={index}
                      className="flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg last:mb-0"
                    >
                      <View className="items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-lg">
                        <Text className="font-bold text-orange-600">
                          #{index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="font-medium text-gray-900"
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {product.total_sold} sold
                        </Text>
                      </View>
                      <Text className="font-semibold text-green-600">
                        {formatCurrency(product.total_revenue)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Text className="mb-4 text-lg font-semibold text-gray-900">
                  Quick Actions
                </Text>

                <TouchableOpacity
                  className="flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg"
                  onPress={() => navigation.navigate("SellerProducts")}
                >
                  <View className="items-center justify-center w-10 h-10 mr-3 bg-purple-100 rounded-lg">
                    <Feather name="package" size={20} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      Manage Products
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Add or edit your product listings
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg"
                  onPress={() => navigation.navigate("SellerOrders")}
                >
                  <View className="items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                    <MaterialIcons
                      name="assignment"
                      size={20}
                      color="#16a34a"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      View Orders
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Check orders ready for processing
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-3 border border-gray-200 rounded-lg"
                  onPress={() => navigation.navigate("SellerAnalytics")}
                >
                  <View className="items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                    <Ionicons name="analytics" size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      View Analytics
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Detailed sales and performance data
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SellerOverviewScreen;
