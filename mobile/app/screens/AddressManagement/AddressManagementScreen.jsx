"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";

import Feather from "@expo/vector-icons/Feather";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const AddressManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/addresses`);
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAddresses(false);
  };

  const handleDeleteAddress = (address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete this address?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${API_URL}/api/addresses/${address.id}`
              );
              if (response.data.success) {
                Alert.alert("Success", "Address deleted successfully");
                fetchAddresses();
              }
            } catch (error) {
              console.error("Error deleting address:", error);
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/addresses/${addressId}`,
        { is_default: true }
      );
      if (response.data.success) {
        Alert.alert("Success", "Default address updated");
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      Alert.alert("Error", "Failed to set default address");
    }
  };

  const openEditModal = (address) => {
    navigation.navigate("EditAddress", { address });
  };

  const formatAddressType = (type) => {
    const typeMap = {
      home: "Home",
      work: "Work",
      other: "Other",
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">My Addresses</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation />
          <Text className="mt-4 text-gray-600">Loading addresses...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">My Addresses</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("AddNewAddress")}>
          <Feather name="plus" size={24} color="#EA580C" />
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="items-center justify-center flex-1 px-6">
            <Feather name="map-pin" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              No addresses found
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Add your first delivery address to get started
            </Text>
            <TouchableOpacity
              className="px-6 py-3 mt-4 bg-orange-600 rounded-lg"
              onPress={() => navigation.navigate("AddNewAddress")}
            >
              <Text className="font-semibold text-white">Add Address</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {addresses.map((address) => (
            <View
              key={address.id}
              className="p-4 mb-4 bg-white border border-gray-200 rounded-lg"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-900">
                  {address.recipient_name}
                </Text>
                <View className="flex-row items-center">
                  {address.is_default === 1 && (
                    <View className="px-2 py-1 mr-2 bg-green-100 rounded">
                      <Text className="text-xs font-medium text-green-800">
                        Default
                      </Text>
                    </View>
                  )}
                  <View className="px-2 py-1 bg-gray-100 rounded">
                    <Text className="text-xs font-medium text-gray-800">
                      {formatAddressType(address.address_type)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-gray-600">{address.phone_number}</Text>
              <Text className="mt-1 text-gray-700">
                {address.street_address}, {address.barangay}
              </Text>
              <Text className="text-gray-700">
                {address.city}, {address.province} {address.postal_code}
              </Text>
              {address.landmark && (
                <Text className="text-sm text-gray-500">
                  Landmark: {address.landmark}
                </Text>
              )}

              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row">
                  <TouchableOpacity
                    className="px-3 py-2 mr-2 border border-gray-300 rounded-lg"
                    onPress={() => openEditModal(address)}
                  >
                    <Text className="text-sm font-medium text-gray-700">
                      Edit
                    </Text>
                  </TouchableOpacity>

                  {address.is_default !== 1 && (
                    <TouchableOpacity
                      className="px-3 py-2 mr-2 border border-orange-600 rounded-lg"
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Text className="text-sm font-medium text-orange-600">
                        Set Default
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleDeleteAddress(address)}
                >
                  <Feather name="trash-2" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default AddressManagementScreen;
