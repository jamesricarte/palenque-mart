"use client";

import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";

// Import tab screens
import DeliveryPartnerOverviewScreen from "./tabs/DeliveryPartnerOverviewScreen";
import DeliveryPartnerOrdersScreen from "./tabs/DeliveryPartnerOrdersScreen";
import DeliveryPartnerHistoryScreen from "./tabs/DeliveryPartnerHistoryScreen";
import DeliveryPartnerAccountScreen from "./tabs/DeliveryPartnerAccountScreen";

const Tab = createBottomTabNavigator();

const DeliveryPartnerDashboardScreen = ({ navigation }) => {
  const { token, logout } = useAuth();
  const [deliveryPartnerProfile, setDeliveryPartnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryPartnerProfile();
  }, []);

  const fetchDeliveryPartnerProfile = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/delivery-partner/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDeliveryPartnerProfile(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching delivery partner profile:", error);
      if (error.response?.status === 404) {
        Alert.alert(
          "Profile Not Found",
          "Your delivery partner profile was not found. Please contact support.",
          [
            {
              text: "Go Back",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <Text className="text-gray-500">
          Loading delivery partner dashboard...
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-4 bg-green-600">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-white">
            Delivery Partner Dashboard
          </Text>
          <Text className="text-sm text-green-100">
            {deliveryPartnerProfile?.partner_id || "Loading..."}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="p-2 bg-green-700 rounded-lg"
        >
          <MaterialIcons name="logout" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigator */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            const IconComponent = Ionicons;

            if (route.name === "Overview") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Orders") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "History") {
              iconName = focused ? "time" : "time-outline";
            } else if (route.name === "Account") {
              iconName = focused ? "person" : "person-outline";
            }

            return <IconComponent name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#16a34a",
          tabBarInactiveTintColor: "#6b7280",
          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        })}
      >
        <Tab.Screen
          name="Overview"
          component={DeliveryPartnerOverviewScreen}
          initialParams={{ deliveryPartnerProfile }}
        />
        <Tab.Screen name="Orders" component={DeliveryPartnerOrdersScreen} />
        <Tab.Screen name="History" component={DeliveryPartnerHistoryScreen} />
        <Tab.Screen
          name="Account"
          component={(props) => (
            <DeliveryPartnerAccountScreen
              {...props}
              deliveryPartnerProfile={deliveryPartnerProfile}
              onProfileUpdate={fetchDeliveryPartnerProfile}
            />
          )}
        />
      </Tab.Navigator>
    </>
  );
};

export default DeliveryPartnerDashboardScreen;
