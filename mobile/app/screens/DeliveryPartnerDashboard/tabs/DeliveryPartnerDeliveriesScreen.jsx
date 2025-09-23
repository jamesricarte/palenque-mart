"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../../../context/AuthContext";
import { useDeliveryPartner } from "../../../context/DeliveryPartnerContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";

const DeliveryPartnerDeliveriesScreen = () => {
  const { token } = useAuth();
  const { refreshOrderData } = useDeliveryPartner();
  const navigation = useNavigation();
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useFocusEffect(
    useCallback(() => {
      fetchAvailableDeliveries();
    }, [])
  );

  useEffect(() => {
    if (refreshOrderData) fetchAvailableDeliveries();
  }, [refreshOrderData]);

  const fetchAvailableDeliveries = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/delivery-partner/available-deliveries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAvailableDeliveries(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching available deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableDeliveries();
    setRefreshing(false);
  };

  const handleUpdateStatus = (assignmentId, newStatus, statusText) => {
    Alert.alert(
      "Update Status",
      `Are you sure you want to mark this delivery as ${statusText.toLowerCase()}?`,
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
      setUpdatingStatus((prev) => ({ ...prev, [assignmentId]: true }));

      const response = await axios.put(
        `${API_URL}/api/delivery-partner/update-assignment-status`,
        { assignmentId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const formatStatusPastTense = () => {
          const statusPastTense = {
            accept: "accepted",
            decline: "declined",
            picked_up: "picked up",
            delivered: "delivered",
          };

          return statusPastTense[status];
        };

        Alert.alert(
          "Success",
          `Delivery ${formatStatusPastTense()} successfully!`
        );
        fetchAvailableDeliveries();
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
      setUpdatingStatus((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  const handleDeliveryPress = (delivery) => {
    navigation.navigate("DeliveryPartnerDeliveryDetails", {
      assignmentId: delivery.assignment_id,
      orderId: delivery.order_id,
    });
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

  const renderActionButtons = (delivery) => {
    const status = delivery.delivery_status;
    const candidateStatus = delivery.candidate_status;
    const assignmentId = delivery.assignment_id;
    const isUpdating = updatingStatus[assignmentId];

    if (candidateStatus === "pending") {
      return (
        <View className="flex-row gap-3 mt-2">
          <TouchableOpacity
            onPress={() => handleUpdateStatus(assignmentId, "accept", "Accept")}
            disabled={isUpdating}
            className={`flex-1 py-3 rounded-lg ${isUpdating ? "bg-gray-400" : "bg-green-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {isUpdating ? "Accepting..." : "Accept Delivery"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleUpdateStatus(assignmentId, "decline", "Decline")
            }
            disabled={isUpdating}
            className={`flex-1 py-3 rounded-lg ${isUpdating ? "bg-gray-400" : "bg-red-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {isUpdating ? "Declining..." : "Decline Delivery"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (candidateStatus === "accepted") {
      if (status === "rider_assigned") {
        return (
          <TouchableOpacity
            onPress={() =>
              handleUpdateStatus(assignmentId, "picked_up", "Picked Up")
            }
            disabled={isUpdating}
            className={`w-full mt-2 py-3 rounded-lg ${isUpdating ? "bg-gray-400" : "bg-blue-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {isUpdating ? "Updating..." : "Mark as Picked Up"}
            </Text>
          </TouchableOpacity>
        );
      }

      if (status === "picked_up") {
        return (
          <TouchableOpacity
            onPress={() =>
              handleUpdateStatus(assignmentId, "delivered", "Delivered")
            }
            disabled={isUpdating}
            className={`w-full mt-2 py-3 rounded-lg ${isUpdating ? "bg-gray-400" : "bg-green-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {isUpdating ? "Updating..." : "Mark as Delivered"}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    return null;
  };

  const renderDeliveryCard = (delivery) => (
    <TouchableOpacity
      key={delivery.assignment_id}
      onPress={() => handleDeliveryPress(delivery)}
      className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      {/* Delivery Header */}
      <View className="flex gap-1 mb-5">
        <Text className="text-lg font-semibold text-gray-900">
          {delivery.order_number}
        </Text>
        <View className="flex flex-row items-center gap-2">
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(delivery.delivery_status)}`}
          >
            <Text className="text-sm font-medium">
              {getStatusText(delivery.delivery_status)}
            </Text>
          </View>
          <View className="px-3 py-1 bg-green-100 rounded-full">
            <Text className="text-sm font-medium text-green-800">
              ₱{Number.parseFloat(delivery.delivery_fee).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Distance Badge */}
      {delivery.distance && (
        <View className="flex flex-row items-center mb-2">
          <MaterialIcons name="near-me" size={16} color="#6b7280" />
          <Text className="ml-1 text-sm text-gray-600">
            {Number.parseFloat(delivery.distance).toFixed(1)} km away
          </Text>
        </View>
      )}

      {/* Delivery Details */}
      <View className="mb-3">
        <View className="flex flex-row items-center mb-2">
          <MaterialIcons name="shopping-bag" size={16} color="#6b7280" />
          <Text className="ml-2 text-sm text-gray-600">
            {delivery.item_count} item{delivery.item_count !== 1 ? "s" : ""} • ₱
            {Number.parseFloat(delivery.total_amount).toFixed(2)}
          </Text>
        </View>

        <View className="flex flex-row items-start mb-2">
          <MaterialIcons name="location-on" size={16} color="#ef4444" />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-medium text-gray-900">Pickup</Text>
            <Text className="text-sm text-gray-600">
              {delivery.pickup_address || "Pickup address not specified"}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-start mb-2">
          <MaterialIcons name="location-on" size={16} color="#16a34a" />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-medium text-gray-900">Delivery</Text>
            <Text className="text-sm text-gray-600">
              {delivery.delivery_street_address}, {delivery.delivery_barangay},{" "}
              {delivery.delivery_city}
            </Text>
            {delivery.delivery_landmark && (
              <Text className="text-xs text-gray-500">
                Landmark: {delivery.delivery_landmark}
              </Text>
            )}
          </View>
        </View>

        <View className="flex flex-row items-center">
          <MaterialIcons name="person" size={16} color="#6b7280" />
          <Text className="ml-2 text-sm text-gray-600">
            {delivery.delivery_recipient_name} •{" "}
            {delivery.delivery_phone_number}
          </Text>
        </View>
      </View>

      {/* Special Instructions */}
      {delivery.special_instructions && (
        <View className="p-3 mb-3 border border-yellow-200 rounded-lg bg-yellow-50">
          <Text className="text-sm font-medium text-yellow-800">
            Special Instructions:
          </Text>
          <Text className="text-sm text-yellow-700">
            {delivery.special_instructions}
          </Text>
        </View>
      )}

      {/* Delivery Notes */}
      {delivery.delivery_notes && (
        <View className="p-3 mb-3 border border-blue-200 rounded-lg bg-blue-50">
          <Text className="text-sm font-medium text-blue-800">
            Delivery Notes:
          </Text>
          <Text className="text-sm text-blue-700">
            {delivery.delivery_notes}
          </Text>
        </View>
      )}

      {/* Action Button */}
      {renderActionButtons(delivery)}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <Text className="text-gray-500">Loading available deliveries...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-gray-900">
            Available Deliveries
          </Text>
          <Text className="text-sm text-gray-600">
            {availableDeliveries.length} deliver
            {availableDeliveries.length !== 1 ? "ies" : "y"} available for you
          </Text>
        </View>

        {/* Deliveries List */}
        {availableDeliveries.length > 0 ? (
          availableDeliveries.map(renderDeliveryCard)
        ) : (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="inbox" size={64} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium text-gray-500">
              No Available Deliveries
            </Text>
            <Text className="mt-2 text-sm text-center text-gray-400">
              There are no deliveries available for you at the moment.{"\n"}
              Pull down to refresh.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DeliveryPartnerDeliveriesScreen;
