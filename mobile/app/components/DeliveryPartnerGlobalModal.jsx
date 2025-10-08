import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../context/AuthContext";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import axios from "axios";
import { API_URL } from "../config/apiConfig";

export default function DeliveryPartnerGlobalModal() {
  const { modalVisible, hideModal, modalData, refreshDeliveries } =
    useDeliveryPartner();
  const { token } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!modalData) return null;

  const handleUpdateStatus = (assignmentId, newStatus, statusText) => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${statusText.toLowerCase()} this delivery?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => updateDeliveryStatus(assignmentId, newStatus),
        },
      ]
    );
  };

  const updateDeliveryStatus = async (assignmentId, status) => {
    try {
      setIsUpdating(true);

      const response = await axios.put(
        `${API_URL}/api/delivery-partner/update-assignment-status`,
        { assignmentId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const statusPastTense = status === "accept" ? "accepted" : "declined";
        Alert.alert("Success", `Delivery ${statusPastTense} successfully!`);
        hideModal();
        refreshDeliveries();
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update delivery status"
        );
      }
    } catch (error) {
      console.error(
        "Error updating delivery status:",
        error.response?.data || error
      );
      Alert.alert(
        "Error",
        "Failed to update delivery status. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "looking_for_rider":
        return "bg-yellow-100 text-yellow-800";
      case "rider_assigned":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "looking_for_rider":
        return "Looking for Rider";
      case "rider_assigned":
        return "Rider Assigned";
      case "picked_up":
        return "Picked Up";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <Modal visible={modalVisible} transparent>
      <View className="items-center justify-center flex-1 px-4 bg-black/50">
        <View className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <TouchableOpacity
            onPress={hideModal}
            className="absolute z-10 p-2 top-3 right-3"
          >
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>

          <ScrollView className="max-h-[80vh]">
            <View className="p-4">
              <Text className="mb-3 text-xl font-bold text-gray-900">
                New Delivery Available!
              </Text>

              {/* Delivery Header */}
              <View className="flex gap-1 mb-5">
                <Text className="text-lg font-semibold text-gray-900">
                  {modalData.order_number}
                </Text>
                <View className="flex flex-row items-center gap-2">
                  <View
                    className={`px-3 py-1 rounded-full ${getStatusColor(modalData.delivery_status)}`}
                  >
                    <Text className="text-sm font-medium">
                      {getStatusText(modalData.delivery_status)}
                    </Text>
                  </View>
                  <View className="px-3 py-1 bg-green-100 rounded-full">
                    <Text className="text-sm font-medium text-green-800">
                      ₱{Number.parseFloat(modalData.delivery_fee).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Distance Badge */}
              {modalData.distance && (
                <View className="flex flex-row items-center mb-2">
                  <MaterialIcons name="near-me" size={16} color="#6b7280" />
                  <Text className="ml-1 text-sm text-gray-600">
                    {Number.parseFloat(modalData.distance).toFixed(1)} km away
                  </Text>
                </View>
              )}

              {/* Delivery Details */}
              <View className="mb-3">
                <View className="flex flex-row items-center mb-2">
                  <MaterialIcons
                    name="shopping-bag"
                    size={16}
                    color="#6b7280"
                  />
                  <Text className="ml-2 text-sm text-gray-600">
                    {modalData.item_count} item
                    {modalData.item_count !== 1 ? "s" : ""} • ₱
                    {Number.parseFloat(modalData.total_amount).toFixed(2)}
                  </Text>
                </View>

                <View className="flex flex-row items-start mb-2">
                  <MaterialIcons name="location-on" size={16} color="#ef4444" />
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-medium text-gray-900">
                      Pickup
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {modalData.pickup_address ||
                        "Pickup address not specified"}
                    </Text>
                  </View>
                </View>

                <View className="flex flex-row items-start mb-2">
                  <MaterialIcons name="location-on" size={16} color="#16a34a" />
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-medium text-gray-900">
                      Delivery
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {modalData.delivery_street_address},{" "}
                      {modalData.delivery_barangay}, {modalData.delivery_city}
                    </Text>
                    {modalData.delivery_landmark && (
                      <Text className="text-xs text-gray-500">
                        Landmark: {modalData.delivery_landmark}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex flex-row items-center">
                  <MaterialIcons name="person" size={16} color="#6b7280" />
                  <Text className="ml-2 text-sm text-gray-600">
                    {modalData.delivery_recipient_name} •{" "}
                    {modalData.delivery_phone_number}
                  </Text>
                </View>
              </View>

              {/* Special Instructions */}
              {modalData.special_instructions && (
                <View className="p-3 mb-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <Text className="text-sm font-medium text-yellow-800">
                    Special Instructions:
                  </Text>
                  <Text className="text-sm text-yellow-700">
                    {modalData.special_instructions}
                  </Text>
                </View>
              )}

              {/* Delivery Notes */}
              {modalData.delivery_notes && (
                <View className="p-3 mb-3 border border-blue-200 rounded-lg bg-blue-50">
                  <Text className="text-sm font-medium text-blue-800">
                    Delivery Notes:
                  </Text>
                  <Text className="text-sm text-blue-700">
                    {modalData.delivery_notes}
                  </Text>
                </View>
              )}

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateStatus(
                      modalData.assignment_id,
                      "accept",
                      "Accept"
                    )
                  }
                  disabled={isUpdating}
                  className={`flex-1 py-3 rounded-lg ${
                    isUpdating ? "bg-gray-400" : "bg-secondary"
                  }`}
                >
                  <Text className="font-semibold text-center text-white">
                    {isUpdating ? "Processing..." : "Accept Delivery"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateStatus(
                      modalData.assignment_id,
                      "decline",
                      "Decline"
                    )
                  }
                  disabled={isUpdating}
                  className={`flex-1 py-3 rounded-lg border ${
                    isUpdating
                      ? "bg-gray-100 border-gray-400"
                      : "bg-white border-secondary"
                  }`}
                >
                  <Text
                    className={`font-semibold text-center ${
                      isUpdating ? "text-gray-500" : "text-secondary"
                    }`}
                  >
                    {isUpdating ? "Processing..." : "Decline Delivery"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
