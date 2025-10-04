"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback } from "react";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";

import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/apiConfig";

import MeatCategory from "../../../assets/images/homescreen/categories/meat_category.jpg";
import SeafoodCategory from "../../../assets/images/homescreen/categories/seafood_category.jpg";
import PoultryCategory from "../../../assets/images/homescreen/categories/poultry_category.jpg";
import VegetablesCategory from "../../../assets/images/homescreen/categories/vegetables_category.jpg";
import FruitsCategory from "../../../assets/images/homescreen/categories/fruits_category.jpg";
import GrainsCategory from "../../../assets/images/homescreen/categories/grains_category.avif";

import VoucherImage from "../../../assets/images/homescreen/voucher_image.png";
import LiveSteamingImage from "../../../assets/images/homescreen/livestreaming_image.png";

const { height: screenHeight } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [homeData, setHomeData] = useState({
    recommendedProducts: [],
    suggestedProducts: [],
    topVendors: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [addingToCart, setAddingToCart] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPreparations, setSelectedPreparations] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    {
      name: "Meat",
      image: MeatCategory,
    },
    { name: "Seafood", image: SeafoodCategory },
    { name: "Poultry", image: PoultryCategory },
    {
      name: "Vegetables",
      image: VegetablesCategory,
    },
    { name: "Fruits", image: FruitsCategory },
    { name: "Grains", image: GrainsCategory },
  ];

  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/home-data`);
      if (response.data.success) {
        setHomeData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
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

  const isOwnProduct = (product) => {
    return user && product && product.seller_user_id === user.id;
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
    await fetchHomeData();
    setRefreshing(false);
  };

  const handleSearchPress = () => {
    navigation.navigate("SearchOverlay");
  };

  useEffect(() => {
    fetchHomeData();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchCartCount();
      }
    }, [])
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

  const formatCardAddress = (city, province) => {
    let formmatedCardAddress = "";

    if (city) {
      formmatedCardAddress = city;

      if (province)
        formmatedCardAddress = formmatedCardAddress + ", " + province;
    }

    return formmatedCardAddress;
  };

  const CategoryCard = ({ category }) => (
    <TouchableOpacity
      className="items-center mx-3"
      onPress={() =>
        navigation.navigate("ProductListing", {
          category: category.name,
          isViewAll: false,
        })
      }
    >
      <View className="w-16 h-16 mb-2 bg-gray-200 border border-green-600 rounded-full ">
        <Image
          source={category.image}
          className="w-full h-full rounded-full"
          resizeMode="cover"
        />
      </View>
      <Text className="text-base font-medium text-center text-gray-700">
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const ProductCard = ({ product, showRating = false }) => (
    <TouchableOpacity
      className="w-64 mr-3 bg-white border border-gray-100 rounded-lg shadow-sm"
      onPress={() =>
        navigation.navigate("ProductDetails", { productId: product.id })
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
            <Text className="text-xs font-normal text-white">Low Stock</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-medium text-gray-900" numberOfLines={2}>
            {product.name}
          </Text>

          {showRating && (
            <View className="flex-row items-center">
              <Ionicons name="star" size={12} color="#FCD34D" />
              <Text className="ml-1 text-base font-medium">
                {product.average_rating || "0.00"}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center">
          {product.store_logo_key ? (
            <Image
              source={{ uri: product.store_logo_key }}
              className="w-5 h-5 mr-1 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex items-center justify-center w-5 h-5 mr-1 bg-gray-200 rounded-full">
              <Feather name="image" size={9} color="#9CA3AF" />
            </View>
          )}
          <Text className="flex-1 text-base text-[#94A3B8]" numberOfLines={1}>
            {product.store_name}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-1 mb-4 mt-2">
          <View className="px-2 py-0.5 bg-[#42A5F5] rounded">
            <Text className="text-xs font-medium text-white">Fish</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-orange-600">
            ₱{Number.parseFloat(product.price).toFixed(2)}/
            {formatUnitType(product.unit_type)}
          </Text>

          {!isOwnProduct(product) && (
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

        <View className="flex-row flex-wrap items-center justify-between mt-2">
          <Text className="mt-1 text-xs text-gray-400">
            {formatCardAddress(product.city, product.province)}
          </Text>

          <Text className="text-xs text-gray-400">
            {new Date(product.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const VendorCard = ({ vendor }) => (
    <TouchableOpacity
      className="w-96 mr-3 bg-white rounded-lg shadow-sm overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={() =>
        navigation.navigate("SellerStore", { sellerId: vendor.id })
      }
    >
      <View className="relative bg-gray-300 rounded-t-lg h-32">
        <Image
          source={{ uri: vendor.store_logo_key }}
          className="w-full h-full rounded-t-lg"
          resizeMode="cover"
        />
      </View>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-medium text-lg text-center text-black rounded">
            {vendor.store_name}
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text className="ml-1 text-base font-medium">
              {vendor.average_rating || "5.0"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2 mt-1">
          <Ionicons name="location-outline" size={12} color="#9CA3AF" />
          <Text className="ml-1 text-base text-gray-500" numberOfLines={1}>
            {formatCardAddress(vendor.city, vendor.province)}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-1">
          <View className="px-2 py-0.5 bg-[#EF5350] rounded">
            <Text className="text-base font-normal text-white">Meat</Text>
          </View>
          <View className="px-2 py-0.5 bg-[#42A5F5] rounded">
            <Text className="text-base font-normal text-white">Fish</Text>
          </View>
          <View className="px-2 py-0.5 bg-[#66BB6A] rounded">
            <Text className="text-base font-normal text-white">Vegetables</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="items-center justify-center flex-1">
          <Text className="mt-1 text-gray-600">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-16 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Image
            source={require("../../../assets/images/Palenque-Logo-v1.png")}
            className="h-16 w-52"
            resizeMode="cover"
          />
          <View className="flex-row items-center">
            <TouchableOpacity className="p-2 mr-2">
              <Ionicons name="heart-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.push("Cart")}
              className="relative p-2"
            >
              <Ionicons name="bag-outline" size={24} color="black" />
              {cartCount > 0 && (
                <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-1 -right-1">
                  <Text className="text-xs font-bold text-white">
                    {cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSearchPress}
          className="flex-row items-center px-4 py-3 border rounded-md border-gray-300"
        >
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text className="flex-1 ml-3 text-gray-500">Search product</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4 bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {categories.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </ScrollView>
        </View>

        <View className="px-4 py-4">
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <View className="items-center justify-center h-44">
                <Image
                  source={VoucherImage}
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />

                <View className="absolute items-center">
                  <Text className="text-xl font-bold text-white">
                    Get ₱100 Off
                  </Text>
                  <Text className="text-sm text-white">sa unang bili mo!</Text>
                </View>
              </View>
            </View>

            <View className="flex-1 ml-2">
              <View className="h-44 overflow-hidden bg-gray-300 rounded-lg">
                <Image
                  source={LiveSteamingImage}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 left-2">
                  <Text
                    className="px-2 py-1 text-base font-light text-white rounded"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  >
                    BoyBanat Store
                  </Text>
                </View>

                <View className="absolute flex-row items-center gap-1 px-1 py-0.5 bg-green-600 rounded-md top-2 right-2">
                  <View className="w-2 h-2 bg-white rounded-full" />
                  <Text className="text-base text-white">LIVE</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="py-4 bg-white">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-bold text-gray-900">
              Recommended for you
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {homeData.recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showRating={true}
              />
            ))}
          </ScrollView>
        </View>

        <View className="py-4 mt-2 bg-white">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-bold text-gray-900">
              Products you might like
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductListing", {
                  category: "All",
                  isViewAll: true,
                })
              }
            >
              <Text className="font-medium text-orange-500">View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {homeData.suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>

        <View className="py-4 mt-2 bg-white">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-bold text-gray-900">
              Top market vendors
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("AllVendors")}>
              <Text className="font-medium text-orange-500">View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {homeData.topVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </ScrollView>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Authentication Buttons - Fixed at bottom */}
      {!user && (
        <View className="absolute bottom-0 left-0 right-0 bg-[#F16B44] px-4 pt-4 pb-6">
          <View className="flex flex-row justify-between py-6">
            <TouchableOpacity
              className="flex-1 px-4 py-4 border-2 border-white rounded-lg mr-2"
              onPress={() => navigation.push("Login")}
            >
              <Text className="text-xl font-medium text-center text-white">
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 px-4 py-4 bg-white rounded-lg ml-2"
              onPress={() => navigation.push("SignUp")}
            >
              <Text className="text-xl font-medium text-center text-[#F16B44]">
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
                      {selectedProduct?.store_logo_key ? (
                        <Image
                          source={{ uri: selectedProduct?.store_logo_key }}
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
                        {selectedProduct?.store_name}
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

export default HomeScreen;
