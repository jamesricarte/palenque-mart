"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";

import { useAuth } from "../../../context/AuthContext";
import { useSeller } from "../../../context/SellerContext";
import { API_URL } from "../../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";

const SellerChatScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { socketMessage } = useSeller();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/chat/seller/conversations`
      );
      if (response.data.success) {
        setConversations(response.data.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching seller conversations:", error);
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
    if (
      socketMessage &&
      socketMessage.type === "REFRESH_SELLER_CONVERSATIONS"
    ) {
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
        navigation.navigate("SellerChatConversation", {
          conversationId: conversation.id,
          userId: conversation.user_id,
          customerName: `${conversation.customer_first_name} ${conversation.customer_last_name}`,
          customerPhone: conversation.customer_phone,
        })
      }
    >
      {/* Customer Avatar */}
      <View className="mr-3">
        <View className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
          <Feather name="user" size={20} color="#F16B44" />
        </View>
        {conversation.seller_unread_count > 0 && (
          <View className="absolute flex items-center justify-center w-5 h-5 bg-primary rounded-full -top-1 -right-1">
            <Text className="text-xs font-bold text-white">
              {conversation.seller_unread_count > 9
                ? "9+"
                : conversation.seller_unread_count}
            </Text>
          </View>
        )}
      </View>

      {/* Conversation Details */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-lg font-semibold text-gray-900">
            {conversation.customer_first_name} {conversation.customer_last_name}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatLastMessageTime(conversation.last_message_at)}
          </Text>
        </View>

        <Text
          className={`text-sm ${conversation.seller_unread_count > 0 ? "text-gray-900 font-medium" : "text-gray-600"}`}
          numberOfLines={2}
        >
          {conversation.last_message_text || "No messages yet"}
        </Text>

        {conversation.customer_phone && (
          <Text className="mt-1 text-xs text-gray-500">
            {conversation.customer_phone}
          </Text>
        )}
      </View>

      {/* Arrow Icon */}
      <View className="ml-2">
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <Text className="text-2xl font-semibold">Customer Messages</Text>
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
              No customer messages yet
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              When customers message you about your products, they'll appear
              here
            </Text>
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

export default SellerChatScreen;
