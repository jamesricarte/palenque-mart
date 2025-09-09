"use client";

import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useSeller } from "../../context/SellerContext";
import { API_URL } from "../../config/apiConfig";

import SellerOverviewScreen from "./tabs/SellerHomeScreen";
import SellerProductsScreen from "./tabs/SellerProductsScreen";
import SellerOrdersScreen from "./tabs/SellerOrdersScreen";
import SellerStoreAccountScreen from "./tabs/SellerStoreAccountScreen";
import SellerChatScreen from "./tabs/SellerChatScreen";
import CreateLivestreamScreen from "./tabs/CreateLivestreamScreen";

const Tab = createBottomTabNavigator();

const SellerDashboard = ({ navigation }) => {
  const {
    enterSellerDashboard,
    exitSellerDashboard,
    setTriggerWebSocket,
    refreshOrdersData,
    setSellerId,
  } = useSeller();

  useEffect(() => {
    enterSellerDashboard();
    fetchSellerData();
    fetchOrders();

    return () => {
      exitSellerDashboard();
    };
  }, []);

  useEffect(() => {
    if (refreshOrdersData) fetchOrders();
  }, [refreshOrdersData]);

  const fetchSellerData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/store-profile`);

      if (response.data.success) {
        setSellerId(response.data.data.id);
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/orders`, {
        params: { status: "all" },
      });

      if (response.data.success) {
        setTriggerWebSocket(true);
      }
    } catch (error) {
      console.error(
        "Error fetching orders:",
        error.response?.data || error.message
      );
    }
  };

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View
        className="flex-row bg-white border-t border-gray-200"
        style={{ height: 80 }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="items-center justify-center flex-1 py-2"
            >
              <View className="items-center">
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    color: isFocused ? "#1e40af" : "#6b7280",
                    size: 24,
                  })}
                <Text
                  className={`text-xs mt-1 ${isFocused ? "text-blue-600" : "text-gray-500"}`}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="SellerOverview"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="SellerOverview"
        component={SellerOverviewScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SellerProducts"
        component={SellerProductsScreen}
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Feather name="package" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateLivestream"
        component={CreateLivestreamScreen}
        options={{
          title: "Live",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SellerOrders"
        component={SellerOrdersScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SellerChat"
        component={SellerChatScreen}
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SellerStoreAccount"
        component={SellerStoreAccountScreen}
        options={{
          title: "Store Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="storefront-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default SellerDashboard;
