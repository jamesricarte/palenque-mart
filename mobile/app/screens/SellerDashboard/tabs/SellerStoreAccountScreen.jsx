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

import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/apiConfig";
import { useFocusEffect } from "@react-navigation/native";

const SellerStoreAccountScreen = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchSellerData();
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
    <View className="flex-1">
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-semibold">Seller Account</Text>
        </View>

        {/* Store Profile Section */}
        {sellerData && (
          <TouchableOpacity
            className="p-6 mt-4 bg-white border-b border-gray-200"
            onPress={() => navigation.navigate("EditStoreProfile")}
          >
            <View className="flex flex-row items-center gap-4 mb-4">
              {sellerData.storeLogoUrl ? (
                <Image
                  source={{ uri: sellerData.storeLogoUrl }}
                  className="w-16 h-16 rounded-full"
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              ) : (
                <View className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <FontAwesome6 name="store" size={24} color="#3b82f6" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-xl font-semibold">
                  {sellerData.storeName || "Your Store"}
                </Text>
                <Text className="text-sm text-gray-600 capitalize">
                  {sellerData.accountType} Account
                </Text>
                <View className="flex flex-row items-center mt-1">
                  <View
                    className={`w-2 h-2 mr-2 rounded-full ${sellerData.isActive ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <Text
                    className={`text-sm font-medium ${sellerData.isActive ? "text-green-600" : "text-red-600"}`}
                  >
                    {sellerData.isActive ? "Active Seller" : "Inactive Seller"}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="gray" />
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View className="p-6 bg-white border-b border-gray-200">
          <Text className="mb-4 text-lg font-semibold">Quick Actions</Text>

          <TouchableOpacity className="flex flex-row items-center gap-4 p-4 mb-3 border border-gray-200 rounded-lg">
            <Feather name="settings" size={20} color="black" />
            <View className="flex-1">
              <Text className="font-medium">Store Settings</Text>
              <Text className="text-sm text-gray-600">
                Manage store preferences
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center gap-4 p-4 border border-gray-200 rounded-lg">
            <Feather name="help-circle" size={20} color="black" />
            <View className="flex-1">
              <Text className="font-medium">Seller Support</Text>
              <Text className="text-sm text-gray-600">
                Get help with selling
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Switch to Customer Dashboard */}
        <TouchableOpacity
          className="bg-white border-b border-gray-200"
          onPress={handleSwitchToCustomerDashboard}
        >
          <View className="flex flex-row items-center gap-4 p-6">
            <View className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <Feather name="shopping-bag" size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold">
                Switch to Customer View
              </Text>
              <Text className="text-sm text-gray-600">
                Browse and shop as a customer
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SellerStoreAccountScreen;
