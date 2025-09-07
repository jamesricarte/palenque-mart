"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import { useFocusEffect } from "@react-navigation/native";

const ChatConversationScreen = ({ route, navigation }) => {
  const { conversationId, sellerId, storeName, storeLogo, productId } =
    route.params;
  const { user, socketMessage } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef();

  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedBargainForCart, setSelectedBargainForCart] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(1); // Updated to number
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedBargainForCounter, setSelectedBargainForCounter] =
    useState(null);
  const [counterOfferPrice, setCounterOfferPrice] = useState("");
  const [submittingCounterOffer, setSubmittingCounterOffer] = useState(false);

  let markReadInProgress = false;

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/conversations/${conversationId}/messages`
      );
      if (response.data.success) {
        setMessages(response.data.data.messages);
        // Mark messages as read
        markMessagesAsRead();
      }
    } catch (error) {
      console.log("Error fetching messages:", error.response.data);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (markReadInProgress) return; // prevent overlap
    markReadInProgress = true;
    try {
      await axios.put(
        `${API_URL}/api/chat/conversations/${conversationId}/mark-read`
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    } finally {
      markReadInProgress = false;
    }
  };

  const fetchSellerProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/bargain/seller/${sellerId}/products/${conversationId}`
      );

      if (response.data.success) {
        setSellerProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching seller products:", error.response.data);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChatBargainOffer = async () => {
    if (!selectedProduct || !offerPrice.trim()) {
      Alert.alert(
        "Error",
        "Please select a product and enter your offer price"
      );
      return;
    }

    const offerPriceNum = Number.parseFloat(offerPrice);
    const originalPrice = Number.parseFloat(selectedProduct.price);

    if (isNaN(offerPriceNum) || offerPriceNum <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    if (offerPriceNum >= originalPrice) {
      Alert.alert(
        "Error",
        "Offer price should be less than the original price"
      );
      return;
    }

    setSubmittingOffer(true);
    try {
      const response = await axios.post(`${API_URL}/api/bargain/create-offer`, {
        productId: selectedProduct.id,
        sellerId: sellerId,
        offeredPrice: offerPriceNum,
        originalPrice: originalPrice,
        conversationId: conversationId,
      });

      if (response.data.success) {
        setShowOfferModal(false);
        setSelectedProduct(null);
        setOfferPrice("");
        fetchMessages(); // Refresh messages to show the new bargain card
        Alert.alert("Success", "Your bargain offer has been sent!");
      }
    } catch (error) {
      console.error("Error creating bargain offer:", error);
      Alert.alert(
        "Error",
        error.response.data.message ||
          "Failed to send bargain offer. Please try again."
      );
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!counterOfferPrice.trim()) {
      Alert.alert("Error", "Please enter your counter offer price");
      return;
    }

    const counterPriceNum = Number.parseFloat(counterOfferPrice);
    const originalPrice = Number.parseFloat(
      selectedBargainForCounter?.original_price
    );

    if (isNaN(counterPriceNum) || counterPriceNum <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    if (counterPriceNum >= originalPrice) {
      Alert.alert(
        "Error",
        "Counter offer should be less than the original price"
      );
      return;
    }

    setSubmittingCounterOffer(true);
    try {
      await handleBargainResponse(
        selectedBargainForCounter.id,
        "counter",
        counterPriceNum
      );
      setShowCounterModal(false);
      setSelectedBargainForCounter(null);
      setCounterOfferPrice("");
    } finally {
      setSubmittingCounterOffer(false);
    }
  };

  const handleBargainResponse = async (
    bargainOfferId,
    action,
    counterOfferPrice = null
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/bargain/respond/${bargainOfferId}`,
        {
          action: action, // 'accept', 'reject', 'counter'
          counterOfferPrice: counterOfferPrice,
        }
      );

      if (response.data.success) {
        fetchMessages(); // Refresh messages to show updated bargain card

        if (action === "accept") {
          Alert.alert(
            "Offer Accepted",
            "Great! You can now proceed to checkout with the agreed price."
          );
        } else if (action === "reject") {
          Alert.alert(
            "Offer Rejected",
            "You have rejected this bargain offer."
          );
        }
      }
    } catch (error) {
      console.error("Error responding to bargain:", error.response.data);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to respond to bargain offer. Please try again."
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [conversationId])
  );

  const handleAddToCart = async () => {
    if (!cartQuantity || cartQuantity <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    setAddingToCart(true);
    try {
      const response = await axios.post(`${API_URL}/api/cart/add`, {
        productId: selectedBargainForCart.product_id,
        quantity: cartQuantity,
        bargainId: selectedBargainForCart.id,
      });

      if (response.data.success) {
        Alert.alert("Success", "Product added to cart successfully!");
        fetchMessages();
        setShowAddToCartModal(false);
        setSelectedBargainForCart(null);
        setCartQuantity(1);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add to cart";
      Alert.alert("Error", errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    if (
      socketMessage &&
      socketMessage.type === "REFRESH_USER_CONVERSATIONS" &&
      conversationId === socketMessage.conversationId
    ) {
      fetchMessages();
    }
  }, [socketMessage]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat/send-message`, {
        conversationId: conversationId,
        sellerId: sellerId,
        messageText: messageText,
        messageType: "text",
      });

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data.message]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisibility(false);
    });

    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisibility(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 0);
    });

    return () => {
      keyboardDidHide.remove();
      keyboardDidShow.remove();
    };
  }, []);

  const BargainCard = ({ message }) => {
    const bargainData = message.bargain_data;
    const isFromUser = message.sender_type === "user";

    if (!bargainData) return null;

    const canRespond = !isFromUser && bargainData.status === "pending";
    const isAccepted = bargainData.status === "accepted";

    return (
      <View
        className={`flex-row mb-3 ${isFromUser ? "justify-end" : "justify-start"}`}
      >
        {!isFromUser && (
          <View className="mr-2">
            {storeLogo ? (
              <Image
                source={{ uri: storeLogo }}
                className="w-8 h-8 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={16}
                  color="#6B7280"
                />
              </View>
            )}
          </View>
        )}

        <View
          className={`max-w-xs rounded-lg border ${
            isFromUser
              ? "border-gray-200 rounded-br-md"
              : "border-gray-200 rounded-bl-md"
          }`}
        >
          <View
            className={`rounded-lg bg-white p-2 ${isFromUser ? "rounded-br-md" : "rounded-bl-md"}`}
          >
            {/* Header with offer type and final badge */}
            <View
              className={`px-4 py-3 border-b border-gray-100 ${isFromUser ? "bg-gray-50" : "bg-gray-50"}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      bargainData.status === "pending"
                        ? "bg-orange-500"
                        : bargainData.status === "accepted"
                          ? "bg-green-500"
                          : bargainData.status === "rejected"
                            ? "bg-red-500"
                            : "bg-gray-400"
                    }`}
                  />
                  <Text className="text-sm font-semibold text-gray-900">
                    {bargainData.offer_type === "initial_offer"
                      ? "Bargain Offer"
                      : "Counter Offer"}
                  </Text>
                </View>
                {bargainData.is_final_offer === 1 && (
                  <View className="px-2 py-1 bg-red-100 rounded-full">
                    <Text className="text-xs font-bold text-red-600">
                      FINAL
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Product Info Section */}
            <View className="p-4">
              <View className="flex-row mb-4">
                <View className="mr-3">
                  {bargainData.product_image ? (
                    <Image
                      source={{ uri: bargainData.product_image }}
                      className="w-16 h-16 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                      <Feather name="package" size={24} color="#6B7280" />
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="mb-1 text-base font-semibold text-gray-900"
                    numberOfLines={2}
                  >
                    {bargainData.product_name}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500 line-through">
                      ₱
                      {Number.parseFloat(bargainData.original_price).toFixed(2)}
                    </Text>
                    <View className="px-2 py-1 ml-2 bg-green-100 rounded-full">
                      <Text className="text-xs font-medium text-green-700">
                        -
                        {Math.round(
                          ((Number.parseFloat(bargainData.original_price) -
                            Number.parseFloat(bargainData.current_price)) /
                            Number.parseFloat(bargainData.original_price)) *
                            100
                        )}
                        %
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Price Section */}
              <View className="p-3 mb-4 border border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="mr-1 text-sm font-medium text-gray-700">
                    Offered Price:
                  </Text>
                  <Text className="text-2xl font-bold text-orange-600">
                    ₱{Number.parseFloat(bargainData.current_price).toFixed(2)}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-green-600">
                  You save ₱
                  {(
                    Number.parseFloat(bargainData.original_price) -
                    Number.parseFloat(bargainData.current_price)
                  ).toFixed(2)}
                </Text>
              </View>

              {/* Status Badge */}
              <View className="mb-4">
                <View
                  className={`inline-flex px-3 py-1 rounded-full ${
                    bargainData.status === "pending"
                      ? "bg-orange-100"
                      : bargainData.status === "accepted"
                        ? "bg-green-100"
                        : bargainData.status === "rejected"
                          ? "bg-red-100"
                          : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      bargainData.status === "pending"
                        ? "text-orange-700"
                        : bargainData.status === "accepted"
                          ? "text-green-700"
                          : bargainData.status === "rejected"
                            ? "text-red-700"
                            : "text-gray-700"
                    }`}
                  >
                    {bargainData.status === "pending"
                      ? "⏳ Awaiting Response"
                      : bargainData.status === "accepted"
                        ? "✅ Accepted"
                        : bargainData.status === "rejected"
                          ? "❌ Rejected"
                          : bargainData.status?.toUpperCase()}
                  </Text>
                </View>

                {isAccepted && (
                  <TouchableOpacity
                    className="flex-row items-center justify-center w-full p-3 mt-3 bg-orange-600 rounded-lg"
                    onPress={() => {
                      if (bargainData.in_orders) {
                        navigation.navigate("Orders");
                      } else if (bargainData.in_cart) {
                        navigation.navigate("Cart");
                      } else {
                        setSelectedBargainForCart(bargainData);
                        setShowAddToCartModal(true);
                      }
                    }}
                  >
                    <Feather
                      name={`${bargainData.in_orders ? "package" : "shopping-cart"}`}
                      size={16}
                      color="white"
                    />
                    <Text className="ml-1 text-sm font-medium text-white">
                      {bargainData.in_orders
                        ? "View Order"
                        : bargainData.in_cart
                          ? "View Cart"
                          : "Add to Cart"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Response Buttons for Buyer */}
              {canRespond && (
                <View className="gap-2">
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-row items-center flex-1 p-3 bg-white border border-gray-300 rounded-lg"
                      onPress={() =>
                        Alert.alert(
                          "Accept Offer",
                          "Are you sure you want to accept this bargain offer?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Accept",
                              onPress: () =>
                                handleBargainResponse(bargainData.id, "accept"),
                            },
                          ]
                        )
                      }
                    >
                      <Feather name="check" size={16} color="#16A34A" />
                      <Text className="ml-1 text-sm font-medium text-green-600">
                        Accept
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {!bargainData.is_final_offer && (
                    <TouchableOpacity
                      className="flex-row items-center justify-center w-full p-3 bg-white border border-gray-300 rounded-lg"
                      onPress={() => {
                        setSelectedBargainForCounter(bargainData);
                        setShowCounterModal(true);
                      }}
                    >
                      <Feather name="repeat" size={16} color="#2563EB" />
                      <Text className="ml-1 text-sm font-medium text-blue-600">
                        Make Counter Offer
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Footer with timestamp */}
            <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <Text className="text-xs text-right text-gray-500">
                {formatMessageTime(message.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const MessageItem = ({ message, isLast, showDate }) => {
    const isFromUser = message.sender_type === "user";

    if (message.message_type === "bargain_offer") {
      return (
        <View>
          {showDate && (
            <View className="items-center my-4">
              <View className="px-3 py-1 bg-gray-200 rounded-full">
                <Text className="text-xs text-gray-600">
                  {formatMessageDate(message.created_at)}
                </Text>
              </View>
            </View>
          )}
          <BargainCard message={message} />
        </View>
      );
    }

    return (
      <View>
        {showDate && (
          <View className="items-center my-4">
            <View className="px-3 py-1 bg-gray-200 rounded-full">
              <Text className="text-xs text-gray-600">
                {formatMessageDate(message.created_at)}
              </Text>
            </View>
          </View>
        )}

        <View
          className={`flex-row mb-3 ${isFromUser ? "justify-end" : "justify-start"}`}
        >
          {!isFromUser && (
            <View className="mr-2">
              {storeLogo ? (
                <Image
                  source={{ uri: storeLogo }}
                  className="w-8 h-8 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={16}
                    color="#6B7280"
                  />
                </View>
              )}
            </View>
          )}

          <View
            className={`max-w-xs px-4 py-2 rounded-2xl ${
              isFromUser
                ? "bg-orange-600 rounded-br-md"
                : "bg-gray-200 rounded-bl-md"
            }`}
          >
            <Text
              className={`text-base ${isFromUser ? "text-white" : "text-gray-900"}`}
            >
              {message.message_text}
            </Text>
            <Text
              className={`text-xs mt-1 ${isFromUser ? "text-orange-100" : "text-gray-500"}`}
            >
              {formatMessageTime(message.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center flex-1">
            {storeLogo ? (
              <Image
                source={{ uri: storeLogo }}
                className="w-10 h-10 mr-3 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-200 rounded-full">
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={20}
                  color="#6B7280"
                />
              </View>
            )}
            <Text className="text-xl font-semibold">{storeName}</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#F16B44" />
          <Text className="mt-4 text-gray-600">Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={
        Platform.OS === "android" && !keyBoardVisibility ? null : "padding"
      }
    >
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center flex-1">
          {storeLogo ? (
            <Image
              source={{ uri: storeLogo }}
              className="w-10 h-10 mr-3 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-200 rounded-full">
              <MaterialCommunityIcons
                name="storefront-outline"
                size={20}
                color="#6B7280"
              />
            </View>
          )}
          <Text className="text-xl font-semibold">{storeName}</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <View className="items-center justify-center flex-1 py-20">
            <Feather name="message-circle" size={64} color="#9CA3AF" />
            <Text className="mt-4 mb-2 text-xl font-semibold text-gray-600">
              Start the conversation
            </Text>
            <Text className="px-8 text-center text-gray-500">
              Send a message to {storeName} about their products
            </Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showDate =
              !prevMessage ||
              new Date(message.created_at).toDateString() !==
                new Date(prevMessage.created_at).toDateString();

            return (
              <MessageItem
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                showDate={showDate}
              />
            );
          })
        )}
      </ScrollView>

      {/* Message Input */}
      <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="p-2 mr-2 bg-blue-100 rounded-full"
          onPress={() => {
            setShowOfferModal(true);
            fetchSellerProducts();
          }}
        >
          <Feather name="tag" size={20} color="#2563EB" />
        </TouchableOpacity>

        <View className="flex-1 mr-3">
          <TextInput
            className="px-4 py-3 border border-gray-300 rounded-full"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          className={`p-3 rounded-full ${newMessage.trim() && !sending ? "bg-orange-600" : "bg-gray-300"}`}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <Feather
              name="send"
              size={20}
              color={newMessage.trim() ? "white" : "#9CA3AF"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOfferModal(false)}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={
            Platform.OS === "android" && !keyBoardVisibility ? null : "padding"
          }
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View
            className="flex-1"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="justify-end flex-1">
              <View className="p-6 bg-white rounded-t-3xl">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-semibold">Make an Offer</Text>
                  <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                    <Feather name="x" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                {/* Product Selection */}
                <View className="mb-4">
                  <Text className="mb-2 text-lg font-medium">
                    Select Product
                  </Text>
                  {loadingProducts ? (
                    <View className="items-center py-8">
                      <ActivityIndicator size="large" color="#2563EB" />
                      <Text className="mt-2 text-gray-600">
                        Loading products...
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={sellerProducts}
                      keyExtractor={(item) => item.id.toString()}
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 200 }}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          className={`flex-row p-3 mb-2 rounded-lg border ${
                            selectedProduct?.id === item.id
                              ? "bg-blue-50 border-blue-600"
                              : "bg-gray-50 border-gray-200"
                          }`}
                          onPress={() => setSelectedProduct(item)}
                        >
                          <Image
                            source={{ uri: item.imageUrl }}
                            className="w-12 h-12 rounded-lg"
                            resizeMode="cover"
                          />
                          <View className="flex-1 ml-3">
                            <Text className="font-semibold" numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              ₱{Number.parseFloat(item.price).toFixed(2)}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              Stock: {item.stock_quantity}
                            </Text>
                          </View>
                          {selectedProduct?.id === item.id && (
                            <Feather
                              name="check-circle"
                              size={20}
                              color="#2563EB"
                            />
                          )}
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <View className="items-center py-8">
                          <Feather name="package" size={48} color="#9CA3AF" />
                          <Text className="mt-2 text-gray-600">
                            No products available
                          </Text>
                        </View>
                      }
                    />
                  )}
                </View>

                {/* Offer Price Input */}
                {selectedProduct && (
                  <View className="mb-4">
                    <Text className="mb-2 text-lg font-medium">
                      Your Offer Price
                    </Text>
                    <View className="flex-row items-center p-3 border border-gray-300 rounded-lg">
                      <Text className="mr-2 text-lg font-semibold">₱</Text>
                      <TextInput
                        className="flex-1 text-lg"
                        placeholder="0.00"
                        value={offerPrice}
                        onChangeText={setOfferPrice}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                    <Text className="mt-1 text-sm text-gray-500">
                      Original price: ₱
                      {Number.parseFloat(selectedProduct.price).toFixed(2)}
                    </Text>

                    {offerPrice &&
                      offerPrice <= Number.parseFloat(selectedProduct.price) &&
                      !isNaN(Number.parseFloat(offerPrice)) &&
                      Number.parseFloat(offerPrice) > 0 && (
                        <View className="p-2 mt-2 rounded-lg bg-green-50">
                          <Text className="text-sm text-green-700">
                            You'll save: ₱
                            {(
                              Number.parseFloat(selectedProduct.price) -
                              Number.parseFloat(offerPrice)
                            ).toFixed(2)}
                          </Text>
                        </View>
                      )}
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  className={`items-center p-4 rounded-lg ${
                    selectedProduct && offerPrice.trim() && !submittingOffer
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                  onPress={handleChatBargainOffer}
                  disabled={
                    !selectedProduct || !offerPrice.trim() || submittingOffer
                  }
                >
                  {submittingOffer ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-semibold text-white">
                      Send Offer
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal
        visible={showCounterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCounterModal(false)}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={
            Platform.OS === "android" && !keyBoardVisibility ? null : "padding"
          }
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Counter Offer</Text>
                <TouchableOpacity onPress={() => setShowCounterModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {selectedBargainForCounter && (
                <View>
                  <View className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                    <View className="flex-row mb-3">
                      <View className="mr-3">
                        {selectedBargainForCounter.product_image ? (
                          <Image
                            source={{
                              uri: selectedBargainForCounter.product_image,
                            }}
                            className="w-16 h-16 rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                            <Feather name="package" size={24} color="#6B7280" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="mb-2 text-base font-semibold">
                          {selectedBargainForCounter.product_name}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Original Price: ₱
                          {Number.parseFloat(
                            selectedBargainForCounter.original_price
                          ).toFixed(2)}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Seller Offer: ₱
                          {Number.parseFloat(
                            selectedBargainForCounter.current_price
                          ).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 text-lg font-medium">
                      Your Counter Offer
                    </Text>
                    <View className="flex-row items-center p-3 border border-gray-300 rounded-lg">
                      <Text className="mr-2 text-lg font-semibold">₱</Text>
                      <TextInput
                        className="flex-1 text-lg"
                        placeholder="0.00"
                        value={counterOfferPrice}
                        onChangeText={setCounterOfferPrice}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    className={`items-center p-4 rounded-lg ${
                      counterOfferPrice.trim() && !submittingCounterOffer
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                    onPress={handleCounterOffer}
                    disabled={
                      !counterOfferPrice.trim() || submittingCounterOffer
                    }
                  >
                    {submittingCounterOffer ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-lg font-semibold text-white">
                        Send Counter Offer
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showAddToCartModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddToCartModal(false)}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={
            Platform.OS === "android" && !keyBoardVisibility ? null : "padding"
          }
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Add to Cart</Text>
                <TouchableOpacity onPress={() => setShowAddToCartModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {selectedBargainForCart && (
                <View>
                  <View className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                    <View className="flex-row mb-3">
                      <View className="mr-3">
                        {selectedBargainForCart.product_image ? (
                          <Image
                            source={{
                              uri: selectedBargainForCart.product_image,
                            }}
                            className="w-16 h-16 rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                            <Feather name="package" size={24} color="#6B7280" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="mb-2 text-base font-semibold">
                          {selectedBargainForCart.product_name}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-500 line-through">
                            ₱
                            {Number.parseFloat(
                              selectedBargainForCart.original_price
                            ).toFixed(2)}
                          </Text>
                          <Text className="ml-2 text-lg font-bold text-green-600">
                            ₱
                            {Number.parseFloat(
                              selectedBargainForCart.current_price
                            ).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 text-lg font-medium">Quantity</Text>
                    <View className="flex-row items-center justify-between p-3 bg-gray-100 rounded-lg">
                      <TouchableOpacity
                        className="items-center justify-center w-10 h-10 bg-white rounded-full"
                        onPress={() =>
                          setCartQuantity(Math.max(1, cartQuantity - 1))
                        }
                      >
                        <Feather name="minus" size={20} color="black" />
                      </TouchableOpacity>
                      <Text className="text-xl font-semibold">
                        {cartQuantity}
                      </Text>
                      <TouchableOpacity
                        className="items-center justify-center w-10 h-10 bg-white rounded-full"
                        onPress={() =>
                          setCartQuantity(
                            Math.min(
                              selectedBargainForCart.stock_quantity,
                              cartQuantity + 1
                            )
                          )
                        }
                      >
                        <Feather name="plus" size={20} color="black" />
                      </TouchableOpacity>
                    </View>

                    <Text className="mt-1 text-sm text-gray-500">
                      Max: {selectedBargainForCart.stock_quantity} available
                    </Text>
                  </View>

                  <View className="p-4 mb-4 bg-gray-100 rounded-lg">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lg font-medium">Total Price:</Text>
                      <Text className="text-2xl font-bold text-orange-600">
                        ₱
                        {(
                          Number.parseFloat(
                            selectedBargainForCart.current_price
                          ) * cartQuantity
                        ).toFixed(2)}
                      </Text>
                    </View>
                    {cartQuantity > 1 && (
                      <Text className="text-sm text-gray-600">
                        ₱
                        {Number.parseFloat(
                          selectedBargainForCart.current_price
                        ).toFixed(2)}{" "}
                        × {cartQuantity}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    className={`items-center p-4 rounded-lg ${
                      cartQuantity && !addingToCart
                        ? "bg-orange-600"
                        : "bg-gray-300"
                    }`}
                    onPress={handleAddToCart}
                    disabled={!cartQuantity || addingToCart}
                  >
                    {addingToCart ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-lg font-semibold text-white">
                        Add to Cart
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatConversationScreen;
