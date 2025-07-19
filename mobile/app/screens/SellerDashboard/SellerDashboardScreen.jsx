"use client";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import SellerOverviewScreen from "./tabs/SellerOverviewScreen";
import SellerProductsScreen from "./tabs/SellerProductsScreen";
import SellerOrdersScreen from "./tabs/SellerOrdersScreen";
import SellerStoreAccountScreen from "./tabs/SellerStoreAccountScreen";

const Tab = createBottomTabNavigator();

const SellerDashboard = () => {
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
        name="SellerStoreAccount"
        component={SellerStoreAccountScreen}
        options={{
          title: "Store Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default SellerDashboard;
