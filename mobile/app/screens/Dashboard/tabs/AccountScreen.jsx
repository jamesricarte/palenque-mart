"use client";

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import axios from "axios";

import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/apiConfig";
import DefaultLoadingAnimation from "../../../components/DefaultLoadingAnimation";
import Snackbar from "../../../components/Snackbar";

const AccountScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const route = useRoute();

  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const navigationOptions = [
    {
      id: "orders",
      title: "My Orders",
      subtitle: "Track your order history",
      icon: "receipt-outline",
      iconType: "ionicon",
      onPress: () => navigation.navigate("Orders"),
    },
    {
      id: "preorders",
      title: "My Pre-Orders",
      subtitle: "Track your pre-order items",
      icon: "time-outline",
      iconType: "ionicon",
      onPress: () => navigation.navigate("PreOrders"),
    },
    {
      id: "partnership",
      title: "Partnership Options",
      subtitle: "Become a seller or delivery partner",
      icon: "storefront-outline",
      iconType: "material-community-icon",
      onPress: () => navigation.navigate("PartnershipOptions"),
    },
  ];

  const accountOptions = [
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: "help-circle-outline",
      iconType: "ionicon",
      onPress: () => console.log("Help pressed"),
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "Manage app settings",
      icon: "settings-outline",
      iconType: "ionicon",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      id: "logout",
      title: "Logout",
      subtitle: "Sign out your account",
      icon: "log-out",
      iconType: "feather",
      onPress: () => handleLogoutClick(),
      isDestructive: true,
    },
  ];

  const renderIcon = (iconName, iconType, color = "#374151", size = 20) => {
    switch (iconType) {
      case "ionicon":
        return <Ionicons name={iconName} size={size} color={color} />;
      case "feather":
        return <Feather name={iconName} size={size} color={color} />;
      case "material":
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case "material-community-icon":
        return (
          <MaterialCommunityIcons name={iconName} size={size} color={color} />
        );
      default:
        return <Feather name="circle" size={size} color={color} />;
    }
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
    setLogoutLoading(true);
    setTimeout(() => {
      setLogoutLoading(false);
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
    }, 2000);
  };

  const handleLikePress = () => {
    Alert.alert("Likes Feature", "Likes feature will be implented soon!");
  };

  const fetchCartCount = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/api/cart/count`);
      if (response.data.success) {
        setCartCount(response.data.data.uniqueItems);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchCartCount();
        setLoading(false);
      } else {
        setCartCount(0);
      }
    }, [user])
  );

  useEffect(() => {
    if (route.params?.message) {
      setSnackBarVisible(true);
    }
  }, []);

  if (loading) {
    return (
      <View className="h-screen bg-white">
        {/* Header */}
        <View className="px-4 pt-16 pb-6 bg-white border-b border-gray-200">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-2xl font-semibold text-gray-900">
              Account
            </Text>
            <View className="flex flex-row gap-4">
              <TouchableOpacity
                onPress={() => navigation.navigate("Cart")}
                className="relative p-2"
              >
                <Ionicons name="bag-outline" size={24} color="black" />
                {cartCount > 0 && (
                  <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-1 -right-1">
                    <Text className="text-xs font-bold text-white">
                      {cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings")}
                className="p-2"
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#F16B44" />
          <Text className="mt-4 text-gray-500">
            Loading user information...
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 pt-16 pb-6 bg-white border-b border-gray-200">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-2xl font-semibold text-gray-900">
              Account
            </Text>
            <View className="flex flex-row gap-4">
              <TouchableOpacity
                onPress={() => navigation.navigate("Cart")}
                className="relative p-2"
              >
                <Ionicons name="bag-outline" size={24} color="black" />
                {cartCount > 0 && (
                  <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-1 -right-1">
                    <Text className="text-xs font-bold text-white">
                      {cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings")}
                className="p-2"
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Login Required */}
        <View className="items-center justify-center flex-1 px-6">
          <Feather name="user" size={80} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Login Required
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Please login to access your account
          </Text>
          <TouchableOpacity
            className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="font-semibold text-white">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white mt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-semibold">My Account</Text>
          <View className="flex-row gap-0.5">
            <TouchableOpacity className="p-2 mr-2" onPress={handleLikePress}>
              <Ionicons name="heart-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Cart")}
              className="relative p-2"
            >
              <Ionicons name="bag-outline" size={24} color="black" />
              {cartCount > 0 && (
                <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-1 -right-1">
                  <Text className="text-xs font-bold text-white">
                    {cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <TouchableOpacity
          className="flex flex-row items-center p-4 mx-4 bg-white border border-gray-200 shadow-sm rounded-xl"
          onPress={() => navigation.navigate("Profile")}
        >
          <View className="flex items-center justify-center w-16 h-16 mr-4 overflow-hidden bg-orange-100 rounded-full">
            {user?.profile_picture ? (
              <Image
                source={{
                  uri: user.profile_picture,
                }}
                className="w-full h-full"
                style={{ resizeMode: "cover" }}
              />
            ) : (
              <Feather name="user" size={32} color="#FF5C00" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-sm text-gray-600">
              {user.email ? user.email : user.phone}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>

        {/* Main Navigation Options */}
        <View className="mx-4 mt-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Quick Actions
            </Text>
          </View>

          {navigationOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center p-4 ${
                index !== navigationOptions.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View className="flex items-center justify-center w-10 h-10 mr-4 bg-orange-100 rounded-full">
                {renderIcon(option.icon, option.iconType, "#EA580C", 20)}
              </View>

              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {option.title}
                </Text>
                <Text className="text-sm text-gray-500">{option.subtitle}</Text>
              </View>

              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Options */}
        <View className="mx-4 mt-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Account Options
            </Text>
          </View>

          {accountOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center p-4 ${
                index !== accountOptions.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View
                className={`flex items-center justify-center w-10 h-10 mr-4 rounded-full ${
                  option.isDestructive ? "bg-red-100" : "bg-gray-100"
                }`}
              >
                {renderIcon(
                  option.icon,
                  option.iconType,
                  option.isDestructive ? "#DC2626" : "#374151",
                  20
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={`text-base font-medium ${option.isDestructive ? "text-red-600" : "text-gray-900"}`}
                >
                  {option.title}
                </Text>
                <Text className="text-sm text-gray-500">{option.subtitle}</Text>
              </View>

              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <DefaultLoadingAnimation visible={logoutLoading} version={2} />

      <Snackbar
        visible={snackBarVisible}
        onDismiss={setSnackBarVisible}
        text={route.params?.message}
      />
    </View>
  );
};

export default AccountScreen;
