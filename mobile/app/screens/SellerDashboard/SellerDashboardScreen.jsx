"use client";

import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useSeller } from "../../context/SellerContext";
import { API_URL } from "../../config/apiConfig";

import SellerOverviewScreen from "./tabs/SellerOverviewScreen";
import SellerProductsScreen from "./tabs/SellerProductsScreen";
import SellerOrdersScreen from "./tabs/SellerOrdersScreen";
import SellerStoreAccountScreen from "./tabs/SellerStoreAccountScreen";
import SellerChatScreen from "./tabs/SellerChatScreen";
import SellerAnalyticsScreen from "./tabs/SellerAnalyticsScreen";

const Tab = createBottomTabNavigator();

const SellerDashboard = () => {
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
        // triggerWebSocket &&
        //   console.log("triggered WebSocket from Seller Dashboard Screen");
        setTriggerWebSocket(true);
      }
    } catch (error) {
      console.error(
        "Error fetching orders:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="SellerOverview"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1e40af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
        },
      }}
    >
      <Tab.Screen
        name="SellerOverview"
        component={SellerOverviewScreen}
        options={{
          title: "Overview",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
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
        name="SellerAnalytics"
        component={SellerAnalyticsScreen}
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
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
