"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId, showReviewForm } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [productRating, setProductRating] = useState(0);
  const [productReviewText, setProductReviewText] = useState("");
  const [sellerRating, setSellerRating] = useState(0);
  const [sellerReviewText, setSellerReviewText] = useState("");
  const [sellerServiceAspects, setSellerServiceAspects] = useState({
    delivery_speed: 0,
    communication: 0,
    packaging: 0,
  });
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [orderProductReview, setOrderProductReview] = useState(null);
  const [orderSellerReview, setOrderSellerReview] = useState(null);
  const [initialShowReviewForm, setInitialShowReviewForm] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    if (showReviewForm && initialShowReviewForm && order && canReview()) {
      openReviewModal();
    }
  }, [initialShowReviewForm, order]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.data.order);
        setOrderProductReview(response.data.data.order.orderProductReview);
        setOrderSellerReview(response.data.data.order.orderSellerReview);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const canReview = () => {
    if (!order) return false;
    if (order.status !== "delivered") return false;

    const deliveryDate = new Date(order.delivered_at);
    const now = new Date();
    const diffInDays = (now - deliveryDate) / (1000 * 60 * 60 * 24);

    return diffInDays <= 2 && (!orderProductReview || !orderSellerReview);
  };

  const renderStarRating = (rating, onPress, size = 24) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => onPress && onPress(i)}>
          <Feather
            name="star"
            size={size}
            color={i <= rating ? "#F59E0B" : "#E5E7EB"}
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      );
    }
    return <View className="flex-row">{stars}</View>;
  };

  const pickMedia = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload media"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileSizeInMB = asset.fileSize / (1024 * 1024);
        if (fileSizeInMB > 10) {
          Alert.alert(
            "File Too Large",
            "Please select a file smaller than 10MB"
          );
          return;
        }

        setSelectedMedia((prev) => [
          ...prev,
          {
            uri: asset.uri,
            type: asset.type,
            fileName:
              asset.fileName ||
              `media_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Failed to pick media");
    }
  };

  const removeMedia = (index) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReview = async () => {
    if (productRating === 0 && sellerRating === 0) {
      Alert.alert(
        "Rating Required",
        "Please rate at least the product or seller"
      );
      return;
    }

    setSubmittingReview(true);

    try {
      const formData = new FormData();

      if (productRating > 0) {
        formData.append("productRating", productRating.toString());
        formData.append("productReviewText", productReviewText);
      }

      if (sellerRating > 0) {
        formData.append("sellerRating", sellerRating.toString());
        formData.append("sellerReviewText", sellerReviewText);
        formData.append(
          "sellerServiceAspects",
          JSON.stringify(sellerServiceAspects)
        );
      }

      formData.append("orderId", orderId.toString());

      selectedMedia.forEach((media, index) => {
        formData.append("reviewMedia", {
          uri: media.uri,
          type: media.type === "video" ? "video/mp4" : "image/jpeg",
          name: media.fileName,
        });
      });

      prettyLog(formData);

      const response = await axios.post(
        `${API_URL}/api/reviews/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Review submitted successfully!");
        setShowReviewModal(false);
        setInitialShowReviewForm(false);
        setProductRating(0);
        setProductReviewText("");
        setSellerRating(0);
        setSellerReviewText("");
        setSellerServiceAspects({
          delivery_speed: 0,
          communication: 0,
          packaging: 0,
        });
        setSelectedMedia([]);
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready_for_pickup: "bg-indigo-100 text-indigo-800",
      rider_assigned: "bg-orange-100 text-orange-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      rider_assigned: "On the Way",
      out_for_delivery: "On the Way",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return statusMap[status] || status;
  };

  const formatUnitType = (unitType) => {
    const unitMap = {
      per_kilo: "Per Kilo",
      per_250g: "Per 250g",
      per_500g: "Per 500g",
      per_piece: "Per Piece",
      per_bundle: "Per Bundle",
      per_pack: "Per Pack",
      per_liter: "Per Liter",
      per_dozen: "Per Dozen",
    };
    return unitMap[unitType] || unitType;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelOrder = () => {
    return order && ["pending", "confirmed"].includes(order.status);
  };

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: cancelOrder },
    ]);
  };

  const cancelOrder = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/orders/${orderId}/cancel`
      );
      if (response.data.success) {
        Alert.alert("Success", "Order cancelled successfully");
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Error cancelling order:", error.response.data);
      Alert.alert("Error", "Failed to cancel order");
    }
  };

  const openReviewModal = () => {
    setProductRating(0);
    setProductReviewText("");
    setSellerRating(0);
    setSellerReviewText("");
    setSellerServiceAspects({
      delivery_speed: 0,
      communication: 0,
      packaging: 0,
    });
    setSelectedMedia([]);
    setShowReviewModal(true);
  };

  const areReviewsComplete = () => {
    return orderProductReview && orderSellerReview;
  };

  const getReviewButtonText = () => {
    if (orderProductReview && !orderSellerReview) {
      return "Rate Seller";
    }
    if (!orderProductReview && orderSellerReview) {
      return "Rate Order";
    }
    return "Write Review";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Order Details</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="mt-4 text-gray-600">Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Order Details</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <Text className="text-gray-600">Order not found</Text>
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
          <Text className="ml-4 text-xl font-semibold">Order Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Order Status */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Order #{order.order_number}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
            >
              <Text className="text-sm font-medium">
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Order Date</Text>
              <Text className="text-gray-900">
                {formatDate(order.created_at)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Payment Method</Text>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="cash" size={16} color="#059669" />
                <Text className="ml-1 text-gray-900">Cash on Delivery</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Payment Status</Text>
              <Text className="text-gray-900 capitalize">
                {order.payment_status.replace(/_/g, " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Store Information - Display once since order is per store */}
        {order.items && order.items.length > 0 && (
          <View className="p-4 mb-4 bg-white rounded-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Store Information
            </Text>
            <View className="flex-row items-center">
              {order.items[0].store_logo_key ? (
                <Image
                  source={{ uri: order.items[0].store_logo_key }}
                  className="w-12 h-12 mr-3 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-200 rounded-full">
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={20}
                    color="#6B7280"
                  />
                </View>
              )}
              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  {order.items[0].store_name}
                </Text>
                <Text className="text-sm text-gray-600">
                  Seller ID: {order.items[0].seller_seller_id}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Items
          </Text>

          {order.items?.map((item, index) => (
            <View
              key={index}
              className="flex-row pb-4 mb-4 border-b border-gray-200 last:border-b-0 last:mb-0"
            >
              <View className="mr-4">
                {item.image_keys ? (
                  <Image
                    source={{ uri: item.image_keys }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                    <Feather name="image" size={20} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {item.product_name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {formatUnitType(item.unit_type)}
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm text-gray-600">
                    Qty: {item.quantity} × ₱
                    {Number.parseFloat(item.unit_price).toFixed(2)}
                  </Text>
                  <Text className="font-medium text-orange-600">
                    ₱{Number.parseFloat(item.total_price).toFixed(2)}
                  </Text>
                </View>

                {/* Item Status */}
                <View className="mt-2">
                  <View
                    className={`self-start px-2 py-1 rounded-full ${getStatusColor(item.item_status)}`}
                  >
                    <Text className="text-xs font-medium">
                      {getStatusText(item.item_status)}
                    </Text>
                  </View>
                </View>

                {/* Preparation Options */}
                {item.preparation_options &&
                  Object.keys(item.preparation_options).length !== 0 &&
                  Object.keys(JSON.parse(item.preparation_options)).some(
                    (key) => JSON.parse(item.preparation_options)[key]
                  ) && (
                    <View className="mt-2">
                      <Text className="text-xs text-gray-500">
                        Preparation:{" "}
                        {Object.entries(JSON.parse(item.preparation_options))
                          .filter(([key, value]) => value)
                          .map(
                            ([key]) =>
                              key.charAt(0).toUpperCase() + key.slice(1)
                          )
                          .join(", ")}
                      </Text>
                    </View>
                  )}

                {/* Seller Notes */}
                {item.seller_notes && (
                  <View className="mt-2">
                    <Text className="text-xs text-gray-500">
                      Note: {item.seller_notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Delivery Address
          </Text>

          <View className="space-y-1">
            <Text className="font-medium text-gray-900">
              {order.delivery_recipient_name}
            </Text>
            <Text className="text-gray-600">{order.delivery_phone_number}</Text>
            <Text className="text-gray-700">
              {order.delivery_street_address}, {order.delivery_barangay}
            </Text>
            <Text className="text-gray-700">
              {order.delivery_city}, {order.delivery_province}{" "}
              {order.delivery_postal_code}
            </Text>
            {order.delivery_landmark && (
              <Text className="text-sm text-gray-500">
                Landmark: {order.delivery_landmark}
              </Text>
            )}
            {order.delivery_notes && (
              <Text className="text-sm text-gray-500">
                Notes: {order.delivery_notes}
              </Text>
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Summary
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">
                ₱{Number.parseFloat(order.subtotal).toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900">
                ₱{Number.parseFloat(order.delivery_fee).toFixed(2)}
              </Text>
            </View>

            {order.voucher_discount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-green-600">Voucher Discount</Text>
                <Text className="text-green-600">
                  -₱{Number.parseFloat(order.voucher_discount).toFixed(2)}
                </Text>
              </View>
            )}

            <View className="pt-2 border-t border-gray-200">
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold text-gray-900">
                  Total
                </Text>
                <Text className="text-lg font-semibold text-orange-600">
                  ₱{Number.parseFloat(order.total_amount).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <View className="p-4 bg-white rounded-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Order Timeline
            </Text>

            {order.statusHistory.map((history, index) => (
              <View key={index} className="flex-row items-start mb-3 last:mb-0">
                <View className="items-center justify-center w-3 h-3 mt-1 mr-3 bg-orange-600 rounded-full" />
                <View className="flex-1">
                  <Text className="font-medium text-gray-900 capitalize">
                    {history.status.replace(/_/g, " ")}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {formatDate(history.created_at)}
                  </Text>
                  {history.notes && (
                    <Text className="text-sm text-gray-500">
                      {history.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 bg-white border-t border-gray-200">
        {canCancelOrder() && (
          <TouchableOpacity
            className="items-center p-4 mb-3 border border-red-600 rounded-lg"
            onPress={handleCancelOrder}
          >
            <Text className="font-semibold text-red-600">Cancel Order</Text>
          </TouchableOpacity>
        )}

        {(orderProductReview || orderSellerReview) &&
          order &&
          order.status === "delivered" && (
            <View className="p-4 mt-4 rounded-lg bg-gray-50">
              <Text className="mb-3 text-lg font-semibold">Your Reviews</Text>

              {orderProductReview && (
                <View className="p-3 mb-3 bg-white rounded-lg">
                  <Text className="mb-2 font-medium">Product Review</Text>
                  <View className="flex-row items-center mb-2">
                    {renderStarRating(orderProductReview.rating, null, 16)}
                    <Text className="ml-2 text-sm text-gray-600">
                      {orderProductReview.rating}/5
                    </Text>
                  </View>
                  {orderProductReview.review_text && (
                    <Text className="text-sm text-gray-700">
                      {orderProductReview.review_text}
                    </Text>
                  )}
                </View>
              )}

              {orderSellerReview && (
                <View className="p-3 bg-white rounded-lg">
                  <Text className="mb-2 font-medium">Seller Review</Text>
                  <View className="flex-row items-center mb-2">
                    {renderStarRating(orderSellerReview.rating, null, 16)}
                    <Text className="ml-2 text-sm text-gray-600">
                      {orderSellerReview.rating}/5
                    </Text>
                  </View>
                  {orderSellerReview.review_text && (
                    <Text className="text-sm text-gray-700">
                      {orderSellerReview.review_text}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

        {canReview() && !areReviewsComplete() && (
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 bg-orange-600 rounded-lg"
            onPress={openReviewModal}
          >
            <Feather name="star" size={20} color="white" />
            <Text className="ml-2 font-semibold text-white">
              {getReviewButtonText()}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        transparent
        visible={showReviewModal}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="bg-white rounded-t-3xl min-h-[90%]">
              <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
                <Text className="text-xl font-semibold">Write Review</Text>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 p-6"
                showsVerticalScrollIndicator={false}
              >
                {!orderProductReview && (
                  <View className="mb-6">
                    <Text className="mb-3 text-lg font-semibold">
                      Rate the Product
                    </Text>
                    <View className="flex-row items-center mb-3">
                      {renderStarRating(productRating, setProductRating)}
                      <Text className="ml-3 text-gray-600">
                        {productRating > 0
                          ? `${productRating}/5`
                          : "Tap to rate"}
                      </Text>
                    </View>
                    <TextInput
                      className="p-3 border border-gray-300 rounded-lg"
                      placeholder="Share your experience with this product..."
                      multiline
                      numberOfLines={4}
                      value={productReviewText}
                      onChangeText={setProductReviewText}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {!orderProductReview && (
                  <View className="mb-6">
                    <Text className="mb-3 text-lg font-semibold">
                      Add Photos/Videos (Optional)
                    </Text>

                    <TouchableOpacity
                      className="flex-row items-center justify-center p-4 mb-3 border-2 border-gray-300 border-dashed rounded-lg"
                      onPress={pickMedia}
                    >
                      <Feather name="camera" size={24} color="#6B7280" />
                      <Text className="ml-2 text-gray-600">Add Media</Text>
                    </TouchableOpacity>

                    {selectedMedia.length > 0 && (
                      <FlatList
                        data={selectedMedia}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                          <View className="relative my-2 mr-3">
                            <Image
                              source={{ uri: item.uri }}
                              className="w-20 h-20 rounded-lg"
                            />
                            <TouchableOpacity
                              className="absolute p-1 bg-red-500 rounded-full -top-2 -right-2"
                              onPress={() => removeMedia(index)}
                            >
                              <Feather name="x" size={12} color="white" />
                            </TouchableOpacity>
                          </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    )}
                  </View>
                )}

                {!orderSellerReview && (
                  <View className="mb-12">
                    <Text className="mb-3 text-lg font-semibold">
                      Rate the Seller
                    </Text>
                    <View className="flex-row items-center mb-3">
                      {renderStarRating(sellerRating, setSellerRating)}
                      <Text className="ml-3 text-gray-600">
                        {sellerRating > 0 ? `${sellerRating}/5` : "Tap to rate"}
                      </Text>
                    </View>

                    <View className="mb-4">
                      <Text className="mb-1 text-sm text-gray-600">
                        Service Aspects
                      </Text>

                      <View className="mb-3">
                        <Text className="mb-1 text-sm text-gray-600">
                          Delivery Speed
                        </Text>
                        <View className="flex-row items-center">
                          {renderStarRating(
                            sellerServiceAspects.delivery_speed,
                            (rating) =>
                              setSellerServiceAspects((prev) => ({
                                ...prev,
                                delivery_speed: rating,
                              }))
                          )}
                        </View>
                      </View>

                      <View className="mb-3">
                        <Text className="mb-1 text-sm text-gray-600">
                          Communication
                        </Text>
                        <View className="flex-row items-center">
                          {renderStarRating(
                            sellerServiceAspects.communication,
                            (rating) =>
                              setSellerServiceAspects((prev) => ({
                                ...prev,
                                communication: rating,
                              }))
                          )}
                        </View>
                      </View>

                      <View className="mb-3">
                        <Text className="mb-1 text-sm text-gray-600">
                          Packaging Quality
                        </Text>
                        <View className="flex-row items-center">
                          {renderStarRating(
                            sellerServiceAspects.packaging,
                            (rating) =>
                              setSellerServiceAspects((prev) => ({
                                ...prev,
                                packaging: rating,
                              }))
                          )}
                        </View>
                      </View>
                    </View>

                    <TextInput
                      className="p-3 border border-gray-300 rounded-lg"
                      placeholder="Share your experience with this seller..."
                      multiline
                      numberOfLines={4}
                      value={sellerReviewText}
                      onChangeText={setSellerReviewText}
                      textAlignVertical="top"
                    />
                  </View>
                )}
              </ScrollView>

              <View className="p-6 border-t border-gray-200">
                <TouchableOpacity
                  className="items-center p-4 bg-orange-600 rounded-lg"
                  onPress={submitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-semibold text-white">
                      Submit Review
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OrderDetailsScreen;
