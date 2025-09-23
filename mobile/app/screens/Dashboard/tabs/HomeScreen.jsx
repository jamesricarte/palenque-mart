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

import TopVendorCover01 from "../../../assets/images/homescreen/top-market-vendors_image_01.png";
import TopVendorCover02 from "../../../assets/images/homescreen/top-market-vendors_image_02.png";

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

  const vendorImages = [TopVendorCover01, TopVendorCover02];

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
        setCartCount(response.data.data.totalItems);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
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
      <Text className="text-xs font-medium text-center text-gray-700">
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const ProductCard = ({ product, showRating = false }) => (
    <TouchableOpacity
      className="w-40 mr-3 bg-white border border-gray-100 rounded-lg shadow-sm"
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
            <Text className="text-xs font-medium text-white">Low Stock</Text>
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

          {showRating && (
            <View className="flex-row items-center">
              <Ionicons name="star" size={12} color="#FCD34D" />
              <Text className="ml-1 text-xs text-gray-500">
                {product.average_rating || "0.00"}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center mb-2">
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
          <Text className="flex-1 text-xs text-gray-600" numberOfLines={1}>
            {product.store_name}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-orange-600">
            ₱{Number.parseFloat(product.price).toFixed(2)}/
            {formatUnitType(product.unit_type)}
          </Text>

          <View className="p-1 bg-orange-600 rounded-full min-w-5 min-h-5 opacity-70">
            <Ionicons name="bag-outline" size={12} color="white" />
          </View>
        </View>

        <View className="flex-row flex-wrap items-center justify-between">
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
    <TouchableOpacity className="w-48 mr-3 bg-white border border-gray-100 rounded-lg shadow-sm">
      <View className="relative h-24 bg-gray-300 rounded-t-lg">
        <Image
          source={vendor.image}
          className="w-full h-full rounded-t-lg"
          resizeMode="cover"
        />
      </View>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-medium text-center text-black rounded">
            {vendor.store_name}
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text className="ml-1 text-sm font-medium">
              {vendor.average_rating || "5.0"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="mt-1 text-xs text-gray-500">
            {vendor.city || "Legazpi City, Albay"}
          </Text>

          <View className="px-2 py-1 bg-green-100 rounded">
            <Text className="text-xs font-medium text-green-600">Open</Text>
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
          className="flex-row items-center px-4 py-3 bg-gray-100 rounded-lg"
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
              <View className="items-center justify-center h-32">
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
              <View className="h-32 overflow-hidden bg-gray-300 rounded-lg">
                <Image
                  source={LiveSteamingImage}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 left-2">
                  <Text
                    className="px-2 py-1 text-xs font-light text-white rounded"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  >
                    BoyBanat Store
                  </Text>
                </View>

                <View className="absolute flex-row items-center gap-1 px-1 py-0.5 bg-green-600 rounded-sm top-2 right-2">
                  <View className="w-2 h-2 bg-white rounded-full" />
                  <Text className="text-xs text-white">Live</Text>
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
            <TouchableOpacity>
              <Text className="font-medium text-orange-500">View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {homeData.topVendors.map((vendor, index) => {
              if (index < 2) {
                vendor.image = vendorImages[index];
              } else vendor.image = vendorImages[0];
              return <VendorCard key={vendor.id} vendor={vendor} />;
            })}
          </ScrollView>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Authentication Buttons - Fixed at bottom */}
      {!user && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300">
          <View className="flex flex-row justify-center gap-4 px-6 py-6">
            <TouchableOpacity
              className="flex-1 px-6 py-3 border-2 border-black rounded-xl max-w-32"
              onPress={() => navigation.push("Login")}
            >
              <Text className="text-lg font-semibold text-center text-black">
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 px-6 py-3 bg-black rounded-xl max-w-32"
              onPress={() => navigation.push("SignUp")}
            >
              <Text className="text-lg font-semibold text-center text-white">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;
