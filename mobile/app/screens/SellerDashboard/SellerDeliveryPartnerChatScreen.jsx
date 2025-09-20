"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Keyboard,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const SellerDeliveryPartnerChatScreen = ({ navigation, route }) => {
  const { user, token, socketMessage } = useAuth();
  const {
    conversationId,
    deliveryPartnerId,
    deliveryPartnerName,
    deliveryPartnerProfilePicture,
    orderId,
    orderNumber,
    deliveryStatus,
  } = route.params;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/seller/conversations/${conversationId}/messages?orderId=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data.messages);
        // Mark messages as read
        markMessagesAsRead();
      }
    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/api/chat/seller/delivery-partner/conversations/${conversationId}/mark-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            orderId: orderId,
          },
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/seller/delivery-partner/send-message`,
        {
          conversationId,
          deliveryPartnerId,
          messageText,
          messageType: "text",
          orderId, // Include order ID for order-based chat
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchMessages();
      } else {
        Alert.alert("Error", "Failed to send message");
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [conversationId])
  );

  useEffect(() => {
    if (socketMessage && socketMessage.conversationId === conversationId) {
      fetchMessages();
    }
  }, [socketMessage, conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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

  const MessageItem = ({ message, showDate }) => {
    const isSeller = message.sender_type === "seller";

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
          className={`flex-row mb-3 ${isSeller ? "justify-end" : "justify-start"}`}
        >
          {!isSeller && (
            <View className="mr-2">
              {deliveryPartnerProfilePicture ? (
                <Image
                  source={{ uri: deliveryPartnerProfilePicture }}
                  className="w-8 h-8 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <MaterialIcons name="person" size={16} color="#3b82f6" />
                </View>
              )}
            </View>
          )}

          <View
            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              isSeller
                ? "bg-orange-600 rounded-br-md"
                : "bg-gray-200 rounded-bl-md"
            }`}
          >
            <Text
              className={`text-base ${isSeller ? "text-white" : "text-gray-900"}`}
            >
              {message.message_text}
            </Text>

            <Text
              className={`mt-1 text-xs ${isSeller ? "text-orange-100" : "text-gray-500"}`}
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
      <View className="items-center justify-center flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <Text className="text-gray-500">Loading conversation...</Text>
      </View>
    );
  }

  const isDeliveryCompleted = deliveryStatus === "delivered";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={
        Platform.OS === "android" && !keyBoardVisibility ? null : "padding"
      }
    >
      <StatusBar style="dark" />
      <View className="flex flex-col px-4 pb-4 bg-white border-b border-gray-200 pt-14">
        <View className="flex flex-row items-center mb-2">
          <TouchableOpacity
            className="p-2 mr-3 bg-gray-100 rounded-full"
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1">
            {deliveryPartnerProfilePicture ? (
              <Image
                source={{ uri: deliveryPartnerProfilePicture }}
                className="w-10 h-10 mr-3 rounded-full"
              />
            ) : (
              <View className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                <MaterialIcons name="person" size={20} color="#3b82f6" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {deliveryPartnerName}
              </Text>
              <Text className="text-sm text-gray-600">Delivery Partner</Text>
            </View>
          </View>
        </View>

        <View className="px-2 py-2 rounded-lg bg-orange-50">
          <Text className="text-sm font-medium text-orange-800">
            Order: {orderNumber}
          </Text>
          <Text className="text-xs text-orange-600">
            Chat for this order only • Status:{" "}
            {deliveryStatus.replace("_", " ")}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View className="items-center justify-center flex-1 py-20">
            <MaterialIcons
              name="chat-bubble-outline"
              size={60}
              color="#9CA3AF"
            />
            <Text className="mt-4 text-lg font-medium text-gray-600">
              No conversation yet
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Send a message to start communicating about this order
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
                showDate={showDate}
              />
            );
          })
        )}
      </ScrollView>

      {!isDeliveryCompleted && (
        <View className="flex flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
          <TextInput
            className="flex-1 px-4 py-3 mr-3 bg-gray-100 rounded-full"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`p-3 rounded-full ${newMessage.trim() && !sending ? "bg-orange-600" : "bg-gray-300"}`}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={newMessage.trim() && !sending ? "white" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      )}

      {isDeliveryCompleted && (
        <View className="px-4 pt-4 pb-10 bg-gray-100 border-t border-gray-200">
          <Text className="text-center text-gray-600">
            This delivery has been completed. Chat is now closed.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default SellerDeliveryPartnerChatScreen;
