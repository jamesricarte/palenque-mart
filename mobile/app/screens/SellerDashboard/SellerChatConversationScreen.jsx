"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { useSeller } from "../../context/SellerContext";
import { API_URL } from "../../config/apiConfig";

const SellerChatConversationScreen = ({ route, navigation }) => {
  const { conversationId, userId, customerName, customerPhone } = route.params;
  const { user } = useAuth();
  const { socketMessage } = useSeller();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef();

  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);

  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedBargain, setSelectedBargain] = useState(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [isFinalOffer, setIsFinalOffer] = useState(false);
  const [submittingCounter, setSubmittingCounter] = useState(false);

  let markReadInProgress = false;

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/seller/conversations/${conversationId}/messages`
      );
      if (response.data.success) {
        setMessages(response.data.data.messages);
        // Mark messages as read
        if (!markReadInProgress) markMessagesAsRead();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (markReadInProgress) return;
    markReadInProgress = true;
    try {
      await axios.put(
        `${API_URL}/api/chat/seller/conversations/${conversationId}/mark-read`
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    } finally {
      markReadInProgress = false;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (
      socketMessage &&
      socketMessage.type === "REFRESH_SELLER_CONVERSATIONS" &&
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
      const response = await axios.post(
        `${API_URL}/api/chat/seller/send-message`,
        {
          conversationId: conversationId,
          userId: userId,
          messageText: messageText,
          messageType: "text",
        }
      );

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data.message]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText);
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

  const handleBargainResponse = async (
    bargainOfferId,
    action,
    counterOfferPrice = null,
    isFinal = false
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/bargain/respond/${bargainOfferId}`,
        {
          action: action, // 'accept', 'reject', 'counter'
          counterOfferPrice: counterOfferPrice,
          isFinalOffer: isFinal,
        }
      );

      if (response.data.success) {
        fetchMessages(); // Refresh messages to show updated bargain card

        if (action === "accept") {
          Alert.alert(
            "Offer Accepted",
            "You have accepted this bargain offer."
          );
        } else if (action === "reject") {
          Alert.alert(
            "Offer Rejected",
            "You have rejected this bargain offer."
          );
        } else if (action === "counter") {
          Alert.alert(
            "Counter Offer Sent",
            "Your counter offer has been sent to the customer."
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

  const handleCounterOffer = async () => {
    if (!counterPrice.trim()) {
      Alert.alert("Error", "Please enter your counter offer price");
      return;
    }

    const counterPriceNum = Number.parseFloat(counterPrice);
    const originalPrice = Number.parseFloat(selectedBargain?.original_price);
    const minimumPrice = selectedBargain?.minimum_offer_price
      ? Number.parseFloat(selectedBargain.minimum_offer_price)
      : originalPrice * 0.5; // 50% of original price if no minimum set

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

    if (counterPriceNum < minimumPrice) {
      Alert.alert(
        "Error",
        `Counter offer cannot be less than ₱${minimumPrice.toFixed(2)}`
      );
      return;
    }

    setSubmittingCounter(true);
    try {
      await handleBargainResponse(
        selectedBargain.id,
        "counter",
        counterPriceNum,
        isFinalOffer
      );
      setShowCounterModal(false);
      setSelectedBargain(null);
      setCounterPrice("");
      setIsFinalOffer(false);
    } finally {
      setSubmittingCounter(false);
    }
  };

  const BargainCard = ({ message }) => {
    const bargainData = message.bargain_data;
    const isFromSeller = message.sender_type === "seller";

    if (!bargainData) return null;

    const canRespond = !isFromSeller && bargainData.status === "pending";

    return (
      <View
        className={`flex-row mb-3 ${isFromSeller ? "justify-end" : "justify-start"}`}
      >
        {!isFromSeller && (
          <View className="mr-2">
            <View className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
              <Feather name="user" size={16} color="#6B7280" />
            </View>
          </View>
        )}

        <View
          className={`max-w-xs rounded-lg border ${
            isFromSeller
              ? "border-gray-200 rounded-br-md"
              : "border-gray-200 rounded-bl-md"
          }`}
        >
          <View
            className={`rounded-lg bg-white p-2 ${isFromSeller ? "rounded-br-md" : "rounded-bl-md"}`}
          >
            <View
              className={`px-4 py-3 border-b border-gray-100 ${isFromSeller ? "bg-gray-50" : "bg-gray-50"}`}
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
                  Customer saves ₱
                  {(
                    Number.parseFloat(bargainData?.original_price) -
                    Number.parseFloat(bargainData.current_price)
                  ).toFixed(2)}
                </Text>
              </View>

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
                      ? "⏳ Awaiting Your Response"
                      : bargainData.status === "accepted"
                        ? "✅ Accepted"
                        : bargainData.status === "rejected"
                          ? "❌ Rejected"
                          : bargainData.status?.toUpperCase()}
                  </Text>
                </View>
              </View>

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
                    <TouchableOpacity
                      className="flex-row items-center flex-1 p-3 bg-white border border-gray-300 rounded-lg"
                      onPress={() =>
                        Alert.alert(
                          "Reject Offer",
                          "Are you sure you want to reject this bargain offer?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Reject",
                              onPress: () =>
                                handleBargainResponse(bargainData.id, "reject"),
                            },
                          ]
                        )
                      }
                    >
                      <Feather name="x" size={16} color="#DC2626" />
                      <Text className="ml-1 text-sm font-medium text-red-600">
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {!bargainData.is_final_offer && (
                    <TouchableOpacity
                      className="flex-row items-center justify-center w-full p-3 bg-white border border-gray-300 rounded-lg"
                      onPress={() => {
                        setSelectedBargain(bargainData);
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
          </View>

          <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <Text className="text-xs text-right text-gray-500">
              {formatMessageTime(message.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const MessageItem = ({ message, isLast, showDate }) => {
    const isFromSeller = message.sender_type === "seller";

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
          className={`flex-row mb-3 ${isFromSeller ? "justify-end" : "justify-start"}`}
        >
          {!isFromSeller && (
            <View className="mr-2">
              <View className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                <Feather name="user" size={16} color="#6B7280" />
              </View>
            </View>
          )}

          <View
            className={`max-w-xs px-4 py-2 rounded-2xl ${
              isFromSeller
                ? "bg-blue-600 rounded-br-md"
                : "bg-gray-200 rounded-bl-md"
            }`}
          >
            <Text
              className={`text-base ${isFromSeller ? "text-white" : "text-gray-900"}`}
            >
              {message.message_text}
            </Text>
            <Text
              className={`text-xs mt-1 ${isFromSeller ? "text-blue-100" : "text-gray-500"}`}
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
          <View className="flex-1">
            <Text className="text-xl font-semibold">{customerName}</Text>
            {customerPhone && (
              <Text className="text-sm text-gray-600">{customerPhone}</Text>
            )}
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#2563eb" />
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
          <View className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
            <Feather name="user" size={20} color="#1e40af" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold">{customerName}</Text>
            {customerPhone && (
              <Text className="text-sm text-gray-600">{customerPhone}</Text>
            )}
          </View>
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
              Send a message to {customerName} about your products
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
          className={`p-3 rounded-full ${newMessage.trim() && !sending ? "bg-blue-600" : "bg-gray-300"}`}
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

              {selectedBargain && (
                <View>
                  <View className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                    <View className="flex-row mb-3">
                      <View className="mr-3">
                        {selectedBargain.product_image ? (
                          <Image
                            source={{ uri: selectedBargain.product_image }}
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
                          {selectedBargain.product_name}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Original Price: ₱
                          {Number.parseFloat(
                            selectedBargain.original_price
                          ).toFixed(2)}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Customer Offer: ₱
                          {Number.parseFloat(
                            selectedBargain.current_price
                          ).toFixed(2)}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Minimum Price: ₱
                          {selectedBargain?.minimum_offer_price
                            ? Number.parseFloat(
                                selectedBargain.minimum_offer_price
                              ).toFixed(2)
                            : (
                                Number.parseFloat(
                                  selectedBargain?.original_price
                                ) * 0.5
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
                        value={counterPrice}
                        onChangeText={setCounterPrice}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between p-3 mb-4 border border-gray-300 rounded-lg">
                    <Text className="text-base font-medium">Final Offer</Text>
                    <TouchableOpacity
                      className={`w-12 h-6 rounded-full ${isFinalOffer ? "bg-blue-600" : "bg-gray-300"}`}
                      onPress={() => setIsFinalOffer(!isFinalOffer)}
                    >
                      <View
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transform  ${
                          isFinalOffer ? "translate-x-6" : "translate-x-0.5"
                        }`}
                        style={{
                          transform: [{ translateX: isFinalOffer ? 24 : 2 }],
                        }}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className={`items-center p-4 rounded-lg ${
                      counterPrice.trim() && !submittingCounter
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                    onPress={handleCounterOffer}
                    disabled={!counterPrice.trim() || submittingCounter}
                  >
                    {submittingCounter ? (
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
    </KeyboardAvoidingView>
  );
};

export default SellerChatConversationScreen;
