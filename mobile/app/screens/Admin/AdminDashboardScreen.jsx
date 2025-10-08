"use client";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import AdminOverviewScreen from "./tabs/AdminOverviewScreen";
import AdminSellerApplicationsScreen from "./tabs/AdminSellerApplicationsScreen";
import AdminDeliveryApplicationsScreen from "./tabs/AdminDeliveryApplicationsScreen";
import AdminSettingsScreen from "./tabs/AdminSettingsScreen";

const Tab = createBottomTabNavigator();

const AdminDashboardScreen = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = Ionicons;

          if (route.name === "Home") {
            IconComponent = Ionicons;
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Sellers") {
            IconComponent = Ionicons;
            iconName = focused ? "storefront" : "storefront-outline";
          } else if (route.name === "Delivery") {
            IconComponent = MaterialCommunityIcons;
            iconName = focused ? "truck" : "truck-outline";
          } else if (route.name === "Account") {
            IconComponent = Ionicons;
            iconName = focused ? "person" : "person-outline";
          }

          return <IconComponent name={iconName} size={30} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#39B54A",
          borderTopColor: "#39B54A",
          borderTopWidth: 1,
          height: 100,
          paddingTop: 15,
        },
        tabBarLabelStyle: {
          fontSize: 13,
        },
      })}
    >
      <Tab.Screen name="Home" component={AdminOverviewScreen} />
      <Tab.Screen name="Sellers" component={AdminSellerApplicationsScreen} />
      <Tab.Screen name="Delivery" component={AdminDeliveryApplicationsScreen} />
      <Tab.Screen name="Account" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
};

export default AdminDashboardScreen;
