"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useState, useCallback } from "react";
import axios from "axios";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/apiConfig";
import { useFocusEffect } from "@react-navigation/native";

const SellerStoreAccountScreen = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchSellerData();
      fetchOrderCount();
    }, [])
  );

  const fetchSellerData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/store-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSellerData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setOrderCount(response.data.data.totalOrders);
      }
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

  const handleSwitchToCustomerDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Dashboard",
          state: {
            routes: [
              {
                name: "Account",
              },
            ],
          },
        },
      ],
    });
  };

  const handleLogoutClick = () => {
    Alert.alert(
      "Confirm logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => handleLogout() },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Dashboard" }],
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-semibold">Seller Account</Text>
        </View>
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">Loading seller information...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 mt-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-semibold">My Store</Text>
          <View className="flex-row gap-0.5">
            <TouchableOpacity
              onPress={() => navigation.push("SellerOrders")}
              className="relative p-2"
            >
              <Feather name="shopping-bag" size={24} color="black" />
              {orderCount > 0 && (
                <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-1 -right-1">
                  <Text className="text-xs font-bold text-white">
                    {orderCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Store Profile Section */}
      {sellerData && (
        <TouchableOpacity
          className="flex flex-row items-center p-4 mx-4 bg-white border border-gray-200 shadow-sm rounded-xl"
          onPress={() => navigation.navigate("EditStoreProfile")}
        >
          <View className="flex flex-row items-center flex-1 gap-4">
            {sellerData.storeLogoUrl ? (
              <Image
                source={{ uri: sellerData.storeLogoUrl }}
                className="w-16 h-16 rounded-full"
                style={{ resizeMode: "cover" }}
              />
            ) : (
              <View className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <FontAwesome6 name="store" size={24} color="#3b82f6" />
              </View>
            )}

            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {sellerData.storeName || "Your Store"}
              </Text>
              <Text className="text-sm text-gray-600 capitalize">
                {sellerData.accountType} Account
              </Text>

              <View className="flex flex-row items-center mt-1">
                <View
                  className={`w-2 h-2 mr-2 rounded-full ${
                    sellerData.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <Text
                  className={`text-sm font-medium ${
                    sellerData.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {sellerData.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>

          <Feather name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View className="mx-4 mt-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-lg font-semibold text-gray-900">
            Quick Actions
          </Text>
        </View>

        {/* Store Settings */}
        <TouchableOpacity
          className="flex-row items-center p-4 border-b border-gray-100"
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <View className="flex items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
            <Ionicons name="settings-outline" size={20} color="black" />
          </View>

          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900">
              Store Settings
            </Text>
            <Text className="text-sm text-gray-500">
              Manage store preferences
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Seller Support */}
        <TouchableOpacity
          className="flex-row items-center p-4"
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <View className="flex items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
            <Ionicons name="help-circle-outline" size={20} color="black" />
          </View>

          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900">
              Help & Support
            </Text>
            <Text className="text-sm text-gray-500">Get help with selling</Text>
          </View>

          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Switch to Customer Dashboard */}
        <TouchableOpacity
          className="flex-row items-center p-4"
          onPress={handleSwitchToCustomerDashboard}
          activeOpacity={0.7}
        >
          <View className="flex items-center justify-center w-10 h-10 mr-4 bg-orange-100 rounded-full">
            <FontAwesome6 name="arrows-rotate" size={20} color="#EA580C" />
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
  );
};

export default SellerStoreAccountScreen;
