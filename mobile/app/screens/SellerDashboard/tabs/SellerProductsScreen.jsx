"use client";

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";

const SellerProductsScreen = ({ navigation }) => {
  // Placeholder for products state
  const products = [];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">My Products</Text>
        <TouchableOpacity
          className="flex-row items-center px-3 py-2 bg-blue-600 rounded-lg"
          onPress={() => navigation.navigate("AddProduct")}
        >
          <Feather name="plus" size={16} color="white" />
          <Text className="ml-1 font-semibold text-white">Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {products.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10 bg-white border border-gray-200 rounded-lg">
            <Feather name="package" size={48} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium">No Products Yet</Text>
            <Text className="mt-1 text-gray-500">
              Click "Add New" to list your first product.
            </Text>
          </View>
        ) : (
          <Text>Product list would go here.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default SellerProductsScreen;
