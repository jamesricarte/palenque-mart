"use client";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import HomeScreen from "./tabs/HomeScreen";
import LiveStreamingScreen from "./tabs/LiveStreamingScreen";
import ChatScreen from "./tabs/ChatScreen";
import AccountScreen from "./tabs/AccountScreen";
import NotificationsScreen from "./tabs/NotificationsScreen";

import { useAuth } from "../../context/AuthContext";

const Tab = createBottomTabNavigator();

const DashboardScreen = () => {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#F16B44",
        tabBarInactiveTintColor: "#8f8f8f",
        tabBarStyle: !user
          ? { display: "none" }
          : {
              backgroundColor: "#ffffff",
              borderTopColor: "#e5e7eb",
              borderTopWidth: 1,
            },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Live Streams"
        component={LiveStreamingScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name={focused ? "videocam" : "videocam"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DashboardScreen;
