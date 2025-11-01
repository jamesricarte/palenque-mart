"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useSeller } from "../../../context/SellerContext";
import { API_URL } from "../../../config/apiConfig";
import { useFocusEffect } from "@react-navigation/native";

const SellerLivestreamScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pastStreams, setPastStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { sellerId } = useSeller();

  const fetchLivestreamHistory = useCallback(async () => {
    try {
      if (!user?.id) return;

      const response = await axios.get(
        `${API_URL}/api/livestream/seller/${sellerId}/history`
      );

      if (response.data.success) {
        // Format the data to match the UI requirements
        const formattedStreams = response.data.data.livestreams.map(
          (stream) => ({
            id: stream.livestream_id,
            title: stream.title,
            date: stream.actual_start_time
              ? formatDateTime(stream.actual_start_time)
              : "N/A",
            views: stream.total_viewers || 0,
            sold: stream.total_sales || 0,
            status: stream.status,
            thumbnail_url: stream.thumbnail_url,
          })
        );
        setPastStreams(formattedStreams);
      }
    } catch (error) {
      console.error(
        "Error fetching livestream history:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchLivestreamHistory();
    }, [fetchLivestreamHistory])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLivestreamHistory().then(() => {
      setRefreshing(false);
    });
  }, [fetchLivestreamHistory]);

  const handleStartNewLivestream = () => {
    navigation.navigate("LivestreamSetup");
  };

  const handleStreamCardPress = (stream) => {
    Alert.alert(
      "Livestream Details",
      "Livestream details will be implemented soon"
    );
  };

  const handleDeleteStream = async (streamId, streamTitle) => {
    Alert.alert(
      "Delete Livestream",
      `Are you sure you want to delete "${streamTitle}"?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${API_URL}/api/livestream/${streamId}`,
                { params: { sellerId } }
              );

              if (response.data.success) {
                Alert.alert("Success", "Livestream deleted successfully");
                // Remove the deleted stream from the list
                setPastStreams(pastStreams.filter((s) => s.id !== streamId));
              }
            } catch (error) {
              console.error(
                "Error deleting livestream:",
                error?.response?.data || error
              );
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Failed to delete livestream"
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const formatDateTime = (time) => {
    const date = new Date(time);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-semibold">Live Selling</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Start New Livestream Button */}
        <View className="p-4">
          <TouchableOpacity
            className="items-center py-4 rounded-md shadow-sm bg-primary"
            onPress={handleStartNewLivestream}
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={24} color="white" />
              <Text className="ml-2 text-lg font-semibold text-white">
                Start New Livestream
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Past Livestreams */}
        <View className="px-4 mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Past Livestreams / History
          </Text>
          {loading ? (
            <View className="items-center justify-center p-8">
              <ActivityIndicator size="large" color="#ea580c" />
              <Text className="mt-2 text-gray-500">
                Loading past livestreams...
              </Text>
            </View>
          ) : pastStreams.length > 0 ? (
            pastStreams.map((stream) => (
              <TouchableOpacity
                key={stream.id}
                onPress={() => handleStreamCardPress(stream)}
                activeOpacity={0.7}
              >
                <View className="p-4 mb-3 bg-white border border-gray-200 rounded-md shadow-sm">
                  <View className="flex-row">
                    <View className="items-center justify-center w-16 h-16 mr-4 bg-gray-100 border border-gray-200 rounded-md">
                      <MaterialCommunityIcons
                        name="image-off-outline"
                        size={24}
                        color="#6B7280"
                      />
                      <Text className="mt-1 text-xs text-gray-500">
                        No Image
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-lg font-semibold text-gray-900">
                        "{stream.title}"
                      </Text>
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="calendar" size={16} color="#6b7280" />
                        <Text className="ml-1 text-sm text-gray-600">
                          {stream.date}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="eye" size={16} color="#6b7280" />
                          <Text className="ml-1 text-sm text-gray-600">
                            {stream.views} views
                          </Text>
                        </View>

                        {/* Products sold, hidden for now */}
                        {/* <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="package-variant"
                            size={16}
                            color="#6b7280"
                          />
                          <Text className="ml-1 text-sm text-gray-600">
                            {stream.sold} products sold
                          </Text>
                        </View> */}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteStream(stream.id, stream.title)
                      }
                      className="ml-2"
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={22}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-12">
              <MaterialCommunityIcons
                name="video-off-outline"
                size={48}
                color="#d1d5db"
              />
              <Text className="mt-4 text-lg font-medium text-gray-500">
                No Past Livestreams
              </Text>
              <Text className="px-8 mt-2 text-center text-gray-400">
                Your completed livestreams will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SellerLivestreamScreen;
