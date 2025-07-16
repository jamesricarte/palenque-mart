"use client";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";

import AdminOverviewScreen from "./tabs/AdminOverviewScreen";
import AdminSellerApplicationsScreen from "./tabs/AdminSellerApplicationsScreen";
import AdminDeliveryApplicationsScreen from "./tabs/AdminDeliveryApplicationsScreen";
import AdminSettingsScreen from "./tabs/AdminSettingsScreen";

const Tab = createBottomTabNavigator();

const AdminDashboardScreen = () => {
  return (
    <Tab.Navigator
      initialRouteName="Overview"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#dc2626",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
        },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={AdminOverviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sellers"
        component={AdminSellerApplicationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="store" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Delivery"
        component={AdminDeliveryApplicationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="truck" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="admin-panel-settings"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminDashboardScreen;
