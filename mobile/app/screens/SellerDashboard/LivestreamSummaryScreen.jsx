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
    const secs = seconds % 60;

    let result = "";

    if (hours > 0) result += `${hours}h `;
    if (mins > 0) result += `${mins}m `;
    if (secs > 0 || result === "") result += `${secs}s`; // show seconds even if 0m 0h

    return result.trim();
  };

  return (
    <View className="flex-1 bg-white">
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

        <View className="w-full max-w-sm p-6 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <View className="flex-row">
            <View className="items-center justify-center w-20 h-20 mr-4 bg-gray-100 border border-gray-200 rounded-md">
              <MaterialCommunityIcons
                name="image-off-outline"
                size={24}
                color="#6B7280"
              />
              <Text className="mt-1 text-xs text-gray-500">No Image</Text>
            </View>
            <View className="justify-center flex-1">
              <Text className="mb-1 text-sm font-medium text-gray-600">
                Stream Title
              </Text>
              <Text className="text-lg font-semibold text-gray-900">
                "{streamTitle}"
              </Text>
            </View>
          </View>
        </View>

        <View className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#6b7280" />
              <Text className="ml-2 text-gray-600">Duration</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {formatSummaryDuration(streamDuration)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="eye" size={20} color="#6b7280" />
              <Text className="ml-2 text-gray-600">Total Viewers</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {totalViewers}
            </Text>
          </View>

          {/* Products sold, hidden for now */}
          {/* <View className="flex-row items-center justify-between">
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
          </View> */}
        </View>

        <View className="w-full max-w-sm mt-8">
          <TouchableOpacity
            className="py-3 bg-primary rounded-lg"
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
