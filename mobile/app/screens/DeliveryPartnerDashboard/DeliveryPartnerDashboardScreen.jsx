"use client";

import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../../context/AuthContext";
import { useDeliveryPartner } from "../../context/DeliveryPartnerContext";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import { StatusBar } from "expo-status-bar";

// Import tab screens
import DeliveryPartnerHomeScreen from "./tabs/DeliveryPartnerHomeScreen";
import DeliveryPartnerDeliveriesScreen from "./tabs/DeliveryPartnerDeliveriesScreen";
import DeliveryPartnerHistoryScreen from "./tabs/DeliveryPartnerHistoryScreen";
import DeliveryPartnerAccountScreen from "./tabs/DeliveryPartnerAccountScreen";

const Tab = createBottomTabNavigator();

const DeliveryPartnerDashboardScreen = ({ navigation }) => {
  const { token, logout } = useAuth();
  const {
    enterDeliveryDashboard,
    exitDeliveryDashboard,
    setDeliveryPartnerId,
  } = useDeliveryPartner();

  const [deliveryPartnerProfile, setDeliveryPartnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enterDeliveryDashboard();
    fetchDeliveryPartnerProfile();

    return () => {
      exitDeliveryDashboard();
    };
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
        setDeliveryPartnerId(response.data.data.id);
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

  const handleSwitchToCustomerView = () => {
    Alert.alert(
      "Switch to Customer View",
      "Do you want to switch to the regular customer dashboard?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Switch",
          onPress: async () => {
            navigation.replace("Dashboard");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <StatusBar style="light" />
        <Text className="text-gray-500">
          Loading delivery partner dashboard...
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Tab Navigator with updated UI */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Deliveries") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "History") {
              iconName = focused ? "time" : "time-outline";
            } else if (route.name === "Account") {
              iconName = focused ? "person" : "person-outline";
            }

            return <Ionicons name={iconName} size={30} color={color} />;
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
        <Tab.Screen
          name="Home"
          component={DeliveryPartnerHomeScreen}
          initialParams={{ deliveryPartnerProfile }}
        />
        <Tab.Screen
          name="Deliveries"
          component={DeliveryPartnerDeliveriesScreen}
        />
        <Tab.Screen name="History" component={DeliveryPartnerHistoryScreen} />
        <Tab.Screen name="Account">
          {(props) => (
            <DeliveryPartnerAccountScreen
              {...props}
              deliveryPartnerProfile={deliveryPartnerProfile}
              onProfileUpdate={fetchDeliveryPartnerProfile}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
};

export default DeliveryPartnerDashboardScreen;
