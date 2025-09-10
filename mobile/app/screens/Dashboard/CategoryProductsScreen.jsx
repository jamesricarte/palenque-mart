"use client";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  RefreshControl,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const CategoryProductsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { category } = route.params || {};

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "All");
  const [sortBy, setSortBy] = useState("newest");

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/categories`);
      if (response.data.success) {
        setCategories(["All", ...response.data.data.categories]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(["All", "Fish", "Poultry", "Vegetables", "Meat"]);
    }
  };

  const fetchProducts = async (categoryFilter = null, sort = "newest") => {
    try {
      let url = `${API_URL}/api/products/all`;
      const params = new URLSearchParams();

      if (categoryFilter && categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }

      if (sort) {
        params.append("sortBy", sort);
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
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(
      selectedCategory === "All" ? null : selectedCategory,
      sortBy
    );
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(selectedCategory === "All" ? null : selectedCategory);
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory === "All" ? null : selectedCategory, sortBy);
  }, [selectedCategory, sortBy]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatAddress = (product) => {
    const addressParts = [];
    if (product.city) addressParts.push(product.city);
    if (product.province) addressParts.push(product.province);
    return addressParts.join(", ");
  };

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

  const ProductCard = ({ product }) => (
    <TouchableOpacity
      className="flex-1 mx-2 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm"
      onPress={() =>
        navigation.navigate("ProductDetails", { productId: product.id })
      }
    >
      <View className="relative">
        {product.image_keys ? (
          <Image
            source={{ uri: product.image_keys }}
            className="w-full h-40 rounded-t-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="flex items-center justify-center w-full h-40 bg-gray-200 rounded-t-lg">
            <Feather name="image" size={32} color="#9CA3AF" />
          </View>
        )}
        {product.stock_quantity === 0 && (
          <View className="absolute px-2 py-1 bg-red-500 rounded top-2 right-2">
            <Text className="text-xs font-medium text-white">Out of Stock</Text>
          </View>
        )}
        {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
          <View className="absolute px-2 py-1 bg-orange-500 rounded top-2 right-2">
            <Text className="text-xs font-medium text-white">Low Stock</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text
          className="mb-1 text-lg font-semibold text-gray-900"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <View className="flex-row items-center mb-2">
          {product.store_logo_key ? (
            <Image
              source={{
                uri: product.store_logo_key,
              }}
              className="w-4 h-4 mr-2 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex items-center justify-center w-4 h-4 mr-2 bg-gray-300 rounded-full">
              <MaterialCommunityIcons
                name="storefront-outline"
                size={8}
                color="#6B7280"
              />
            </View>
          )}
          <Text className="flex-1 text-sm text-gray-600" numberOfLines={1}>
            by {product.store_name}
          </Text>
        </View>

        {(product.city || product.province) && (
          <View className="flex-row items-center mb-2">
            <Feather name="map-pin" size={12} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
              {formatAddress(product)}
            </Text>
          </View>
        )}

        {product.description && (
          <Text className="mb-2 text-sm text-gray-700" numberOfLines={2}>
            {product.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xl font-bold text-orange-600">
            ₱{Number.parseFloat(product.price).toFixed(2)}
          </Text>
          <Text className="text-sm text-gray-500">
            Stock: {product.stock_quantity}
          </Text>
        </View>

        {product.category && (
          <View className="mb-2">
            <Text className="self-start px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
              {product.category}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="storefront-outline"
              size={12}
              color="#6B7280"
            />
            <Text className="ml-1 text-xs text-gray-500 capitalize">
              {product.account_type}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">
            {new Date(product.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
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
              {category || "All Categories"}
            </Text>
            <View className="w-10" />
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
            {selectedCategory === "All" ? "All Categories" : selectedCategory}
          </Text>
          <View className="w-10" />
        </View>

        <View className="flex flex-row items-center">
          <View className="relative flex-1">
            <TextInput
              className="p-3 pr-10 text-base border border-gray-200 bg-gray-50 rounded-xl"
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons
              name="search"
              size={20}
              color="#6B7280"
              style={{ position: "absolute", right: 12, top: 12 }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Category Filter */}
        <View className="py-4 bg-white border-b border-gray-200">
          <Text className="px-4 mb-3 text-lg font-semibold text-gray-900">
            Filter by Category
          </Text>

          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                isSelected={selectedCategory === item}
                onPress={() => setSelectedCategory(item)}
              />
            )}
          />
        </View>

        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Sort by
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              <SortButton
                sortOption="newest"
                label="Newest"
                isSelected={sortBy === "newest"}
                onPress={() => setSortBy("newest")}
              />
              <SortButton
                sortOption="oldest"
                label="Oldest"
                isSelected={sortBy === "oldest"}
                onPress={() => setSortBy("oldest")}
              />
              <SortButton
                sortOption="price_low"
                label="Price: Low to High"
                isSelected={sortBy === "price_low"}
                onPress={() => setSortBy("price_low")}
              />
              <SortButton
                sortOption="price_high"
                label="Price: High to Low"
                isSelected={sortBy === "price_high"}
                onPress={() => setSortBy("price_high")}
              />
              <SortButton
                sortOption="name_asc"
                label="Name: A-Z"
                isSelected={sortBy === "name_asc"}
                onPress={() => setSortBy("name_asc")}
              />
              <SortButton
                sortOption="name_desc"
                label="Name: Z-A"
                isSelected={sortBy === "name_desc"}
                onPress={() => setSortBy("name_desc")}
              />
            </View>
          </ScrollView>
        </View>

        {/* Products Section */}
        <View className="px-2 py-4">
          {filteredProducts.length > 0 ? (
            <>
              <View className="flex-row items-center justify-between px-2 mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  {searchQuery
                    ? `Search Results (${filteredProducts.length})`
                    : selectedCategory === "All"
                      ? `All Products (${filteredProducts.length})`
                      : `${selectedCategory} (${filteredProducts.length})`}
                </Text>
              </View>

              <View className="flex-row flex-wrap">
                {filteredProducts.map((product) => (
                  <View key={product.id} className="w-1/2">
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="items-center justify-center flex-1 py-20">
              <Feather name="package" size={64} color="#9CA3AF" />
              <Text className="mt-4 mb-2 text-xl font-semibold text-gray-600">
                {searchQuery ? "No products found" : "No products available"}
              </Text>
              <Text className="px-8 text-center text-gray-500">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : selectedCategory === "All"
                    ? "Check back later for new products from our sellers"
                    : `No products available in ${selectedCategory} category`}
              </Text>
              {searchQuery && (
                <TouchableOpacity
                  className="px-6 py-2 mt-4 bg-orange-500 rounded-lg"
                  onPress={() => setSearchQuery("")}
                >
                  <Text className="font-medium text-white">Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CategoryProductsScreen;
