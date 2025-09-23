"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useState, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const ProductListingScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { category, isViewAll } = route.params || {};

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || "All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [priceRange, setPriceRange] = useState("All");
  const [minRating, setMinRating] = useState(0);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/categories`);
      if (response.data.success) {
        setCategories(["All", ...response.data.data.categories]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([
        "All",
        "Seafood",
        "Poultry",
        "Vegetables",
        "Meat",
        "Fruits",
        "Grains",
      ]);
    }
  };

  const fetchProducts = async (
    categoryFilter = null,
    sort = "newest",
    priceRange = "All",
    rating = 0
  ) => {
    setFilterLoading(true);

    try {
      let url = `${API_URL}/api/products/all`;
      const params = new URLSearchParams();

      if (categoryFilter && categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }

      if (sort) {
        params.append("sortBy", sort);
      }

      if (priceRange) {
        params.append("priceRange", priceRange);
      }

      if (rating > 0) {
        params.append("minRating", rating);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(
      selectedCategory === "All" ? null : selectedCategory,
      sortBy,
      priceRange,
      minRating
    );
    setRefreshing(false);
  };

  const handleSearchPress = () => {
    navigation.navigate("SearchOverlay");
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(selectedCategory === "All" ? null : selectedCategory);
  }, []);

  useEffect(() => {
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts(
      selectedCategory === "All" ? null : selectedCategory,
      sortBy,
      priceRange,
      minRating
    );
  }, [selectedCategory, sortBy, priceRange, minRating]);

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

  const ProductCard = ({ product }) => (
    <TouchableOpacity
      className="w-full bg-white border border-gray-100 rounded-lg shadow-sm"
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

          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#FCD34D" />
            <Text className="ml-1 text-xs text-gray-500">
              {product.average_rating || "0.00"}
            </Text>
          </View>
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

  const CategoryCard = ({ category, isSelected, onPress }) => (
    <TouchableOpacity
      className={`px-4 py-2 mx-2 rounded-full border ${
        isSelected
          ? "bg-orange-500 border-orange-500"
          : "bg-white border-gray-300"
      }`}
      onPress={onPress}
    >
      <Text
        className={`font-medium ${isSelected ? "text-white" : "text-gray-700"}`}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const SortButton = ({ sortOption, label, isSelected, onPress }) => (
    <TouchableOpacity
      className={`px-3 py-2 mx-1 rounded-lg border ${
        isSelected
          ? "bg-orange-500 border-orange-500"
          : "bg-white border-gray-300"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-700"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex gap-4 px-4 pt-16 pb-6 bg-white border-b border-gray-200">
          <View className="flex flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              {isViewAll
                ? "Products You Might Like"
                : selectedCategory === "All"
                  ? "All Categories"
                  : selectedCategory}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.push("Cart")}
              className="relative p-2"
            >
              <Ionicons name="bag-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation />
          <Text className="mt-4 text-gray-600">Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex gap-4 px-4 pt-16 pb-6 bg-white border-b border-gray-200">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            {isViewAll
              ? "Products You Might Like"
              : selectedCategory === "All"
                ? "All Categories"
                : selectedCategory}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.push("Cart")}
            className="relative p-2"
          >
            <Ionicons name="bag-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSearchPress}
          className="flex-row items-center px-4 py-3 bg-gray-100 rounded-lg"
        >
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text className="flex-1 ml-3 text-gray-500">Search products...</Text>
        </TouchableOpacity>

        {/* Filter and Sort Row */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setShowFilterDrawer(true)}
            className="flex-row items-center px-4 py-2 bg-white border border-gray-300 rounded-lg"
          >
            <Ionicons name="filter" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm font-medium text-gray-700">
              Filter
            </Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1 ml-3"
          >
            <View className="flex-row">
              <SortButton
                sortOption="newest"
                label="Newest"
                isSelected={sortBy === "newest"}
                onPress={() => setSortBy("newest")}
              />
              <SortButton
                sortOption="price_low"
                label="Price ↑"
                isSelected={sortBy === "price_low"}
                onPress={() => setSortBy("price_low")}
              />
              <SortButton
                sortOption="price_high"
                label="Price ↓"
                isSelected={sortBy === "price_high"}
                onPress={() => setSortBy("price_high")}
              />
              <SortButton
                sortOption="rating"
                label="Rating"
                isSelected={sortBy === "rating"}
                onPress={() => setSortBy("rating")}
              />
            </View>
          </ScrollView>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Products Section */}
        <View className="px-4 py-4">
          {filterLoading ? (
            <ActivityIndicator className="mt-4" size="small" color="black" />
          ) : products.length === 0 ? (
            <View className="items-center justify-center flex-1 py-20">
              <Feather name="package" size={64} color="#9CA3AF" />
              <Text className="mt-4 mb-2 text-xl font-semibold text-gray-600">
                No products available
              </Text>
              <Text className="px-8 text-center text-gray-500">
                {selectedCategory === "All"
                  ? "Check back later for new products from our sellers"
                  : `No products available in ${selectedCategory} category`}
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  {isViewAll
                    ? `Recommended Products (${products.length})`
                    : selectedCategory === "All"
                      ? `All Products (${products.length})`
                      : `${selectedCategory} (${products.length})`}
                </Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 6,
                  paddingBottom: 26,
                }}
              >
                <View className="flex-row flex-wrap justify-between">
                  {products.map((product) => (
                    <View key={product.id} className="w-1/2 p-2">
                      <ProductCard product={product} />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showFilterDrawer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterDrawer(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterDrawer(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              {/* Category Filter */}
              <View className="mb-6">
                <Text className="mb-3 text-base font-medium">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {categories.map((cat) => (
                      <CategoryCard
                        key={cat}
                        category={cat}
                        isSelected={selectedCategory === cat}
                        onPress={() => setSelectedCategory(cat)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Price Range Filter */}
              <View className="mb-6">
                <Text className="mb-3 text-base font-medium">Price Range</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    { label: "All", value: "All" },
                    { label: "Under ₱50", value: "under50" },
                    { label: "₱50-₱100", value: "50to100" },
                    { label: "₱100-₱200", value: "100to200" },
                    { label: "Over ₱200", value: "over200" },
                  ].map((price) => (
                    <TouchableOpacity
                      key={price.value}
                      className={`px-4 py-2 mr-2 rounded-lg border ${
                        priceRange === price.value
                          ? "bg-orange-500 border-orange-500"
                          : "bg-white border-gray-300"
                      }`}
                      onPress={() => setPriceRange(price.value)}
                    >
                      <Text
                        className={`font-medium ${priceRange === price.value ? "text-white" : "text-gray-700"}`}
                      >
                        {price.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Rating Filter */}
              <View className="mb-6">
                <Text className="mb-3 text-base font-medium">
                  Minimum Rating
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row justify-between gap-2">
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        className={`px-3 py-2 rounded-lg border ${
                          minRating === rating
                            ? "bg-orange-500 border-orange-500"
                            : "bg-white border-gray-300"
                        }`}
                        onPress={() => setMinRating(rating)}
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name="star"
                            size={16}
                            color={minRating === rating ? "white" : "#FCD34D"}
                          />
                          <Text
                            className={`ml-1 ${minRating === rating ? "text-white" : "text-gray-700"}`}
                          >
                            {rating === 0 ? "All" : `${rating}+`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity
                className="w-full py-3 bg-orange-500 rounded-lg"
                onPress={() => setShowFilterDrawer(false)}
              >
                <Text className="font-semibold text-center text-white">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductListingScreen;
