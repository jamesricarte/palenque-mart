"use client";

import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

import StoreTempBanner from "../../assets/images/store_temp_banner.jpg";

const { width: screenWidth } = Dimensions.get("window");

const SellerStoreScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { sellerId, fromChatConversation = false } = route.params;

  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [conversationId, setConversationId] = useState(null);

  const [addingToCart, setAddingToCart] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPreparations, setSelectedPreparations] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchStoreData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/seller/store/${sellerId}`
      );
      if (response.data.success) {
        setStoreData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching store data:", error.response.data);
      Alert.alert("Error", "Failed to load store details");
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
        setCartCount(response.data.data.uniqueItems);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const fetchConversationId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/${sellerId}/conversation-id`,
        {
          sellerId: sellerId,
        }
      );
      if (response.data.success) {
        setConversationId(response.data.data.conversationId);
      }
    } catch (error) {
      console.log("Error fetching conversation id:", error.response.data);
    }
  };

  const isOwnProduct = () => {
    return user && storeData && storeData.seller_user_id === user.id;
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (isOwnProduct(product)) {
      Alert.alert(
        "Cannot Add to Cart",
        "You cannot add your own product to cart"
      );
      return;
    }

    setShowPreferenceModal(true);
  };

  const handleConfirmAction = async () => {
    setAddingToCart(true);
    setShowPreferenceModal(false);

    try {
      const response = await axios.post(`${API_URL}/api/cart/add`, {
        productId: selectedProduct.id,
        quantity: selectedQuantity,
      });

      if (response.data.success) {
        Alert.alert("Success", response.data.message);
        fetchCartCount(); // Refresh cart count
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add to cart";
      Alert.alert("Error", errorMessage);
    } finally {
      setAddingToCart(false);
      // Reset preferences
      setSelectedQuantity(1);
      setSelectedPreparations({});
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStoreData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStoreData();
  }, [sellerId]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchCartCount();
      }

      if (sellerId) {
        fetchConversationId();
      }
    }, [sellerId])
  );

  const formatUnitType = (unitType) => {
    const unitMap = {
      per_kilo: "kg",
      per_250g: "250g",
      per_500g: "500g",
      per_piece: "piece",
      per_bundle: "bundle",
      per_pack: "pack",
      per_liter: "liter",
      per_dozen: "dozen",
    };
    return unitMap[unitType] || unitType;
  };

  const handleFollowStore = () => {
    Alert.alert("Coming Soon", "Follow feature will be implemented soon!");
  };

  const handleChatWithStore = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to chat with stores", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (fromChatConversation) {
      navigation.goBack();
    } else {
      // Navigate to chat conversation screen
      navigation.navigate("ChatConversation", {
        conversationId: conversationId,
        sellerId: storeData.id,
        storeName: storeData.store_name,
        storeLogo: storeData.store_logo_key,
        fromSellerStore: true,
      });
    }
  };

  const getFilteredProducts = () => {
    if (!storeData?.products) return [];
    if (selectedCategory === "All") return storeData.products;
    return storeData.products.filter(
      (product) => product.category === selectedCategory
    );
  };

  const ProductCard = ({ product }) => (
    <TouchableOpacity
      className="w-[48%] mb-4 bg-white border border-gray-100 rounded-lg shadow-sm"
      onPress={() =>
        navigation.navigate("ProductDetails", {
          productId: product.id,
          fromSellerStore: true,
        })
      }
    >
      <View className="relative">
        {product.image_keys ? (
          <Image
            source={{ uri: product.image_keys }}
            className="w-full h-32 rounded-t-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="flex items-center justify-center w-full h-32 bg-gray-200 rounded-t-lg">
            <Feather name="image" size={24} color="#9CA3AF" />
          </View>
        )}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <View className="absolute px-2 py-1 bg-orange-500 rounded top-2 left-2">
            <Text className="text-xs font-medium text-white">Low Stock</Text>
          </View>
        )}
        {product.stock_quantity === 0 && (
          <View className="absolute px-2 py-1 bg-red-500 rounded top-2 left-2">
            <Text className="text-xs font-medium text-white">Out of Stock</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text
            className="mb-1 text-sm font-semibold text-gray-900"
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#FCD34D" />
            <Text className="ml-1 text-xs text-gray-500">
              {product.average_rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-bold text-orange-600">
            ₱{Number.parseFloat(product.price).toFixed(2)}/
            {formatUnitType(product.unit_type)}
          </Text>

          {!isOwnProduct() && (
            <TouchableOpacity
              onPress={() => {
                setSelectedProduct(product);
                handleAddToCart(product);
              }}
            >
              <View className="p-1 bg-orange-600 rounded-full min-w-5 min-h-5 opacity-70">
                <Ionicons name="bag-outline" size={15} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-xs text-gray-400">
          Stock: {product.stock_quantity}
        </Text>

        <Text className="text-xs text-gray-400">
          {new Date(product.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Store</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cart")}
            className="relative p-1"
          >
            <Ionicons name="bag-outline" size={24} color="black" />
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
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="mt-4 text-gray-600">Loading store details...</Text>
        </View>
      </View>
    );
  }

  if (!storeData) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Store</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <Feather name="alert-circle" size={64} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Store not found
          </Text>
        </View>
      </View>
    );
  }

  const categories = ["All", ...storeData.categories];
  const filteredProducts = getFilteredProducts();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Store</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          className="relative p-1"
        >
          <Ionicons name="bag-outline" size={24} color="black" />
          {cartCount > 0 && (
            <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
              <Text className="text-xs font-bold text-white">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Store Cover - Placeholder */}
        <View className="items-center justify-center h-32 bg-gray-200">
          <Image
            source={StoreTempBanner}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Store Header */}
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-start">
            {/* Store Logo */}
            <View className="relative -mt-8">
              {storeData.store_logo_key ? (
                <Image
                  source={{ uri: storeData.store_logo_key }}
                  className="w-20 h-20 border-4 border-white rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-20 h-20 bg-gray-300 border-4 border-white rounded-full">
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={32}
                    color="#6B7280"
                  />
                </View>
              )}
            </View>

            {/* Store Info */}
            <View className="flex-1 ml-4">
              <Text className="text-xl font-bold text-gray-900">
                {storeData.store_name}
              </Text>

              <View className="flex-row items-center mt-1">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="star" size={16} color="#FCD34D" />
                  <Text className="ml-1 text-sm font-medium">
                    {storeData.average_rating.toFixed(1)} (
                    {storeData.review_count} Reviews)
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mt-1">
                <Feather name="map-pin" size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600" numberOfLines={1}>
                  {storeData.address.city}, {storeData.address.province}
                </Text>
              </View>

              <View className="flex-row items-center mt-1">
                <Feather name="clock" size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  6:00 AM – 6:00 PM
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="items-center justify-center flex-1 p-3 border border-orange-600 rounded-lg"
              onPress={handleFollowStore}
            >
              <Text className="font-medium text-orange-600">Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center justify-center flex-1 p-3 bg-orange-600 rounded-lg"
              onPress={handleChatWithStore}
            >
              <Text className="font-medium text-white">Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Info */}
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-6">
              <View className="flex-row items-center">
                <Feather name="truck" size={16} color="#10B981" />
                <Text className="ml-2 text-sm text-gray-700">
                  Same-day delivery
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="clock" size={16} color="#10B981" />
                <Text className="ml-2 text-sm text-gray-700">
                  ~30 mins prep
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="shopping-cart" size={16} color="#10B981" />
                <Text className="ml-2 text-sm text-gray-700">
                  Min. Order: ₱150
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="credit-card" size={16} color="#10B981" />
                <Text className="ml-2 text-sm text-gray-700">Cash</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Categories Tab */}
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === category
                      ? "bg-orange-600 border-orange-600"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    className={`text-sm font-medium ${selectedCategory === category ? "text-white" : "text-gray-700"}`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Products Section */}
        <View className="px-4 py-4 bg-white">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Products ({filteredProducts.length})
          </Text>

          {filteredProducts.length === 0 ? (
            <View className="items-center py-8">
              <Feather name="package" size={48} color="#9CA3AF" />
              <Text className="mt-2 text-lg font-medium text-gray-600">
                No products found
              </Text>
              <Text className="text-gray-500">
                {selectedCategory === "All"
                  ? "This store hasn't added any products yet"
                  : `No products in ${selectedCategory} category`}
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>

        {/* Store Info Section */}
        <View className="px-4 py-4 mt-2 bg-white">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Store Information
          </Text>

          {storeData.contact.phone && (
            <View className="flex-row items-center mb-3">
              <Feather name="phone" size={16} color="#6B7280" />
              <Text className="ml-3 text-gray-700">
                {storeData.contact.phone}
              </Text>
            </View>
          )}

          <View className="flex-row items-start mb-3">
            <Feather
              name="map-pin"
              size={16}
              color="#6B7280"
              className="mt-1"
            />
            <Text className="flex-1 ml-3 text-gray-700">
              {storeData.address.full_address}
            </Text>
          </View>

          <View className="flex-row items-start mb-3">
            <Feather
              name="file-text"
              size={16}
              color="#6B7280"
              className="mt-1"
            />
            <View className="flex-1 ml-3">
              <Text className="font-medium text-gray-900">About the Store</Text>
              <Text className="mt-1 text-gray-700">
                {storeData.store_description ||
                  "Family-owned stall offering fresh produce directly from local farmers for over 15 years."}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Feather name="info" size={16} color="#6B7280" className="mt-1" />
            <View className="flex-1 ml-3">
              <Text className="font-medium text-gray-900">Policies</Text>
              <Text className="mt-1 text-gray-700">
                • Delivery available within city limits{"\n"}• Fresh products
                guaranteed{"\n"}• Cash payment only{"\n"}• Contact store for
                special requests
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <TouchableOpacity
          className="absolute p-4 bg-orange-600 rounded-full shadow-lg bottom-6 right-6"
          onPress={() => navigation.navigate("Cart")}
        >
          <View className="flex-row items-center">
            <Ionicons name="bag-outline" size={24} color="white" />
            <View className="px-2 py-1 ml-2 bg-white rounded-full">
              <Text className="text-xs font-bold text-orange-600">
                {cartCount}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Preference Modal */}
      <Modal
        transparent
        visible={showPreferenceModal}
        animationType="slide"
        onRequestClose={() => {
          setShowPreferenceModal(false);
          setSelectedQuantity(1);
        }}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">
                  Select Preferences
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowPreferenceModal(false);
                    setSelectedQuantity(1);
                  }}
                >
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Product Info */}
              <View className="items-center justify-center">
                <View className="flex-row items-center justify-center w-3/4 p-4 rounded-lg">
                  <View className="flex-1 ml-3">
                    <Text className="text-lg font-semibold" numberOfLines={2}>
                      {selectedProduct?.name}
                    </Text>

                    <View className="flex-row items-center mb-2">
                      {storeData?.store_logo_key ? (
                        <Image
                          source={{ uri: storeData?.store_logo_key }}
                          className="w-5 h-5 mr-1 rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex items-center justify-center w-5 h-5 mr-1 bg-gray-200 rounded-full">
                          <Feather name="image" size={9} color="#9CA3AF" />
                        </View>
                      )}
                      <Text
                        className="flex-1 text-xs text-gray-600"
                        numberOfLines={1}
                      >
                        {storeData?.store_name}
                      </Text>
                    </View>

                    <Text className="font-bold text-orange-600">
                      ₱{Number.parseFloat(selectedProduct?.price).toFixed(2)}/
                      {formatUnitType(selectedProduct?.unit_type)}
                    </Text>
                  </View>

                  <Image
                    source={{ uri: selectedProduct?.image_keys }}
                    className="w-24 h-24 rounded-lg"
                    resizeMode="cover"
                  />
                </View>
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
                          Math.min(
                            selectedProduct?.stock_quantity,
                            selectedQuantity + 1
                          )
                        )
                      }
                    >
                      <Feather name="plus" size={20} color="black" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mt-1 text-sm text-gray-500">
                    Max: {selectedProduct?.stock_quantity} available
                  </Text>
                </View>

                {/* Preparation Options */}
                {selectedProduct?.preparation_options &&
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
                        Number.parseFloat(selectedProduct?.price) *
                        selectedQuantity
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
                    Add to Cart
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

export default SellerStoreScreen;
