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

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/seller/conversations/${conversationId}/messages`
      );
      if (response.data.success) {
        setMessages(response.data.data.messages);
        // Mark messages as read
        await axios.put(
          `${API_URL}/api/chat/seller/conversations/${conversationId}/mark-read`
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
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

  const MessageItem = ({ message, isLast, showDate }) => {
    const isFromSeller = message.sender_type === "seller";

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
    </KeyboardAvoidingView>
  );
};

export default SellerChatConversationScreen;
