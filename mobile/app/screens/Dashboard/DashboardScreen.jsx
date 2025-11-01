"use client";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
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
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: !user
          ? { display: "none" }
          : {
              backgroundColor:
                route.name === "Live Selling" ? "#000000" : "#F16B44",
              borderTopColor:
                route.name === "Live Selling" ? "#000000" : "#F16B44",
              borderTopWidth: 1,
              height: 100, // 👈 increase this value to make the tab bar taller
              paddingTop: 15,
            },
        tabBarLabelStyle: {
          fontSize: 13,
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
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Live Selling"
        component={LiveStreamingScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "videocam" : "videocam-outline"}
              size={31}
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
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={30}
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
              size={30}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DashboardScreen;
