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

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const DeliveryPartnerChatConversationScreen = ({ navigation, route }) => {
  const { user, token, socketMessage } = useAuth();
  const { conversationId, sellerId, storeName, storeLogo } = route.params;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/delivery-partner/conversations/${conversationId}/messages`,
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
      console.error("Error fetching messages:", error.response.data);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/api/chat/delivery-partner/conversations/${conversationId}/mark-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        `${API_URL}/api/chat/delivery-partner/send-message`,
        {
          conversationId,
          sellerId,
          messageText,
          messageType: "text",
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

  const MessageBubble = ({ message }) => {
    const isDeliveryPartner = message.sender_type === "delivery_partner";

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

    return (
      <View
        className={`mb-3 ${isDeliveryPartner ? "items-end" : "items-start"}`}
      >
        <View
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            isDeliveryPartner
              ? "bg-green-600 rounded-br-md"
              : "bg-gray-200 rounded-bl-md"
          }`}
        >
          <Text
            className={`text-base ${isDeliveryPartner ? "text-white" : "text-gray-900"}`}
          >
            {message.message_text}
          </Text>
        </View>
        <Text className="mt-1 text-xs text-gray-500">
          {formatMessageTime(message.created_at)}
          {message.is_read === 1 && isDeliveryPartner && (
            <Text className="text-green-600"> ✓✓</Text>
          )}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <Text className="text-gray-500">Loading conversation...</Text>
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
      <View className="flex flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="p-2 mr-3 bg-gray-100 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>

        <View className="flex-row items-center flex-1">
          {storeLogo ? (
            <Image
              source={{ uri: storeLogo }}
              className="w-10 h-10 mr-3 rounded-full"
            />
          ) : (
            <View className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-200 rounded-full">
              <MaterialIcons name="store" size={20} color="#6B7280" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {storeName}
            </Text>
            <Text className="text-sm text-gray-600">Seller</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
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
              Send a message to communicate about the delivery
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </ScrollView>

      {/* Message Input */}
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
          className={`p-3 rounded-full ${newMessage.trim() && !sending ? "bg-green-600" : "bg-gray-300"}`}
        >
          <MaterialIcons
            name="send"
            size={20}
            color={newMessage.trim() && !sending ? "white" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default DeliveryPartnerChatConversationScreen;
