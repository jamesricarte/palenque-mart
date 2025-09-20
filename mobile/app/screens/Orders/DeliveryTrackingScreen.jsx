"use client";

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker } from "react-native-maps";

import { useAuth } from "../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../../config/apiConfig";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const DeliveryTrackingScreen = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const {
    orderId,
    orderNumber,
    deliveryPartnerId,
    deliveryPartnerName,
    deliveryPartnerPhone,
    deliveryAddress,
    conversationId,
    deliveryPartnerProfilePicture,
    deliveryStatus,
    deliveryPartnerLocation,
    deliveryLocation,
  } = route.params;

  const [loading, setLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [deliveryPartnerCoordinates, setDeliveryPartnerCoordinates] =
    useState(null);

  const [deliveryPartnerUnreadCount, setDeliveryPartnerUnreadCount] =
    useState(0);

  useEffect(() => {
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (deliveryPartnerId && orderId) {
        fetchDeliveryPartnerUnreadCount();
      }
    }, [deliveryPartnerId, orderId])
  );

  useEffect(() => {
    if (Object.values(deliveryPartnerLocation).every(Boolean)) {
      setDeliveryPartnerCoordinates({
        latitude: Number.parseFloat(deliveryPartnerLocation.latitude),
        longitude: Number.parseFloat(deliveryPartnerLocation.longitude),
      });
    }
  }, [deliveryPartnerLocation]);

  const fetchDeliveryPartnerUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/unread-count?userId=${user.id}&userType=user&orderId=${orderId}`
      );

      if (response.data.success) {
        setDeliveryPartnerUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleCallDeliveryPartner = () => {
    Alert.alert(
      "Call Delivery Partner",
      `Call ${deliveryPartnerName} at ${deliveryPartnerPhone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Alert.alert(
              "Call Feature",
              "Phone call functionality would be implemented here"
            );
          },
        },
      ]
    );
  };

  const handleMessageDeliveryPartner = () => {
    navigation.navigate("UserDeliveryPartnerChat", {
      conversationId,
      orderId,
      orderNumber,
      deliveryPartnerId,
      deliveryPartnerName,
      deliveryPartnerPhone,
      deliveryPartnerProfilePicture,
      deliveryStatus,
    });
  };

  const mapRegion = deliveryPartnerCoordinates
    ? {
        latitude:
          (Number(deliveryLocation.latitude) +
            deliveryPartnerCoordinates.latitude) /
          2,
        longitude:
          (Number(deliveryLocation.longitude) +
            deliveryPartnerCoordinates.longitude) /
          2,
        latitudeDelta:
          Math.abs(
            Number(deliveryLocation.latitude) -
              deliveryPartnerCoordinates.latitude
          ) *
            2 +
          0.01,
        longitudeDelta:
          Math.abs(
            Number(deliveryLocation.longitude) -
              deliveryPartnerCoordinates.longitude
          ) *
            2 +
          0.01,
      }
    : {
        latitude: Number(deliveryLocation.latitude),
        longitude: Number(deliveryLocation.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="mt-4 text-gray-600">Loading delivery tracking...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Track Delivery</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View className="flex-1">
        {deliveryLocation && deliveryPartnerCoordinates ? (
          <View className="relative flex-1">
            <MapView style={{ flex: 1 }} region={mapRegion}>
              {/* Delivery Location Marker */}
              <Marker
                coordinate={{
                  latitude: deliveryLocation.latitude,
                  longitude: deliveryLocation.longitude,
                }}
                title="Delivery Location"
                description="Your delivery address"
                pinColor="#EF4444"
              />

              {/* Delivery Partner Location Marker */}
              {deliveryPartnerCoordinates && (
                <Marker
                  coordinate={deliveryPartnerCoordinates}
                  title="Delivery Partner"
                  description={`${deliveryPartnerName} is here`}
                  pinColor="#06B6D4"
                />
              )}
            </MapView>
          </View>
        ) : deliveryLocation ? (
          <View className="relative flex-1">
            <MapView
              style={{ flex: 1 }}
              region={{
                latitude: deliveryLocation.latitude,
                longitude: deliveryLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {/* Delivery Location Marker */}
              <Marker
                coordinate={{
                  latitude: deliveryLocation.latitude,
                  longitude: deliveryLocation.longitude,
                }}
                title="Delivery Location"
                description="Your delivery address"
                pinColor="#EF4444"
              />
            </MapView>

            {/* Info card for missing delivery partner location */}
            <View className="absolute left-0 right-0 p-4 mx-4 bg-white rounded-lg bottom-4">
              <Text className="text-sm text-gray-600">
                Waiting for delivery partner location...
              </Text>
            </View>
          </View>
        ) : (
          <View className="items-center justify-center flex-1 bg-gray-200">
            <MaterialCommunityIcons name="map" size={80} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-semibold text-gray-600">
              Live Map Tracking
            </Text>
            <Text className="px-6 mt-2 text-center text-gray-500">
              Waiting for location data...
            </Text>
          </View>
        )}
      </View>

      {/* Order Info Card */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="p-4 mb-4 rounded-lg bg-orange-50">
          <Text className="mb-1 text-lg font-semibold text-orange-800">
            Order #{orderNumber}
          </Text>
          <Text className="text-sm text-orange-600">
            Your order is on the way!
          </Text>
        </View>

        {/* Delivery Address */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-gray-600">
            Delivery Address:
          </Text>
          <Text className="text-gray-900">
            {deliveryAddress.street}, {deliveryAddress.barangay}
          </Text>
          <Text className="text-gray-900">
            {deliveryAddress.city}, {deliveryAddress.province}
          </Text>
        </View>

        {/* Delivery Partner Info */}
        <View className="flex-row items-center justify-between p-3 mb-4 rounded-lg bg-gray-50">
          <View className="flex-row items-center flex-1">
            <View className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-full">
              {deliveryPartnerProfilePicture ? (
                <Image
                  source={{ uri: deliveryPartnerProfilePicture }}
                  className="w-10 h-10 mr-3 rounded-full"
                />
              ) : (
                <View className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-full">
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color="#059669"
                  />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">
                {deliveryPartnerName}
              </Text>
              <Text className="text-sm text-gray-600">Delivery Partner</Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="relative">
              <TouchableOpacity
                className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full"
                onPress={handleMessageDeliveryPartner}
              >
                <Feather name="message-circle" size={18} color="#2563EB" />
              </TouchableOpacity>
              {deliveryPartnerUnreadCount > 0 && (
                <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                  <Text className="text-xs font-bold text-white">
                    {deliveryPartnerUnreadCount > 99
                      ? "99+"
                      : deliveryPartnerUnreadCount}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              className="p-2 bg-green-100 rounded-full"
              onPress={handleCallDeliveryPartner}
            >
              <Feather name="phone" size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DeliveryTrackingScreen;
