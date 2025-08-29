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
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [unitType, setUnitType] = useState("per_piece");
  const [freshnessIndicator, setFreshnessIndicator] = useState("");
  const [harvestDate, setHarvestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sourceOrigin, setSourceOrigin] = useState("");
  const [preparationOptions, setPreparationOptions] = useState({
    cut: false,
    sliced: false,
    whole: false,
    cleaned: false,
  });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Fish",
    "Meat",
    "Poultry",
    "Vegetables",
    "Fruits",
    "Spices",
    "Grains",
  ];

  const subcategoriesByCategory = {
    Meat: [
      "Pork Belly",
      "Pork Chop",
      "Ground Pork",
      "Beef",
      "Chicken",
      "Other",
    ],
    Fish: ["Tilapia", "Bangus", "Tuna", "Salmon", "Other"],
    Vegetables: ["Leafy Greens", "Root Vegetables", "Herbs", "Other"],
    Fruits: ["Citrus", "Tropical", "Berries", "Other"],
    Spices: ["Local Spices", "Imported Spices", "Herbs", "Other"],
    Grains: ["Rice", "Corn", "Wheat", "Other"],
  };

  const unitTypes = [
    { label: "Per Kilo", value: "per_kilo" },
    { label: "Per 250g", value: "per_250g" },
    { label: "Per 500g", value: "per_500g" },
    { label: "Per Piece", value: "per_piece" },
    { label: "Per Bundle", value: "per_bundle" },
    { label: "Per Pack", value: "per_pack" },
    { label: "Per Liter", value: "per_liter" },
    { label: "Per Dozen", value: "per_dozen" },
  ];

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

  const togglePreparationOption = (option) => {
    setPreparationOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setHarvestDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !stock || !image || !category || !unitType) {
      Alert.alert(
        "Missing Information",
        "Please fill all required fields and select an image."
      );
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock_quantity", stock);
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    formData.append("unit_type", unitType);
    formData.append("freshness_indicator", freshnessIndicator);
    formData.append("harvest_date", harvestDate.toISOString().split("T")[0]);
    formData.append("source_origin", sourceOrigin);
    formData.append("preparation_options", JSON.stringify(preparationOptions));
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
      navigation.navigate("SellerDashboard", {
        screen: "SellerProducts",
      });
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

        {/* Product Name */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Product Name *</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="e.g., Tilapia - Freshwater Fish"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Category *</Text>
          <View className="bg-white border border-gray-300 rounded-lg">
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => {
                setCategory(itemValue);
                setSubcategory(""); // Reset subcategory when category changes
              }}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Subcategory */}
        {category && subcategoriesByCategory[category] && (
          <View className="mb-4">
            <Text className="mb-1 font-medium text-gray-700">Subcategory</Text>
            <View className="bg-white border border-gray-300 rounded-lg">
              <Picker
                selectedValue={subcategory}
                onValueChange={setSubcategory}
              >
                <Picker.Item label="Select Subcategory" value="" />
                {subcategoriesByCategory[category].map((subcat) => (
                  <Picker.Item key={subcat} label={subcat} value={subcat} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Unit Type */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Unit Type *</Text>
          <View className="bg-white border border-gray-300 rounded-lg">
            <Picker selectedValue={unitType} onValueChange={setUnitType}>
              {unitTypes.map((unit) => (
                <Picker.Item
                  key={unit.value}
                  label={unit.label}
                  value={unit.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Price & Stock */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="mb-1 font-medium text-gray-700">Price (₱) *</Text>
            <TextInput
              className="p-3 bg-white border border-gray-300 rounded-lg"
              placeholder="e.g., 120.00"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-1 font-medium text-gray-700">
              Stock (per unit type) *
            </Text>
            <TextInput
              className="p-3 bg-white border border-gray-300 rounded-lg"
              placeholder="e.g., 50"
              keyboardType="number-pad"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        {/* Freshness Indicator */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">
            Freshness Indicator
          </Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="e.g., Harvested this morning, Slaughtered today"
            value={freshnessIndicator}
            onChangeText={setFreshnessIndicator}
          />
        </View>

        {/* Harvest/Slaughter Date */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">
            Harvest/Slaughter Date
          </Text>
          <TouchableOpacity
            className="p-3 bg-white border border-gray-300 rounded-lg"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-gray-700">
              {harvestDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={harvestDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Source/Origin */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Source/Origin</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="e.g., Sourced from Daraga Public Market"
            value={sourceOrigin}
            onChangeText={setSourceOrigin}
          />
        </View>

        {/* Description */}
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

        {/* Preparation Options */}
        <View className="mb-4">
          <Text className="mb-2 font-medium text-gray-700">
            Available Preparation Options
          </Text>
          <View className="p-3 bg-white border border-gray-300 rounded-lg">
            {Object.entries(preparationOptions).map(([option, isSelected]) => (
              <TouchableOpacity
                key={option}
                className="flex-row items-center mb-2"
                onPress={() => togglePreparationOption(option)}
              >
                <View
                  className={`w-5 h-5 border-2 rounded mr-3 ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
                >
                  {isSelected && (
                    <Feather
                      name="check"
                      size={12}
                      color="white"
                      style={{ alignSelf: "center", marginTop: 1 }}
                    />
                  )}
                </View>
                <Text className="text-gray-700 capitalize">{option}</Text>
              </TouchableOpacity>
            ))}
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
