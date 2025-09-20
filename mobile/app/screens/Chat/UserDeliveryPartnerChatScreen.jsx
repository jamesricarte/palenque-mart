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
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const UserDeliveryPartnerChatScreen = ({ navigation, route }) => {
  const { user, token, socketMessage } = useAuth();
  const {
    conversationId,
    orderId,
    orderNumber,
    deliveryPartnerId,
    deliveryPartnerName,
    deliveryPartnerPhone,
    deliveryPartnerProfilePicture,
    deliveryStatus,
  } = route.params;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollViewRef = useRef(null);

  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);

  const fetchMessages = async () => {
    if (!conversationId) {
      Alert.alert("Error", "Failed to open chat");

      return navigation.goBack();
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/chat/user/delivery-partner/conversations/${conversationId}/messages?orderId=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data.messages);
        // Mark messages as read
        markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversationId) return;

    try {
      await axios.put(
        `${API_URL}/api/chat/user/delivery-partner/conversations/${conversationId}/mark-read`,
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
    if (!newMessage.trim() || sending || !conversationId) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/user/delivery-partner/send-message`,
        {
          conversationId,
          deliveryPartnerId,
          messageText,
          messageType: "text",
          orderId,
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
    }, [orderId, deliveryPartnerId])
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
    const isUser = message.sender_type === "user";

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
          className={`flex-row mb-3 ${isUser ? "justify-end" : "justify-start"}`}
        >
          {!isUser && (
            <View className="mr-2">
              {deliveryPartnerProfilePicture ? (
                <Image
                  source={{ uri: deliveryPartnerProfilePicture }}
                  className="w-8 h-8 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
                    color="#059669"
                  />
                </View>
              )}
            </View>
          )}

          <View
            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              isUser
                ? "bg-orange-600 rounded-br-md"
                : "bg-gray-200 rounded-bl-md"
            }`}
          >
            <Text
              className={`text-base ${isUser ? "text-white" : "text-gray-900"}`}
            >
              {message.message_text}
            </Text>

            <Text
              className={`mt-1 text-xs ${isUser ? "text-orange-100" : "text-gray-500"}`}
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
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="mt-4 text-gray-600">Loading conversation...</Text>
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

      {/* Header */}
      <View className="flex flex-col px-4 pb-4 bg-white border-b border-gray-200 pt-14">
        <View className="flex flex-row items-center mb-2">
          <TouchableOpacity
            className="p-2 mr-3 bg-gray-100 rounded-full"
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1">
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
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {deliveryPartnerName}
              </Text>
              <Text className="text-sm text-gray-600">Delivery Partner</Text>
            </View>
          </View>

          {/* Call Button */}
          <TouchableOpacity
            className="p-2 ml-2 bg-green-100 rounded-full"
            onPress={() => {
              // Handle phone call
              Alert.alert(
                "Call Delivery Partner",
                `Call ${deliveryPartnerName} at ${deliveryPartnerPhone}?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Call",
                    onPress: () => {
                      // In a real app, you would use Linking.openURL(`tel:${deliveryPartnerPhone}`)
                      Alert.alert(
                        "Call Feature",
                        "Phone call functionality would be implemented here"
                      );
                    },
                  },
                ]
              );
            }}
          >
            <Feather name="phone" size={18} color="#059669" />
          </TouchableOpacity>
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
              Start the conversation
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Send a message to communicate with your delivery partner
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

      {/* Message Input */}
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
            {sending ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <Feather
                name="send"
                size={20}
                color={newMessage.trim() && !sending ? "white" : "#9CA3AF"}
              />
            )}
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

export default UserDeliveryPartnerChatScreen;
