"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";

const AddProductScreen = () => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !stock || !image) {
      Alert.alert(
        "Missing Information",
        "Please fill all fields and select an image."
      );
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock_quantity", stock);
    formData.append("user_id", user.id);

    // Append the image file
    const uriParts = image.uri.split(".");
    const fileType = uriParts[uriParts.length - 1];
    formData.append("productImage", {
      uri: image.uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      const response = await axios.post(
        `${API_URL}/api/seller/add-product`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Product added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Error adding product:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-semibold">Add New Product</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Image Picker */}
        <TouchableOpacity
          className="items-center justify-center w-full h-48 mb-6 bg-gray-200 border-2 border-gray-300 border-dashed rounded-lg"
          onPress={pickImage}
        >
          {image ? (
            <Image
              source={{ uri: image.uri }}
              className="w-full h-full rounded-lg"
            />
          ) : (
            <View className="items-center">
              <Feather name="upload-cloud" size={40} color="#9ca3af" />
              <Text className="mt-2 text-gray-500">Upload Product Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Product Name</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="e.g., Handwoven Basket"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Description</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg h-28"
            placeholder="Describe your product..."
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="mb-1 font-medium text-gray-700">Price (₱)</Text>
            <TextInput
              className="p-3 bg-white border border-gray-300 rounded-lg"
              placeholder="e.g., 500.00"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-1 font-medium text-gray-700">Stock</Text>
            <TextInput
              className="p-3 bg-white border border-gray-300 rounded-lg"
              placeholder="e.g., 50"
              keyboardType="number-pad"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`items-center justify-center p-4 rounded-lg ${isLoading ? "bg-blue-300" : "bg-blue-600"}`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">
              Add Product
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddProductScreen;
