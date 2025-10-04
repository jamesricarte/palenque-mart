"use client";

import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const LivestreamSummaryScreen = ({ route, navigation }) => {
  const { streamTitle, streamDuration, totalViewers, productsSold } =
    route.params;

  const formatSummaryDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Stream Ended</Text>
      </View>

      <View className="items-center justify-center flex-1 p-8">
        <View className="items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
          <Ionicons name="checkmark" size={40} color="#10b981" />
        </View>

        <Text className="mb-2 text-xl font-semibold text-gray-900">
          Stream ended successfully!
        </Text>

        <View className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="eye" size={20} color="#6b7280" />
              <Text className="ml-2 text-gray-600">Total Viewers</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {totalViewers}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="package-variant"
                size={20}
                color="#6b7280"
              />
              <Text className="ml-2 text-gray-600">Products Sold</Text>
            </View>
            <Text className="text-xl font-bold text-green-600">
              {productsSold}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#6b7280" />
              <Text className="ml-2 text-gray-600">Duration</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {formatSummaryDuration(streamDuration)}
            </Text>
          </View>
        </View>

        <View className="flex-row w-full max-w-sm gap-3 mt-8">
          <TouchableOpacity
            className="flex-1 py-3 border border-gray-300 rounded-lg"
            onPress={() => {
              /* View Analytics */
            }}
          >
            <Text className="font-medium text-center text-gray-700">
              View Analytics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 bg-blue-600 rounded-lg"
            onPress={() => navigation.pop(2)}
          >
            <Text className="font-medium text-center text-white">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LivestreamSummaryScreen;
