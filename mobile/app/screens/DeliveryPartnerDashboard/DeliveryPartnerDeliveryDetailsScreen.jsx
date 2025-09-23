"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import MapView, { Marker } from "react-native-maps";
import { useDeliveryPartner } from "../../context/DeliveryPartnerContext";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";

const DeliveryPartnerDeliveryDetailsScreen = ({ navigation, route }) => {
  const { token, user } = useAuth();
  const { currentLocation, deliveryPartnerId } = useDeliveryPartner();
  const { assignmentId } = route.params;
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFullScreenMap, setShowFullScreenMap] = useState(false);

  const [sellerUnreadCount, setSellerUnreadCount] = useState(0);
  const [consumerUnreadCount, setConsumerUnreadCount] = useState(0);

  const mapRef = useRef(null);

  useEffect(() => {
    fetchDeliveryDetails();
  }, [assignmentId]);

  const fetchDeliveryDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/delivery-partner/delivery-details/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDeliveryDetails(response.data.data);
      } else {
        Alert.alert("Error", "Failed to load delivery details");
        navigation.goBack();
      }
    } catch (error) {
      console.error(
        "Error fetching delivery details:",
        error.response?.data || error
      );
      Alert.alert("Error", "Failed to load delivery details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/unread-counts/multiple?userId=${deliveryPartnerId}&userType=delivery_partner&orderId=${deliveryDetails.order_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSellerUnreadCount(response.data.data.seller.unreadCount);
        setConsumerUnreadCount(response.data.data.consumer.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  // Call fetchUnreadCounts in useEffect
  useFocusEffect(
    useCallback(() => {
      if (deliveryDetails) {
        fetchUnreadCounts();
      }
    }, [deliveryDetails])
  );

  const handleChatWithSeller = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/delivery-partner/${deliveryDetails.seller_id}/conversation-id?orderId=${deliveryDetails.order_id}&chatType=seller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        navigation.navigate("DeliveryPartnerChatConversation", {
          conversationId: response.data.data.conversationId,
          sellerId: deliveryDetails.seller_id,
          storeName: deliveryDetails.store_name,
          storeLogo: deliveryDetails.store_logo_url,
          orderId: deliveryDetails.order_id,
          orderNumber: deliveryDetails.order_number,
          chatType: "seller",
          deliveryStatus: deliveryDetails.delivery_status,
        });
      }
    } catch (error) {
      console.error(
        "Error getting conversation ID:",
        error.response?.data || error
      );
      Alert.alert("Error", "Failed to open chat");
    }
  };

  const handleChatWithConsumer = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/delivery-partner/${deliveryDetails.user_id}/conversation-id?orderId=${deliveryDetails.order_id}&chatType=consumer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        navigation.navigate("DeliveryPartnerChatConversation", {
          conversationId: response.data.data.conversationId,
          consumerId: deliveryDetails.user_id,
          consumerName: deliveryDetails.delivery_recipient_name,
          orderId: deliveryDetails.order_id,
          orderNumber: deliveryDetails.order_number,
          chatType: "consumer",
          deliveryStatus: deliveryDetails.delivery_status,
        });
      }
    } catch (error) {
      console.error(
        "Error getting conversation ID:",
        error.response?.data || error
      );
      Alert.alert("Error", "Failed to open chat");
    }
  };

  const handleUpdateStatus = (newStatus, confirmMessage) => {
    Alert.alert("Update Status", confirmMessage, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => updateDeliveryStatus(newStatus),
      },
    ]);
  };

  const updateDeliveryStatus = async (status) => {
    setUpdating(true);
    try {
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
        fetchDeliveryDetails(); // Refresh the details
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
      setUpdating(false);
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
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const renderActionButtons = () => {
    if (!deliveryDetails || !deliveryDetails.can_interact) return null;

    const status = deliveryDetails.delivery_status;
    const candidateStatus = deliveryDetails.candidate_status;

    if (candidateStatus === "pending") {
      return (
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() =>
              handleUpdateStatus(
                "accept",
                "Are you sure you want to accept this delivery?"
              )
            }
            disabled={updating}
            className={`flex-1 py-4 rounded-lg ${updating ? "bg-gray-400" : "bg-green-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {updating ? "Accepting..." : "Accept Delivery"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleUpdateStatus(
                "decline",
                "Are you sure you want to decline this delivery?"
              )
            }
            disabled={updating}
            className={`flex-1 py-4 rounded-lg ${updating ? "bg-gray-400" : "bg-red-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {updating ? "Declining..." : "Decline Delivery"}
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
              handleUpdateStatus(
                "picked_up",
                "Mark this delivery as picked up?"
              )
            }
            disabled={updating}
            className={`w-full py-4 rounded-lg ${updating ? "bg-gray-400" : "bg-blue-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {updating ? "Updating..." : "Mark as Picked Up"}
            </Text>
          </TouchableOpacity>
        );
      }

      if (status === "picked_up") {
        return (
          <TouchableOpacity
            onPress={() =>
              handleUpdateStatus(
                "delivered",
                "Mark this delivery as delivered?"
              )
            }
            disabled={updating}
            className={`w-full py-4 rounded-lg ${updating ? "bg-gray-400" : "bg-green-600"}`}
          >
            <Text className="font-semibold text-center text-white">
              {updating ? "Updating..." : "Mark as Delivered"}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    return null;
  };

  const renderMap = () => {
    if (
      !deliveryDetails ||
      deliveryDetails.delivery_status === "delivered" ||
      deliveryDetails.delivery_status === "cancelled"
    ) {
      return null;
    }

    const initialRegion = currentLocation
      ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : {
          latitude: 13.3526,
          longitude: 123.7216,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

    return (
      <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-900">
          Delivery Route
        </Text>
        <TouchableOpacity
          onPress={() => setShowFullScreenMap(true)}
          className="h-48 overflow-hidden rounded-lg"
        >
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            region={initialRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {/* Current Location Marker */}
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Your Location"
                description="Current delivery partner location"
                pinColor="#06B6D4"
              />
            )}

            {/* Pickup Location Marker */}
            {deliveryDetails.pickup_coordinates && (
              <Marker
                coordinate={{
                  latitude: deliveryDetails.pickup_coordinates.latitude,
                  longitude: deliveryDetails.pickup_coordinates.longitude,
                }}
                title="Pickup Location"
                description={deliveryDetails.store_name}
                pinColor="#10B981"
              />
            )}

            {/* Delivery Location Marker */}
            {deliveryDetails.delivery_coordinates && (
              <Marker
                coordinate={{
                  latitude: deliveryDetails.delivery_coordinates.latitude,
                  longitude: deliveryDetails.delivery_coordinates.longitude,
                }}
                title="Delivery Location"
                description={deliveryDetails.delivery_recipient_name}
                pinColor="#EF4444"
              />
            )}
          </MapView>
          <View className="absolute px-2 py-1 bg-white rounded bottom-2 right-2">
            <Text className="text-xs text-gray-600">Tap to expand</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFullScreenMap = () => {
    const initialRegion = currentLocation
      ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : {
          latitude: 13.3526,
          longitude: 123.7216,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

    return (
      <Modal
        visible={showFullScreenMap}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-100">
          {/* Header */}
          <View className="flex flex-row items-center justify-between p-4 pt-12 bg-white border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setShowFullScreenMap(false)}
              className="p-2 bg-gray-100 rounded-full"
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Delivery Navigation
            </Text>
            <View className="w-10" />
          </View>

          {/* Full Screen Map */}
          <View className="flex-1">
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              region={initialRegion}
              showsUserLocation={false}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
            >
              {/* Current Location Marker */}
              {currentLocation && (
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="Your Location"
                  description="Current delivery partner location"
                  pinColor="#06B6D4"
                />
              )}

              {/* Pickup Location Marker */}
              {deliveryDetails && deliveryDetails.pickup_coordinates && (
                <Marker
                  coordinate={{
                    latitude: deliveryDetails.pickup_coordinates.latitude,
                    longitude: deliveryDetails.pickup_coordinates.longitude,
                  }}
                  title="Pickup Location"
                  description={deliveryDetails.store_name}
                  pinColor="#10B981"
                />
              )}

              {/* Delivery Location Marker */}
              {deliveryDetails && deliveryDetails.delivery_coordinates && (
                <Marker
                  coordinate={{
                    latitude: deliveryDetails.delivery_coordinates.latitude,
                    longitude: deliveryDetails.delivery_coordinates.longitude,
                  }}
                  title="Delivery Location"
                  description={deliveryDetails.delivery_recipient_name}
                  pinColor="#EF4444"
                />
              )}
            </MapView>
          </View>

          {/* Action Buttons at Bottom */}
          {deliveryDetails && (
            <View className="p-4 bg-white border-t border-gray-200">
              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">
                  Current Status:
                </Text>
                <View
                  className={`px-3 py-2 rounded-lg self-start ${getStatusColor(deliveryDetails.delivery_status)}`}
                >
                  <Text className="text-sm font-medium">
                    {getStatusText(deliveryDetails.delivery_status)}
                  </Text>
                </View>
              </View>
              {renderActionButtons()}
            </View>
          )}
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <Text className="text-gray-500">Loading delivery details...</Text>
      </View>
    );
  }

  if (!deliveryDetails) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <Text className="text-gray-500">Delivery details not found</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4 pt-12">
          {/* Header */}
          <View className="flex flex-row items-center justify-between mb-6">
            <TouchableOpacity
              className="p-2 bg-white rounded-full shadow-sm"
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">
              Delivery Details
            </Text>
            <View className="w-10" />
          </View>

          {/* Map */}
          {renderMap()}

          {/* Store Information */}
          <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <View className="flex flex-row items-center">
              {deliveryDetails.store_logo_url ? (
                <Image
                  source={{ uri: deliveryDetails.store_logo_url }}
                  className="w-12 h-12 mr-3 rounded-full"
                />
              ) : (
                <View className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-200 rounded-full">
                  <MaterialIcons name="store" size={24} color="#6b7280" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {deliveryDetails.store_name}
                </Text>
                <Text className="text-sm text-gray-600">Store</Text>
              </View>

              <View className="relative">
                <TouchableOpacity
                  onPress={handleChatWithSeller}
                  className="p-2 ml-2 bg-green-100 rounded-full"
                >
                  <MaterialIcons name="chat" size={20} color="#16a34a" />
                </TouchableOpacity>
                {sellerUnreadCount > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                    <Text className="text-xs font-bold text-white">
                      {sellerUnreadCount > 99 ? "99+" : sellerUnreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Delivery Recipient Information */}
          <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <View className="flex flex-row items-center">
              <View className="flex items-center justify-center w-12 h-12 mr-3 bg-blue-100 rounded-full">
                <MaterialIcons name="person" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {deliveryDetails.delivery_recipient_name}
                </Text>
                <Text className="text-sm text-gray-600">Recipient</Text>
              </View>

              <View className="relative">
                <TouchableOpacity
                  onPress={handleChatWithConsumer}
                  className="p-2 ml-2 bg-blue-100 rounded-full"
                >
                  <MaterialIcons name="chat" size={20} color="#3b82f6" />
                </TouchableOpacity>
                {consumerUnreadCount > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                    <Text className="text-xs font-bold text-white">
                      {consumerUnreadCount > 99 ? "99+" : consumerUnreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Delivery Info */}
          <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <View className="flex flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                {deliveryDetails.order_number}
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${getStatusColor(deliveryDetails.delivery_status)}`}
              >
                <Text className="text-sm font-medium">
                  {getStatusText(deliveryDetails.delivery_status)}
                </Text>
              </View>
            </View>

            <View className="space-y-3">
              <View className="flex flex-row items-center">
                <MaterialIcons name="shopping-bag" size={20} color="#6b7280" />
                <Text className="ml-3 text-gray-700">
                  {deliveryDetails.total_items} items • ₱
                  {Number.parseFloat(deliveryDetails.total_amount).toFixed(2)}
                </Text>
              </View>

              <View className="flex flex-row items-center">
                <MaterialIcons
                  name="local-shipping"
                  size={20}
                  color="#16a34a"
                />
                <Text className="ml-3 font-medium text-gray-700">
                  Delivery Fee: ₱
                  {Number.parseFloat(deliveryDetails.delivery_fee).toFixed(2)}
                </Text>
              </View>

              <View className="flex flex-row items-center">
                <MaterialIcons name="payment" size={20} color="#6b7280" />
                <Text className="ml-3 text-gray-700">
                  {deliveryDetails.payment_method === "cash_on_delivery"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </Text>
              </View>

              {deliveryDetails.distance && (
                <View className="flex flex-row items-center">
                  <MaterialIcons name="near-me" size={20} color="#6b7280" />
                  <Text className="ml-3 text-gray-700">
                    Distance:{" "}
                    {Number.parseFloat(deliveryDetails.distance).toFixed(1)} km
                  </Text>
                </View>
              )}

              {deliveryDetails.estimated_delivery_time && (
                <View className="flex flex-row items-center">
                  <MaterialIcons name="schedule" size={20} color="#6b7280" />
                  <Text className="ml-3 text-gray-700">
                    Est. Delivery:{" "}
                    {new Date(
                      deliveryDetails.estimated_delivery_time
                    ).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Pickup Address */}
          {deliveryDetails.pickup_address && (
            <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Text className="mb-4 text-lg font-semibold text-gray-900">
                Pickup Information
              </Text>
              <View className="space-y-3">
                <View>
                  <View className="flex flex-row items-center mb-2">
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#ef4444"
                    />
                    <Text className="ml-3 font-medium text-gray-900">
                      Pickup Address
                    </Text>
                  </View>
                  <Text className="ml-8 text-gray-700">
                    {deliveryDetails.pickup_address}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Delivery Information */}
          <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Delivery Information
            </Text>

            <View className="space-y-4">
              <View>
                <View className="flex flex-row items-center mb-2">
                  <MaterialIcons name="person" size={20} color="#6b7280" />
                  <Text className="ml-3 font-medium text-gray-900">
                    Recipient
                  </Text>
                </View>
                <Text className="ml-8 text-gray-700">
                  {deliveryDetails.delivery_recipient_name}
                </Text>
                <Text className="ml-8 text-gray-600">
                  {deliveryDetails.delivery_phone_number}
                </Text>
              </View>

              <View>
                <View className="flex flex-row items-center mb-2">
                  <MaterialIcons name="location-on" size={20} color="#16a34a" />
                  <Text className="ml-3 font-medium text-gray-900">
                    Delivery Address
                  </Text>
                </View>
                <Text className="ml-8 text-gray-700">
                  {deliveryDetails.delivery_street_address}
                </Text>
                <Text className="ml-8 text-gray-700">
                  {deliveryDetails.delivery_barangay},{" "}
                  {deliveryDetails.delivery_city}
                </Text>
                <Text className="ml-8 text-gray-700">
                  {deliveryDetails.delivery_province}{" "}
                  {deliveryDetails.postal_code}
                </Text>
                {deliveryDetails.delivery_landmark && (
                  <Text className="ml-8 text-gray-600">
                    Landmark: {deliveryDetails.delivery_landmark}
                  </Text>
                )}
              </View>

              {deliveryDetails.delivery_notes && (
                <View>
                  <View className="flex flex-row items-center mb-2">
                    <MaterialIcons name="note" size={20} color="#6b7280" />
                    <Text className="ml-3 font-medium text-gray-900">
                      Delivery Notes
                    </Text>
                  </View>
                  <Text className="ml-8 text-gray-700">
                    {deliveryDetails.delivery_notes}
                  </Text>
                </View>
              )}

              {deliveryDetails.special_instructions && (
                <View>
                  <View className="flex flex-row items-center mb-2">
                    <MaterialIcons name="info" size={20} color="#f59e0b" />
                    <Text className="ml-3 font-medium text-gray-900">
                      Special Instructions
                    </Text>
                  </View>
                  <Text className="ml-8 text-gray-700">
                    {deliveryDetails.special_instructions}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Delivery Items */}
          {deliveryDetails.order_items &&
            deliveryDetails.order_items.length > 0 && (
              <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Text className="mb-4 text-lg font-semibold text-gray-900">
                  Delivery Items
                </Text>
                {deliveryDetails.order_items.map((item, index) => (
                  <View
                    key={index}
                    className="flex flex-row py-3 border-b border-gray-100 last:border-b-0"
                  >
                    {item.product_image_url ? (
                      <Image
                        source={{ uri: item.product_image_url }}
                        className="w-12 h-12 mr-3 rounded-lg"
                      />
                    ) : (
                      <View className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-200 rounded-lg">
                        <MaterialIcons name="image" size={20} color="#6b7280" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {item.product_name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Qty: {item.quantity} • ₱
                        {Number.parseFloat(item.unit_price).toFixed(2)} each
                      </Text>
                      {item.unit_type && (
                        <Text className="text-xs text-gray-500">
                          Unit: {item.unit_type.replace("_", " ")}
                        </Text>
                      )}
                      {item.preparation_options &&
                        Object.keys(item.preparation_options).length > 0 && (
                          <Text className="text-xs text-gray-500">
                            Options:{" "}
                            {Object.entries(item.preparation_options)
                              .filter(([key, value]) => value)
                              .map(([key]) => key.replace("_", " "))
                              .join(", ")}
                          </Text>
                        )}
                    </View>
                    <Text className="font-medium text-gray-900">
                      ₱{Number.parseFloat(item.total_price).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          {/* Timestamps */}
          <View
            className={`p-4  bg-white border border-gray-200 rounded-lg shadow-sm ${deliveryDetails.delivery_status !== "delivered" ? "mb-24" : "mb-6"}`}
          >
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Timeline
            </Text>
            <View className="space-y-3">
              <View className="flex flex-row items-center">
                <MaterialIcons name="schedule" size={20} color="#6b7280" />
                <Text className="ml-3 text-gray-700">
                  Order Created:{" "}
                  {new Date(deliveryDetails.order_created).toLocaleString()}
                </Text>
              </View>
              {deliveryDetails.assigned_at && (
                <View className="flex flex-row items-center">
                  <MaterialIcons name="person-add" size={20} color="#6b7280" />
                  <Text className="ml-3 text-gray-700">
                    Assigned:{" "}
                    {new Date(deliveryDetails.assigned_at).toLocaleString()}
                  </Text>
                </View>
              )}
              {deliveryDetails.pickup_time && (
                <View className="flex flex-row items-center">
                  <MaterialIcons
                    name="local-shipping"
                    size={20}
                    color="#6b7280"
                  />
                  <Text className="ml-3 text-gray-700">
                    Picked Up:{" "}
                    {new Date(deliveryDetails.pickup_time).toLocaleString()}
                  </Text>
                </View>
              )}
              {deliveryDetails.delivery_time && (
                <View className="flex flex-row items-center">
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#16a34a"
                  />
                  <Text className="ml-3 text-gray-700">
                    Delivered:{" "}
                    {new Date(deliveryDetails.delivery_time).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Map Modal */}
      {renderFullScreenMap()}

      {/* Action Buttons at Bottom */}
      {deliveryDetails && renderActionButtons() && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          {renderActionButtons()}
        </View>
      )}
    </>
  );
};

export default DeliveryPartnerDeliveryDetailsScreen;
