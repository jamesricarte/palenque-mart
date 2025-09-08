"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";

const EditProductScreen = ({ navigation, route }) => {
  const { productId } = route.params;
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    is_preorder_enabled: false,
    expected_availability_date: null,
    max_preorder_quantity: "",
  });

  useFocusEffect(
    useCallback(() => {
      fetchProductDetails();
    }, [])
  );

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/seller/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const productData = response.data.data.product;
        setProduct(productData);
        setFormData({
          is_preorder_enabled: productData.is_preorder_enabled === 1,
          expected_availability_date: productData.expected_availability_date
            ? new Date(productData.expected_availability_date)
            : null,
          max_preorder_quantity:
            productData.max_preorder_quantity?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      Alert.alert("Error", "Failed to load product details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate form
      if (formData.is_preorder_enabled) {
        if (!formData.expected_availability_date) {
          Alert.alert(
            "Error",
            "Expected availability date is required for pre-orders"
          );
          return;
        }
        if (
          !formData.max_preorder_quantity ||
          Number.parseInt(formData.max_preorder_quantity) <= 0
        ) {
          Alert.alert(
            "Error",
            "Maximum pre-order quantity must be greater than 0"
          );
          return;
        }
      }

      const updateData = {
        ...product,
        is_preorder_enabled: formData.is_preorder_enabled ? 1 : 0,
        expected_availability_date: formData.expected_availability_date
          ? formData.expected_availability_date.toISOString()
          : null,
        max_preorder_quantity: formData.max_preorder_quantity
          ? Number.parseInt(formData.max_preorder_quantity)
          : null,
      };

      const response = await axios.put(
        `${API_URL}/api/seller/products/${productId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Product updated successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const currentDate = new Date();
      if (selectedDate < currentDate) {
        Alert.alert(
          "Error",
          "Expected availability date cannot be in the past"
        );
        return;
      }
      setFormData({ ...formData, expected_availability_date: selectedDate });
    }
  };

  const formatDate = (date) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Edit Product</Text>
        </View>
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-2 text-gray-500">Loading product details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-semibold">Edit Product</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="font-semibold text-white">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Product Info Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Product Information
          </Text>

          <View className="flex-row">
            {/* Product Image */}
            <View className="w-20 h-20 mr-4 bg-gray-100 rounded-lg">
              {product?.image_keys ? (
                <Image
                  source={{ uri: product.image_keys }}
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center justify-center w-full h-full bg-gray-200 rounded-lg">
                  <Feather name="image" size={24} color="#9ca3af" />
                </View>
              )}
            </View>

            {/* Product Details */}
            <View className="flex-1">
              <Text
                className="text-lg font-semibold text-gray-900"
                numberOfLines={2}
              >
                {product?.name}
              </Text>
              <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>
                {product?.description}
              </Text>
              <Text className="mt-2 text-lg font-bold text-blue-600">
                ₱{Number.parseFloat(product?.price || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="p-3 mt-3 border border-gray-200 rounded-lg bg-gray-50">
            <Text className="text-sm font-medium text-gray-700">
              Note: Product details and image editing are currently disabled.
              Only pre-order settings can be modified.
            </Text>
          </View>
        </View>

        {/* Pre-order Settings Card */}
        <View className="p-4 bg-white border border-gray-200 rounded-lg">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Pre-order Settings
          </Text>

          {/* Enable Pre-order Toggle */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-base font-medium text-gray-900">
                Enable Pre-orders
              </Text>
              <Text className="text-sm text-gray-600">
                Allow customers to pre-order this product
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setFormData({
                  ...formData,
                  is_preorder_enabled: !formData.is_preorder_enabled,
                })
              }
              className={`w-12 h-6 rounded-full ${formData.is_preorder_enabled ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <View
                className={`w-5 h-5 bg-white rounded-full shadow-sm transform ${
                  formData.is_preorder_enabled
                    ? "translate-x-6"
                    : "translate-x-0.5"
                } mt-0.5`}
              />
            </TouchableOpacity>
          </View>

          {formData.is_preorder_enabled && (
            <>
              {/* Expected Availability Date */}
              <View className="mb-4">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Expected Availability Date *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center justify-between p-3 bg-white border border-gray-300 rounded-lg"
                >
                  <Text
                    className={`${formData.expected_availability_date ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {formatDate(formData.expected_availability_date)}
                  </Text>
                  <Feather name="calendar" size={20} color="#6b7280" />
                </TouchableOpacity>
                <Text className="mt-1 text-sm text-gray-600">
                  When will this product be available for delivery?
                </Text>
              </View>

              {/* Max Pre-order Quantity */}
              <View className="mb-4">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Maximum Pre-order Quantity *
                </Text>
                <TextInput
                  value={formData.max_preorder_quantity}
                  onChangeText={(text) =>
                    setFormData({ ...formData, max_preorder_quantity: text })
                  }
                  placeholder="Enter maximum quantity"
                  keyboardType="numeric"
                  className="p-3 bg-white border border-gray-300 rounded-lg"
                />
                <Text className="mt-1 text-sm text-gray-600">
                  Maximum number of units customers can pre-order
                </Text>
              </View>
            </>
          )}

          {!formData.is_preorder_enabled && (
            <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <Text className="text-sm text-gray-600">
                Pre-orders are currently disabled for this product. Enable
                pre-orders to allow customers to order this product before it's
                available.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal transparent={true} animationType="slide">
          <View
            className="justify-end flex-1"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="p-4 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold">Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Feather name="x" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={formData.expected_availability_date || new Date()}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="p-3 mt-4 bg-blue-600 rounded-lg"
              >
                <Text className="font-semibold text-center text-white">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default EditProductScreen;
