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
import SellerStoreAccountScreen from "./tabs/SellerStoreAccountScreen";
import SellerChatScreen from "./tabs/SellerChatScreen";
import SellerLivestreamScreen from "./tabs/SellerLivestreamScreen";

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

  // ✅ Updated CustomTabBar UI to match customer Dashboard style
  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View
        className="flex-row"
        style={{
          backgroundColor: "#F16B44",
          borderTopColor: "#F16B44",
          borderTopWidth: 1,
          height: 100,
          paddingTop: 15,
          paddingBottom: 20,
        }}
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
              className="items-center justify-center flex-1"
            >
              <View className="items-center">
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    color: "#fff",
                    size: 30,
                    focused: isFocused,
                  })}
                <Text
                  className={`mt-1 text-[13px] ${
                    isFocused ? "text-white font-semibold" : "text-white"
                  }`}
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
        name="SellerLivestream"
        component={SellerLivestreamScreen}
        options={{
          title: "Live Selling",
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
        name="SellerChat"
        component={SellerChatScreen}
        options={{
          title: "Chat",
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
        name="Seller Products"
        component={SellerProductsScreen}
        options={{
          title: "Products",
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name={focused ? "package" : "box"}
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SellerStoreAccount"
        component={SellerStoreAccountScreen}
        options={{
          title: "Store",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "storefront" : "storefront-outline"}
              size={30}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default SellerDashboard;
