"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const LivestreamSetupScreen = ({ navigation }) => {
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductSelectionModal, setShowProductSelectionModal] =
    useState(false);
  const [thumbnail, setThumbnail] = useState(null);

  const [availableProducts, setAvailableProducts] = useState([
    {
      id: 1,
      name: "Fresh Lettuce",
      price: "₱50",
      emoji: "🥬",
      selected: false,
    },
    { id: 2, name: "Tilapia", price: "₱120", emoji: "🐟", selected: false },
    { id: 3, name: "Pork Belly", price: "₱280", emoji: "🥩", selected: false },
    {
      id: 4,
      name: "Fresh Tomatoes",
      price: "₱40",
      emoji: "🍅",
      selected: false,
    },
    {
      id: 5,
      name: "Chicken Breast",
      price: "₱200",
      emoji: "🐔",
      selected: false,
    },
    {
      id: 6,
      name: "Fresh Carrots",
      price: "₱35",
      emoji: "🥕",
      selected: false,
    },
  ]);

  const handleThumbnailImport = () => {
    Alert.alert(
      "Incoming Feature",
      "Uploading thumbnail will be implemented soon!"
    );
  };

  const handleNext = () => {
    if (!streamTitle.trim()) {
      alert("Please enter a stream title");
      return;
    }

    // Navigate to PreLive screen with setup data
    navigation.navigate("LivestreamSession", {
      streamTitle,
      streamDescription,
      thumbnail,
      selectedProducts,
    });
  };

  const handleProductSelection = (productId) => {
    setAvailableProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, selected: !product.selected }
          : product
      )
    );

    setSelectedProducts((prev) => {
      const product = availableProducts.find((p) => p.id === productId);
      const isCurrentlySelected = prev.some((p) => p.id === productId);

      if (isCurrentlySelected) {
        return prev.filter((p) => p.id !== productId);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    setAvailableProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, selected: false } : product
      )
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-300 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Start Livestream</Text>
        <View></View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="flex-row gap-4 mb-6">
          {/* Thumbnail Upload - Left Side */}
          <View className="w-24">
            <Text className="mb-3 text-base font-medium text-gray-700">
              Thumbnail
            </Text>
            <TouchableOpacity
              className="items-center justify-center w-20 h-20 bg-white border-2 border-gray-300 border-dashed rounded-lg shadow-sm"
              onPress={handleThumbnailImport}
            >
              <MaterialCommunityIcons
                name="image-plus"
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          {/* Title - Right Side */}
          <View className="flex-1">
            <Text className="mb-3 text-base font-medium text-gray-700">
              Title
            </Text>
            <TextInput
              className="px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg"
              placeholder="Enter stream title..."
              value={streamTitle}
              onChangeText={setStreamTitle}
              maxLength={100}
            />
            <Text className="mt-1 ml-2 text-xs text-gray-500">
              {streamTitle.length}/100 characters
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-3 text-base font-medium text-gray-700">
            Description
          </Text>
          <TextInput
            className="px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg"
            placeholder="Enter stream description..."
            value={streamDescription}
            onChangeText={setStreamDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
          />
          <Text className="mt-1 ml-2 text-xs text-gray-500 ">
            {streamDescription.length}/200 characters
          </Text>
        </View>

        {/* Products to Feature */}
        {/* Hidden for now */}
        <View className="hidden mb-6">
          <Text className="mb-3 text-sm font-medium text-gray-700">
            Products to Feature
          </Text>
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
            onPress={() => setShowProductSelectionModal(true)}
          >
            <Ionicons name="add" size={20} color="#ea580c" />
            <Text className="ml-2 font-medium text-primary">Add Products</Text>
          </TouchableOpacity>

          {selectedProducts.length > 0 && (
            <View className="mt-3">
              <Text className="mb-2 text-xs text-gray-500">
                {selectedProducts.length} products selected
              </Text>
              {selectedProducts.map((product) => (
                <View
                  key={product.id}
                  className="flex-row items-center justify-between p-3 mb-2 bg-white border border-gray-200 rounded-lg"
                >
                  <View className="flex-row items-center flex-1">
                    <Text className="mr-3 text-lg">{product.emoji}</Text>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {product.name}
                      </Text>
                      <Text className="text-sm font-bold text-green-600">
                        {product.price}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveProduct(product.id)}
                    className="p-1"
                  >
                    <Ionicons name="close" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-6 bg-primary">
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 py-4 border border-white rounded-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="font-medium text-center text-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-4 bg-white rounded-lg shadow-sm"
            onPress={handleNext}
          >
            <Text className="font-medium text-center text-primary">Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Selection Modal */}
      <Modal
        visible={showProductSelectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductSelectionModal(false)}
      >
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white rounded-t-lg max-h-96">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Select Products</Text>
              <TouchableOpacity
                onPress={() => setShowProductSelectionModal(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {availableProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  className="flex-row items-center p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  onPress={() => handleProductSelection(product.id)}
                >
                  <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-100 border border-gray-200 rounded-lg">
                    <Text className="text-lg">{product.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {product.name}
                    </Text>
                    <Text className="font-bold text-green-600">
                      {product.price}
                    </Text>
                  </View>
                  <View className="w-6 h-6 border-2 border-gray-300 rounded-full">
                    {product.selected && (
                      <View className="w-full h-full bg-primary rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LivestreamSetupScreen;
