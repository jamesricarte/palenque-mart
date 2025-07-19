"use client";

import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";

import DefaultLoadingAnimation from "../../../components/DefaultLoadingAnimation";
import Snackbar from "../../../components/Snackbar";

import { useAuth } from "../../../context/AuthContext";

const AccountScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const route = useRoute();

  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const orderCategories = [
    { icon: "package", label: "To Pay", count: 2 },
    { icon: "truck", label: "To Ship", count: 1 },
    { icon: "box", label: "To Receive", count: 0 },
    { icon: "star", label: "To Rate", count: 3 },
  ];

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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Dashboard",
            params: {
              screen: "Home",
            },
          },
        ],
      });
      logout();
    }, 3000);
  };

  useEffect(() => {
    if (route.params?.message) {
      setSnackBarVisible(true);
    }
  }, []);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex gap-5 px-6 pt-16 pb-5 bg-white border-b border-gray-300">
          <View className="flex flex-row justify-end gap-5">
            <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
              <Feather name="shopping-cart" size={22} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
              <Feather name="settings" size={22} color="black" />
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          {user ? (
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <View className="flex flex-row items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <MaterialIcons name="account-circle" size={50} color="black" />
                <View className="flex-1">
                  <Text className="text-lg font-semibold">
                    {user.first_name} {user.last_name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {user.email ? user.email : user.phone}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="gray" />
              </View>
            </TouchableOpacity>
          ) : (
            <View className="flex flex-row justify-center gap-8 pt-5">
              <TouchableOpacity
                className="px-3 py-2 border border-black rounded-xl"
                onPress={() => navigation.push("Login")}
              >
                <Text className="text-xl">Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-3 py-2 bg-black rounded-xl"
                onPress={() => navigation.push("SignUp")}
              >
                <Text className="text-xl text-white">Sign up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Orders Section */}
        <View className="p-6 mt-4 bg-white border-b border-gray-200">
          <View className="flex flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold">My Orders</Text>
            <TouchableOpacity>
              <Text className="text-black">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row justify-between">
            {orderCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                className="flex items-center flex-1"
              >
                <View className="relative">
                  <View className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-lg">
                    <Feather name={category.icon} size={20} color="black" />
                  </View>
                  {category.count > 0 && (
                    <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
                      <Text className="text-xs font-bold text-white">
                        {category.count}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="mt-2 text-xs text-center text-gray-700">
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Partnership Section */}
        <TouchableOpacity
          className="bg-white border-b border-gray-200"
          onPress={() => navigation.navigate("PartnershipOptions")}
        >
          <View className="flex flex-row items-center gap-4 p-6">
            <FontAwesome6 name="store" size={22} color="black" />
            <View className="flex-1">
              <Text className="text-lg font-semibold">Partnership Options</Text>
              <Text className="text-sm text-gray-600">
                Become a seller or partner
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </View>
        </TouchableOpacity>

        {/* Logout Section */}
        {user && (
          <View className="mt-4 mb-8 bg-white">
            <TouchableOpacity
              className="flex flex-row items-center gap-4 p-6"
              onPress={handleLogoutClick}
            >
              <AntDesign name="logout" size={20} color="#ef4444" />
              <Text className="flex-1 text-lg text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <DefaultLoadingAnimation visible={loading} version={2} />

      <Snackbar
        visible={snackBarVisible}
        onDismiss={setSnackBarVisible}
        text={route.params?.message}
      />
    </View>
  );
};

export default AccountScreen;
