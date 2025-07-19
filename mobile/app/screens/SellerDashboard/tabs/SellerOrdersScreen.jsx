"use client";

import { View, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";

const SellerOrdersScreen = () => {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">My Orders</Text>
      </View>
      <View className="items-center justify-center flex-1">
        <Feather name="inbox" size={48} color="#d1d5db" />
        <Text className="mt-4 text-lg font-medium">No Orders Yet</Text>
      </View>
    </View>
  );
};

export default SellerOrdersScreen;
