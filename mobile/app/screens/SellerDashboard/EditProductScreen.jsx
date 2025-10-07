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
import { Picker } from "@react-native-picker/picker";
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

  const [enableMinimumOffer, setEnableMinimumOffer] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category: "",
    subcategory: "",
    unit_type: "per_piece",
    freshness_indicator: "",
    source_origin: "",
    preparation_options: {},
    is_active: true,
    bargaining_enabled: true,
    minimum_offer_price: "",
    is_preorder_enabled: false,
    expected_availability_date: null,
    max_preorder_quantity: "",
  });

  const [originalData, setOriginalData] = useState(null);

  const categories = [
    "Meat",
    "Seafood",
    "Poultry",
    "Vegetables",
    "Fruits",
    "Grains",
    "Others",
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

        const initialFormData = {
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          stock_quantity: productData.stock_quantity?.toString() || "",
          category: productData.category || "",
          subcategory: productData.subcategory || "",
          unit_type: productData.unit_type || "per_piece",
          freshness_indicator: productData.freshness_indicator || "",
          source_origin: productData.source_origin || "",
          preparation_options: productData.preparation_options || {},
          is_active: productData.is_active === 1,
          bargaining_enabled: productData.bargaining_enabled === 1,
          minimum_offer_price:
            productData.minimum_offer_price?.toString() || "",
          is_preorder_enabled: productData.is_preorder_enabled === 1,
          expected_availability_date: productData.expected_availability_date
            ? new Date(productData.expected_availability_date)
            : null,
          max_preorder_quantity:
            productData.max_preorder_quantity?.toString() || "",
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);
        setEnableMinimumOffer(!!productData.minimum_offer_price);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      Alert.alert("Error", "Failed to load product details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;

    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.price !== originalData.price ||
      formData.stock_quantity !== originalData.stock_quantity ||
      formData.category !== originalData.category ||
      formData.subcategory !== originalData.subcategory ||
      formData.unit_type !== originalData.unit_type ||
      formData.freshness_indicator !== originalData.freshness_indicator ||
      formData.source_origin !== originalData.source_origin ||
      formData.is_active !== originalData.is_active ||
      formData.bargaining_enabled !== originalData.bargaining_enabled ||
      formData.minimum_offer_price !== originalData.minimum_offer_price ||
      formData.is_preorder_enabled !== originalData.is_preorder_enabled ||
      formData.max_preorder_quantity !== originalData.max_preorder_quantity ||
      formData.expected_availability_date?.getTime() !==
        originalData.expected_availability_date?.getTime()
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      Alert.alert("No Changes", "No changes detected to save.");
      return;
    }

    try {
      setSaving(true);

      // Validate form
      if (!formData.name.trim()) {
        Alert.alert("Error", "Product name is required");
        return;
      }
      if (!formData.price || Number.parseFloat(formData.price) <= 0) {
        Alert.alert("Error", "Valid price is required");
        return;
      }
      if (
        !formData.stock_quantity ||
        Number.parseInt(formData.stock_quantity) < 0
      ) {
        Alert.alert("Error", "Valid stock quantity is required");
        return;
      }
      if (!formData.category) {
        Alert.alert("Error", "Category is required");
        return;
      }

      if (formData.bargaining_enabled && formData.minimum_offer_price) {
        const minPrice = Number.parseFloat(formData.minimum_offer_price);
        const price = Number.parseFloat(formData.price);
        if (minPrice >= price) {
          Alert.alert(
            "Error",
            "Minimum offer price must be less than the product price"
          );
          return;
        }
      }

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
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        stock_quantity: Number.parseInt(formData.stock_quantity),
        category: formData.category,
        subcategory: formData.subcategory || null,
        unit_type: formData.unit_type,
        freshness_indicator: formData.freshness_indicator || null,
        harvest_date: product.harvest_date || null,
        source_origin: formData.source_origin || null,
        preparation_options: formData.preparation_options,
        is_active: formData.is_active ? 1 : 0,
        bargaining_enabled: formData.bargaining_enabled ? 1 : 0,
        minimum_offer_price:
          enableMinimumOffer && formData.minimum_offer_price
            ? Number.parseFloat(formData.minimum_offer_price)
            : null,
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
      <View className="flex-1 bg-white">
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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-semibold">Edit Product</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !hasChanges()}
          className={`px-4 py-2 rounded-lg ${saving || !hasChanges() ? "bg-gray-400" : "bg-blue-600"}`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="font-semibold text-white">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Product Image Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Product Image
          </Text>
          <View className="items-center">
            <TouchableOpacity className="w-32 h-32 bg-gray-100 rounded-lg">
              {product?.image_keys ? (
                <Image
                  source={{ uri: product.image_keys }}
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center justify-center w-full h-full bg-gray-200 rounded-lg">
                  <Feather name="image" size={32} color="#9ca3af" />
                </View>
              )}
            </TouchableOpacity>

            <View className="p-3 mt-3 border border-gray-200 rounded-lg bg-white">
              <Text className="text-sm font-medium text-gray-700">
                Note: Image editing is currently disabled.
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Basic Information
          </Text>

          {/* Product Name */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Product Name *
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter product name"
              className="p-3 bg-white border border-gray-300 rounded-lg"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Description
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Enter product description"
              multiline
              numberOfLines={3}
              className="p-3 bg-white border border-gray-300 rounded-lg"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Price (₱) *
            </Text>
            <TextInput
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="p-3 bg-white border border-gray-300 rounded-lg"
            />
          </View>

          {/* Stock Quantity */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Stock Quantity *
            </Text>
            <TextInput
              value={formData.stock_quantity}
              onChangeText={(text) =>
                setFormData({ ...formData, stock_quantity: text })
              }
              placeholder="0"
              keyboardType="numeric"
              className="p-3 bg-white border border-gray-300 rounded-lg"
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Category *
            </Text>
            <View className="bg-white border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.category}
                onValueChange={(itemValue) => {
                  setFormData({
                    ...formData,
                    category: itemValue,
                    subcategory: "",
                  });
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
          {formData.category && subcategoriesByCategory[formData.category] && (
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Subcategory
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={formData.subcategory}
                  onValueChange={(itemValue) =>
                    setFormData({ ...formData, subcategory: itemValue })
                  }
                >
                  <Picker.Item label="Select Subcategory" value="" />
                  {subcategoriesByCategory[formData.category].map((subcat) => (
                    <Picker.Item key={subcat} label={subcat} value={subcat} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* Unit Type */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Unit Type *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                "per_kilo",
                "per_250g",
                "per_500g",
                "per_piece",
                "per_bundle",
                "per_pack",
                "per_liter",
                "per_dozen",
              ].map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setFormData({ ...formData, unit_type: unit })}
                  className={`px-3 py-2 rounded-lg border ${
                    formData.unit_type === unit
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-sm ${formData.unit_type === unit ? "text-white font-semibold" : "text-gray-700"}`}
                  >
                    {unit.replace("per_", "").replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Freshness Indicator */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Freshness Indicator
            </Text>
            <TextInput
              value={formData.freshness_indicator}
              onChangeText={(text) =>
                setFormData({ ...formData, freshness_indicator: text })
              }
              placeholder="e.g., Harvested this morning"
              className="p-3 bg-white border border-gray-300 rounded-lg"
            />
          </View>

          {/* Harvest Date (Display Only) */}
          {product?.harvest_date && (
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Harvest Date
              </Text>
              <View className="p-3 border border-gray-300 rounded-lg bg-white">
                <Text className="text-gray-700">
                  {new Date(product.harvest_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <Text className="mt-1 text-sm text-gray-600">
                Harvest date cannot be edited
              </Text>
            </View>
          )}

          {/* Source Origin */}
          <View className="mb-4">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Source Origin
            </Text>
            <TextInput
              value={formData.source_origin}
              onChangeText={(text) =>
                setFormData({ ...formData, source_origin: text })
              }
              placeholder="e.g., Local farm, Imported"
              className="p-3 bg-white border border-gray-300 rounded-lg"
            />
          </View>
        </View>

        {/* Bargaining Settings Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Bargaining Settings
          </Text>

          {/* Enable Bargaining Toggle */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-base font-medium text-gray-900">
                Enable Bargaining
              </Text>
              <Text className="text-sm text-gray-600">
                Allow customers to make offers on this product
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setFormData({
                  ...formData,
                  bargaining_enabled: !formData.bargaining_enabled,
                })
              }
              className={`w-12 h-6 rounded-full ${formData.bargaining_enabled ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <View
                className={`w-5 h-5 bg-white rounded-full shadow-sm transform ${
                  formData.bargaining_enabled
                    ? "translate-x-6"
                    : "translate-x-0.5"
                } mt-0.5`}
              />
            </TouchableOpacity>
          </View>

          {formData.bargaining_enabled && (
            <>
              {/* Enable Minimum Offer Toggle */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-medium text-gray-900">
                    Set Minimum Offer
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Set a minimum acceptable offer price
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const newValue = !enableMinimumOffer;
                    setEnableMinimumOffer(newValue);
                    if (!newValue) {
                      setFormData({ ...formData, minimum_offer_price: "" });
                    }
                  }}
                  className={`w-12 h-6 rounded-full ${enableMinimumOffer ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <View
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform ${
                      enableMinimumOffer ? "translate-x-6" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </TouchableOpacity>
              </View>

              {enableMinimumOffer && (
                <View className="mb-4">
                  <Text className="mb-2 text-base font-medium text-gray-900">
                    Minimum Offer Price (₱)
                  </Text>
                  <TextInput
                    value={formData.minimum_offer_price}
                    onChangeText={(text) =>
                      setFormData({ ...formData, minimum_offer_price: text })
                    }
                    placeholder="Enter minimum acceptable price"
                    keyboardType="decimal-pad"
                    className="p-3 bg-white border border-gray-300 rounded-lg"
                  />
                  <Text className="mt-1 text-sm text-gray-600">
                    The lowest price you're willing to accept for this product
                  </Text>
                </View>
              )}
            </>
          )}

          {!formData.bargaining_enabled && (
            <View className="p-3 border border-gray-200 rounded-lg bg-white">
              <Text className="text-sm text-gray-600">
                Bargaining is currently disabled for this product. Enable
                bargaining to allow customers to make offers.
              </Text>
            </View>
          )}
        </View>

        {/* Pre-order Settings Card */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
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
            <View className="p-3 border border-gray-200 rounded-lg bg-white">
              <Text className="text-sm text-gray-600">
                Pre-orders are currently disabled for this product. Enable
                pre-orders to allow customers to order this product before it's
                available.
              </Text>
            </View>
          )}
        </View>

        <View className="p-4 bg-white border border-gray-200 rounded-lg">
          {/* Product Status */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-base font-medium text-gray-900">
                Product Active
              </Text>
              <Text className="text-sm text-gray-600">
                Enable or disable this product
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setFormData({
                  ...formData,
                  is_active: !formData.is_active,
                })
              }
              className={`w-12 h-6 rounded-full ${formData.is_active ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <View
                className={`w-5 h-5 bg-white rounded-full shadow-sm transform ${
                  formData.is_active ? "translate-x-6" : "translate-x-0.5"
                } mt-0.5`}
              />
            </TouchableOpacity>
          </View>
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
