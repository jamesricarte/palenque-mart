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
  Pressable,
} from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useState, useEffect, useCallback } from "react";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";

import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/apiConfig";
import Snackbar from "../../../components/Snackbar";

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
  const { user, authProcessing } = useAuth();
  const route = useRoute();

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

  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const categories = [
    {
      name: "Meat",
      image: MeatCategory,
      color: "#EF5350",
    },
    { name: "Seafood", image: SeafoodCategory, color: "#42A5F5" },
    { name: "Poultry", image: PoultryCategory, color: "#BCAAA4" },
    {
      name: "Vegetables",
      image: VegetablesCategory,
      color: "#66BB6A",
    },
    { name: "Fruits", image: FruitsCategory, color: "#FFCA28" },
    { name: "Grains", image: GrainsCategory, color: "#CFD8DC" },
    { name: "Others", image: null },
  ];

  const categoriesColor = {
    Meat: "#EF5350",
    Seafood: "#42A5F5",
    Poultry: "#BCAAA4",
    Vegetables: "#66BB6A",
    Fruits: "#FFCA28",
    Grains: "#CFD8DC",
    Others: null,
  };

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

  const isWeekday = () => {
    const day = new Date().getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  };

  const formatTime = (time) => {
    if (!time) return null;
    const [hour, minute] = time.split(":");
    let h = parseInt(hour, 10);
    const m = minute.padStart(2, "0");
    const suffix = h >= 12 ? "pm" : "am";
    h = h % 12 || 12; // convert 0 -> 12, 13 -> 1, etc.
    return `${h}:${m} ${suffix}`;
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

  const handleLikePress = () => {
    Alert.alert("Likes Feature", "Likes feature will be implented soon!");
  };

  useEffect(() => {
    fetchHomeData();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchCartCount();
      }
    }, [user])
  );

  useEffect(() => {
    if (route.params?.message) {
      setSnackBarVisible(true);
    }
  }, []);

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
      className="items-center justify-between mr-4"
      onPress={() =>
        navigation.navigate("ProductListing", {
          category: category.name,
          isViewAll: false,
        })
      }
    >
      <View className="w-20 h-20 mb-2 bg-gray-200 border rounded-full border-secondary ">
        {category.name !== "Others" ? (
          <Image
            source={category.image}
            className="w-full h-full rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="bg-[#F69C82] w-full h-full rounded-full relative justify-center items-center">
            <View className="flex-row gap-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={index}
                  className="w-2 h-2 bg-white rounded-full"
                ></View>
              ))}
            </View>
          </View>
        )}
      </View>
      <Text className="text-base font-medium text-center text-gray-700">
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const ProductCard = ({ product, showRating = false }) => (
    <Pressable
      className="w-64 mr-3 bg-white border border-gray-200 rounded-lg shadow-sm"
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
          <View className="absolute px-2 py-1 rounded bg-accent top-2 right-2">
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

        {/* Category label */}
        <View className="flex-row flex-wrap gap-1 mt-2 mb-4">
          <View
            style={{ backgroundColor: categoriesColor[product.category] }}
            className={`px-2 py-0.5 rounded`}
          >
            <Text className="text-xs font-medium text-white">
              {product.category}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-primary">
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
              <View className="p-1 rounded-full bg-accent min-w-5 min-h-5">
                <Ionicons name="bag-outline" size={18} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View className="border-t border-gray-100 mt-1.5" />

        <View className="flex-row flex-wrap items-center justify-between mt-2">
          <Text className="mt-1 text-xs text-gray-400">
            {formatCardAddress(product.city, product.province)}
          </Text>

          <Text className="text-xs text-gray-400">
            {new Date(product.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const VendorCard = ({ vendor }) => (
    <Pressable
      className="mr-3 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm w-96"
      onPress={() =>
        navigation.navigate("SellerStore", { sellerId: vendor.id })
      }
    >
      <View className="relative h-32 bg-gray-300 rounded-t-lg">
        <Image
          source={{ uri: vendor.store_logo_key }}
          className="w-full h-full rounded-t-lg"
          resizeMode="cover"
        />
      </View>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-medium text-center text-black rounded">
            {vendor.store_name}
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text className="ml-1 text-base font-medium">
              {vendor.average_rating || "5.0"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-1 mb-2">
          <Ionicons name="location-outline" size={12} color="#9CA3AF" />
          <Text className="ml-1 text-base text-gray-500" numberOfLines={1}>
            {formatCardAddress(vendor.city, vendor.province)}
          </Text>
        </View>

        {/* Opening/Closing Time */}
        {(() => {
          const isWeek = isWeekday();
          const open = formatTime(
            isWeek ? vendor.weekday_opening_time : vendor.weekend_opening_time
          );
          const close = formatTime(
            isWeek ? vendor.weekday_closing_time : vendor.weekend_closing_time
          );

          if (!open || !close) return null; // Don't show if either time is missing

          return (
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-600">
                {open} - {close}
              </Text>
            </View>
          );
        })()}

        {/* Category labels and Opening Hours */}
        <View className="flex-row flex-wrap gap-1">
          {vendor.categories && vendor.categories.length > 0 ? (
            vendor.categories.map((category, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: categoriesColor[category] || "#9CA3AF",
                }}
                className="px-2 py-0.5 rounded"
              >
                <Text className="text-xs font-medium text-white">
                  {category}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400">No categories</Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (loading || authProcessing) {
    return (
      <View className="flex-1 bg-white">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="mt-4 text-gray-600">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-16 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Image
            source={require("../../../assets/images/Palenque-Logo-v1.png")}
            className="h-16 w-52"
            resizeMode="cover"
          />
          <View className="flex-row items-center">
            <TouchableOpacity className="p-2 mr-2" onPress={handleLikePress}>
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

        <Pressable
          onPress={handleSearchPress}
          className="flex-row items-center px-4 py-4 border border-gray-300 rounded-md"
        >
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text className="flex-1 ml-3 text-lg text-gray-500">
            Search product
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-2 bg-white">
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
              <View className="items-center justify-center h-48">
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
              <View className="h-48 overflow-hidden bg-gray-300 rounded-lg">
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
                    Albay Fresh Meats...
                  </Text>
                </View>

                <View className="absolute flex-row items-center gap-1 px-1 py-0.5 bg-secondary rounded-md top-2 right-2">
                  <View className="w-2 h-2 bg-white rounded-full" />
                  <Text className="text-base text-white">LIVE</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="py-2 bg-white">
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

        <View className="py-2 mt-2 bg-white">
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
              <Text className="font-medium text-primary">View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {homeData.suggestedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showRating={true}
              />
            ))}
          </ScrollView>
        </View>

        <View className="py-2 mt-2 bg-white">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-bold text-gray-900">
              Top market vendors
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("AllVendors")}>
              <Text className="font-medium text-primary">View all</Text>
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

        <View className={user ? "h-4  " : "h-32"} />
      </ScrollView>

      {/* Authentication Buttons - Fixed at bottom */}
      {!user && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pt-1 pb-2 bg-primary">
          <View className="flex flex-row justify-between py-6">
            <TouchableOpacity
              className="flex-1 py-4 mr-2 border-2 border-white rounded-lg"
              onPress={() => navigation.push("Login")}
            >
              <Text className="text-xl font-medium text-center text-white">
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 ml-2 bg-white rounded-lg"
              onPress={() => navigation.push("SignUp")}
            >
              <Text className="text-xl font-medium text-center text-primary">
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
                                  ? "bg-orange-50 border-primary"
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
                                    ? "bg-primary border-primary"
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
                    <Text className="text-2xl font-bold text-primary">
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
                className="items-center p-4 rounded-lg bg-primary"
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

      <Snackbar
        visible={snackBarVisible}
        onDismiss={setSnackBarVisible}
        text={route.params?.message}
      />
    </View>
  );
};

export default HomeScreen;
