"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";

const ChatScreen = ({ navigation }) => {
  const { user, socketMessage } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/chat/conversations`);
      if (response.data.success) {
        setConversations(response.data.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [user])
  );

  useEffect(() => {
    if (socketMessage && socketMessage.type === "REFRESH_USER_CONVERSATIONS") {
      fetchConversations(false);
    }
  }, [socketMessage]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations(false);
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const ConversationItem = ({ conversation }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
      onPress={() =>
        navigation.navigate("ChatConversation", {
          conversationId: conversation.id,
          sellerId: conversation.seller_id,
          storeName: conversation.store_name,
          storeLogo: conversation.store_logo_url,
        })
      }
    >
      {/* Store Logo */}
      <View className="mr-3">
        {conversation.store_logo_url ? (
          <Image
            source={{ uri: conversation.store_logo_url }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
            <MaterialCommunityIcons
              name="storefront-outline"
              size={20}
              color="#6B7280"
            />
          </View>
        )}
        {conversation.user_unread_count > 0 && (
          <View className="absolute flex items-center justify-center w-5 h-5 bg-orange-600 rounded-full -top-1 -right-1">
            <Text className="text-xs font-bold text-white">
              {conversation.user_unread_count > 9
                ? "9+"
                : conversation.user_unread_count}
            </Text>
          </View>
        )}
      </View>

      {/* Conversation Details */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-lg font-semibold text-gray-900">
            {conversation.store_name}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatLastMessageTime(conversation.last_message_at)}
          </Text>
        </View>

        <Text
          className={`text-sm ${conversation.user_unread_count > 0 ? "text-gray-900 font-medium" : "text-gray-600"}`}
          numberOfLines={2}
        >
          {conversation.last_message_text || "Start a conversation"}
        </Text>
      </View>

      {/* Arrow Icon */}
      <View className="ml-2">
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <Text className="text-2xl font-semibold">Messages</Text>
        </View>

        <View className="items-center justify-center flex-1 px-6">
          <Feather name="message-circle" size={80} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Login Required
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Please login to view your messages
          </Text>
          <TouchableOpacity
            className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="font-semibold text-white">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <Text className="text-2xl font-semibold">Messages</Text>
        </View>

        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation />
          <Text className="mt-4 text-gray-600">Loading conversations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-semibold">Messages</Text>
      </View>

      {conversations.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="items-center justify-center flex-1 px-6">
            <Feather name="message-circle" size={80} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              No conversations yet
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Start shopping and chat with sellers about their products
            </Text>
            <TouchableOpacity
              className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
              onPress={() => navigation.navigate("Home")}
            >
              <Text className="font-semibold text-white">Browse Products</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ChatScreen;
