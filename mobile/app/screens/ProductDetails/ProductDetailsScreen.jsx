"use client";

import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { productId } = route.params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPreparations, setSelectedPreparations] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [actionType, setActionType] = useState(""); // 'cart' or 'buy'

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${productId}`);

      if (response.data.success) {
        setProduct(response.data.data.product);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", "Failed to load product details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/api/cart/count`);
      if (response.data.success) {
        setCartCount(response.data.data.totalItems);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCartCount();
  }, [productId]);

  const formatUnitType = (unitType) => {
    const unitMap = {
      per_kilo: "Per Kilo",
      per_250g: "Per 250g",
      per_500g: "Per 500g",
      per_piece: "Per Piece",
      per_bundle: "Per Bundle",
      per_pack: "Per Pack",
      per_liter: "Per Liter",
      per_dozen: "Per Dozen",
    };
    return unitMap[unitType] || unitType;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const isOwnProduct = () => {
    return user && product && product.seller_user_id === user.id;
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (isOwnProduct()) {
      Alert.alert(
        "Cannot Add to Cart",
        "You cannot add your own product to cart"
      );
      return;
    }

    setActionType("cart");
    setShowPreferenceModal(true);
  };

  const handleBuyNow = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to purchase items", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (isOwnProduct()) {
      Alert.alert("Cannot Purchase", "You cannot purchase your own product");
      return;
    }

    setActionType("buy");
    setShowPreferenceModal(true);
  };

  const handleConfirmAction = async () => {
    setAddingToCart(true);
    setShowPreferenceModal(false);

    try {
      if (actionType === "cart") {
        const response = await axios.post(`${API_URL}/api/cart/add`, {
          productId: product.id,
          quantity: selectedQuantity,
        });

        if (response.data.success) {
          Alert.alert("Success", response.data.message);
          fetchCartCount(); // Refresh cart count
        }
      } else {
        // Buy Now - navigate to checkout
        const buyNowItem = {
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: selectedQuantity,
          unit_type: product.unit_type,
          image_keys: product.image_keys,
          seller_id: product.seller_id,
          store_name: product.store_name,
          store_logo_key: product.store_logo_key,
          preparation_options: selectedPreparations,
          total_price: (
            Number.parseFloat(product.price) * selectedQuantity
          ).toFixed(2),
        };

        navigation.navigate("Checkout", {
          items: [buyNowItem],
          fromCart: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${actionType === "cart" ? "add to cart" : "purchase"}`;
      Alert.alert("Error", errorMessage);
    } finally {
      setAddingToCart(false);
      // Reset preferences
      setSelectedQuantity(1);
      setSelectedPreparations({});
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Product Details</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cart")}
            className="relative"
          >
            <Feather name="shopping-cart" size={24} color="black" />
            {cartCount > 0 && (
              <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
                <Text className="text-xs font-bold text-white">
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation />
          <Text className="mt-4 text-gray-600">Loading product details...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Product Details</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cart")}
            className="relative"
          >
            <Feather name="shopping-cart" size={24} color="black" />
            {cartCount > 0 && (
              <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
                <Text className="text-xs font-bold text-white">
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="items-center justify-center flex-1">
          <Feather name="alert-circle" size={64} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Product not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Product Details</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          className="relative"
        >
          <Feather name="shopping-cart" size={24} color="black" />
          {cartCount > 0 && (
            <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
              <Text className="text-xs font-bold text-white">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Product Image */}
        <View className="bg-white">
          {product.image_keys ? (
            <Image
              source={{ uri: product.image_keys }}
              className="w-full h-80"
              resizeMode="cover"
            />
          ) : (
            <View className="flex items-center justify-center w-full bg-gray-200 h-80">
              <Feather name="image" size={64} color="#9CA3AF" />
            </View>
          )}

          {/* Stock Status Badge */}
          <View className="absolute top-4 right-4">
            {product.stock_quantity === 0 ? (
              <View className="px-3 py-2 bg-red-500 rounded-lg">
                <Text className="font-medium text-white">Out of Stock</Text>
              </View>
            ) : product.stock_quantity <= 10 ? (
              <View className="px-3 py-2 bg-orange-500 rounded-lg">
                <Text className="font-medium text-white">Low Stock</Text>
              </View>
            ) : (
              <View className="px-3 py-2 bg-green-500 rounded-lg">
                <Text className="font-medium text-white">In Stock</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Info */}
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="mb-2 text-2xl font-bold text-gray-900">
            {product.name}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-orange-600">
              ₱{Number.parseFloat(product.price).toFixed(2)}
            </Text>
            <Text className="text-lg text-gray-600">
              {formatUnitType(product.unit_type)}
            </Text>
          </View>

          {product.category && (
            <View className="flex-row items-center mb-2">
              <Text className="px-3 py-1 text-sm font-medium text-orange-600 bg-orange-100 rounded-full">
                {product.category}
              </Text>
              {product.subcategory && (
                <Text className="px-3 py-1 ml-2 text-sm text-gray-600 bg-gray-100 rounded-full">
                  {product.subcategory}
                </Text>
              )}
            </View>
          )}

          <Text className="text-lg text-gray-500">
            Stock: {product.stock_quantity} available
          </Text>
        </View>

        {/* Store Info */}
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Store Information
          </Text>

          <View className="flex-row items-center mb-2">
            {product.store_logo_key ? (
              <Image
                source={{
                  uri: product.store_logo_key,
                }}
                className="w-12 h-12 mr-3 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-300 rounded-full">
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={24}
                  color="#6B7280"
                />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {product.store_name}
              </Text>
              <Text className="text-sm text-gray-600 capitalize">
                {product.account_type} seller
              </Text>
            </View>
          </View>

          {product.store_description && (
            <Text className="text-gray-700">{product.store_description}</Text>
          )}

          {product.pickup_address && (
            <View className="flex-row items-start mt-3">
              <Feather
                name="map-pin"
                size={16}
                color="#6B7280"
                className="mt-1"
              />
              <Text className="flex-1 ml-2 text-gray-600">
                {product.pickup_address}
              </Text>
            </View>
          )}

          {!isOwnProduct() && (
            <TouchableOpacity
              className="flex-row items-center justify-center p-3 mt-3 border border-orange-600 rounded-lg"
              onPress={() =>
                Alert.alert("Chat", "Chat feature will be implemented soon!")
              }
            >
              <Feather name="message-circle" size={20} color="#EA580C" />
              <Text className="ml-2 font-medium text-orange-600">
                Chat with Store
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Product Details */}
        {product.description && (
          <View className="p-4 bg-white border-b border-gray-200">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Description
            </Text>
            <Text className="leading-6 text-gray-700">
              {product.description}
            </Text>
          </View>
        )}

        {/* Freshness & Source Info */}
        {(product.freshness_indicator ||
          product.harvest_date ||
          product.source_origin) && (
          <View className="p-4 bg-white border-b border-gray-200">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Freshness & Source
            </Text>

            {product.freshness_indicator && (
              <View className="flex-row items-center mb-2">
                <Feather name="clock" size={16} color="#10B981" />
                <Text className="ml-2 text-gray-700">
                  {product.freshness_indicator}
                </Text>
              </View>
            )}

            {product.harvest_date && (
              <View className="flex-row items-center mb-2">
                <Feather name="calendar" size={16} color="#10B981" />
                <Text className="ml-2 text-gray-700">
                  Harvested: {formatDate(product.harvest_date)}
                </Text>
              </View>
            )}

            {product.source_origin && (
              <View className="flex-row items-center">
                <Feather name="map-pin" size={16} color="#10B981" />
                <Text className="ml-2 text-gray-700">
                  Source: {product.source_origin}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Preparation Options */}
        {product.preparation_options &&
          Object.values(product.preparation_options).some(
            (option) => option
          ) && (
            <View className="p-4 bg-white border-b border-gray-200">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                Available Preparation
              </Text>
              <View className="flex-row flex-wrap">
                {Object.entries(product.preparation_options).map(
                  ([option, available]) =>
                    available && (
                      <View
                        key={option}
                        className="px-3 py-1 mb-2 mr-2 bg-blue-100 rounded-full"
                      >
                        <Text className="text-sm font-medium text-blue-800 capitalize">
                          {option}
                        </Text>
                      </View>
                    )
                )}
              </View>
            </View>
          )}

        {/* Additional Info */}
        <View className="p-4 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Additional Information
          </Text>
          <Text className="mb-1 text-gray-600">
            Listed: {new Date(product.created_at).toLocaleDateString()}
          </Text>
          <Text className="text-gray-600">
            Last updated: {new Date(product.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isOwnProduct() && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 items-center justify-center p-4 border-2 border-orange-600 rounded-lg ${product.stock_quantity === 0 ? "opacity-50" : ""}`}
              onPress={handleAddToCart}
              disabled={product.stock_quantity === 0 || addingToCart}
            >
              {addingToCart ? (
                <ActivityIndicator color="#EA580C" />
              ) : (
                <>
                  <Feather name="shopping-cart" size={20} color="#EA580C" />
                  <Text className="mt-1 font-semibold text-orange-600">
                    Add to Cart
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 items-center justify-center p-4 bg-orange-600 rounded-lg ${product.stock_quantity === 0 ? "opacity-50" : ""}`}
              onPress={handleBuyNow}
              disabled={product.stock_quantity === 0}
            >
              <Feather name="zap" size={20} color="white" />
              <Text className="mt-1 font-semibold text-white">Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Preference Modal */}
      <Modal
        transparent
        visible={showPreferenceModal}
        animationType="slide"
        onRequestClose={() => setShowPreferenceModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl max-h-96">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">
                  Select Preferences
                </Text>
                <TouchableOpacity onPress={() => setShowPreferenceModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quantity Selection */}
                <View className="mb-4">
                  <Text className="mb-2 text-lg font-medium">Quantity</Text>
                  <View className="flex-row items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <TouchableOpacity
                      className="items-center justify-center w-10 h-10 bg-white rounded-full"
                      onPress={() =>
                        setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                      }
                    >
                      <Feather name="minus" size={20} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold">
                      {selectedQuantity}
                    </Text>
                    <TouchableOpacity
                      className="items-center justify-center w-10 h-10 bg-white rounded-full"
                      onPress={() =>
                        setSelectedQuantity(
                          Math.min(product.stock_quantity, selectedQuantity + 1)
                        )
                      }
                    >
                      <Feather name="plus" size={20} color="black" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mt-1 text-sm text-gray-500">
                    Max: {product.stock_quantity} available
                  </Text>
                </View>

                {/* Preparation Options */}
                {product.preparation_options &&
                  Object.keys(product.preparation_options).length > 0 && (
                    <View className="mb-4">
                      <Text className="mb-2 text-lg font-medium">
                        Preparation Options
                      </Text>
                      {Object.entries(product.preparation_options).map(
                        ([option, available]) =>
                          available && (
                            <TouchableOpacity
                              key={option}
                              className={`flex-row items-center p-3 mb-2 rounded-lg border ${
                                selectedPreparations[option]
                                  ? "bg-orange-50 border-orange-600"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                              onPress={() =>
                                setSelectedPreparations((prev) => ({
                                  ...prev,
                                  [option]: !prev[option],
                                }))
                              }
                            >
                              <View
                                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                                  selectedPreparations[option]
                                    ? "bg-orange-600 border-orange-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedPreparations[option] && (
                                  <Feather
                                    name="check"
                                    size={12}
                                    color="white"
                                  />
                                )}
                              </View>
                              <Text className="flex-1 capitalize">
                                {option.replace("_", " ")}
                              </Text>
                            </TouchableOpacity>
                          )
                      )}
                    </View>
                  )}

                {/* Total Price */}
                <View className="p-4 mb-4 bg-gray-100 rounded-lg">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-medium">Total Price:</Text>
                    <Text className="text-2xl font-bold text-orange-600">
                      ₱
                      {(
                        Number.parseFloat(product.price) * selectedQuantity
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Button */}
              <TouchableOpacity
                className="items-center p-4 bg-orange-600 rounded-lg"
                onPress={handleConfirmAction}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    {actionType === "cart" ? "Add to Cart" : "Buy Now"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductDetailsScreen;
