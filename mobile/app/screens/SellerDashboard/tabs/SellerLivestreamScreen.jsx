"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const SellerLivestreamScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Dummy data
  const upcomingStreams = [
    {
      id: 1,
      title: "Fresh Seafood Friday",
      date: "Fri, Oct 4 – 6:00 PM",
      products: ["Shrimp", "Tilapia", "Salmon"],
    },
  ];

  const ongoingStreams = [
    {
      id: 1,
      title: "Morning Market Deals",
      viewers: 243,
      products: 5,
      duration: "15:23",
    },
  ];

  const pastStreams = [
    {
      id: 1,
      title: "Weekend Veggie Sale",
      date: "Sept 28, 2025 – 2:00 PM",
      views: "1.2k",
      sold: 8,
    },
    {
      id: 2,
      title: "Pork & Beef Promo",
      date: "Sept 21, 2025 – 10:00 AM",
      views: "980",
      sold: 15,
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleStartNewLivestream = () => {
    navigation.navigate("LivestreamSetup");
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Livestreams</Text>
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
            className="items-center py-4 bg-blue-600 rounded-lg shadow-sm"
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

        {/* Upcoming Livestreams */}
        {upcomingStreams.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Upcoming Livestreams
            </Text>
            {upcomingStreams.map((stream) => (
              <View
                key={stream.id}
                className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <View className="flex-row items-center mb-2">
                  <Ionicons name="calendar" size={20} color="#6b7280" />
                  <Text className="ml-2 text-gray-600">{stream.date}</Text>
                </View>
                <Text className="mb-2 text-lg font-semibold text-gray-900">
                  "{stream.title}"
                </Text>
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={20}
                    color="#6b7280"
                  />
                  <Text className="ml-2 text-gray-600">
                    Featuring: {stream.products.join(", ")}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="flex-1 py-2 border border-gray-300 rounded-lg">
                    <Text className="font-medium text-center text-gray-700">
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 py-2 bg-red-100 border border-red-200 rounded-lg">
                    <Text className="font-medium text-center text-red-600">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Ongoing Livestreams */}
        {ongoingStreams.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Ongoing Livestreams
            </Text>
            {ongoingStreams.map((stream) => (
              <View
                key={stream.id}
                className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 mr-2 bg-red-500 rounded-full" />
                  <Text className="font-semibold text-red-600">LIVE NOW</Text>
                </View>
                <Text className="mb-2 text-lg font-semibold text-gray-900">
                  "{stream.title}"
                </Text>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="eye" size={16} color="#6b7280" />
                    <Text className="ml-1 text-gray-600">
                      {stream.viewers} viewers
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={16}
                      color="#6b7280"
                    />
                    <Text className="ml-1 text-gray-600">
                      {stream.products} products linked
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="flex-1 py-2 bg-blue-600 rounded-lg">
                    <Text className="font-medium text-center text-white">
                      View Stream
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 py-2 bg-red-600 rounded-lg">
                    <Text className="font-medium text-center text-white">
                      End Stream
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Past Livestreams */}
        <View className="px-4 mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Past Livestreams / History
          </Text>
          {pastStreams.length > 0 ? (
            pastStreams.map((stream) => (
              <View
                key={stream.id}
                className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <View className="flex-row">
                  <View className="items-center justify-center w-16 h-16 mr-4 bg-gray-100 border border-gray-200 rounded-lg">
                    <MaterialCommunityIcons
                      name="image-off-outline"
                      size={24}
                      color="#6B7280"
                    />
                    <Text className="mt-1 text-xs text-gray-500">No Image</Text>
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
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name="package-variant"
                          size={16}
                          color="#6b7280"
                        />
                        <Text className="ml-1 text-sm text-gray-600">
                          {stream.sold} products sold
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-2 pt-3 mt-3 border-t border-gray-100">
                  <TouchableOpacity className="flex-1 py-2 border border-gray-300 rounded-lg">
                    <Text className="font-medium text-center text-gray-700">
                      View Analytics
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 py-2 bg-blue-600 rounded-lg">
                    <Text className="font-medium text-center text-white">
                      Replay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
