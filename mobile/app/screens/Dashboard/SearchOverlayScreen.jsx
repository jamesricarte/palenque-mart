"use client";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";

import { API_URL } from "../../config/apiConfig";
import FilterModal from "./components/FilterModal";

const { height: screenHeight } = Dimensions.get("window");

const SearchOverlayScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    category: "All",
    priceRange: "All",
    sortBy: "relevance",
    rating: "All",
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(1)).current;
  const searchInputRef = useRef(null);

  const fetchSearchSuggestions = async (query) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/products/search-suggestions?q=${query}`
      );
      if (response.data.success) {
        setSearchSuggestions(response.data.data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSearchSuggestions([]);
    }
  };

  const performSearch = async (query, appliedFilters = filters) => {
    if (!query.trim()) return;

    setSearchLoading(true);

    // Fade out suggestions and jump in results
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      setShowResults(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    try {
      const params = new URLSearchParams({
        q: query,
        category:
          appliedFilters.category !== "All" ? appliedFilters.category : "",
        priceRange:
          appliedFilters.priceRange !== "All" ? appliedFilters.priceRange : "",
        sortBy: appliedFilters.sortBy,
        rating: appliedFilters.rating !== "All" ? appliedFilters.rating : "",
      });

      const response = await axios.get(
        `${API_URL}/api/products/search?${params}`
      );
      if (response.data.success) {
        setSearchResults(response.data.data.products);

        // Delay the reveal of product card's shadow on Android
        Animated.timing(elevation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }).start(() => {
          Animated.timing(elevation, {
            toValue: 1,
            duration: 120,
            delay: 200,
            useNativeDriver: false,
          }).start();
        });
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    performSearch(searchQuery);
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
    if (searchQuery.trim()) {
      performSearch(searchQuery, newFilters);
    }
  };

  const handleSortingChange = (sortType) => {
    const newFilters = { ...filters, sortBy: sortType };
    setFilters(newFilters);
    if (searchQuery.trim() && showResults) {
      performSearch(searchQuery, newFilters);
    }
  };

  const handleSearchQueryChange = (text) => {
    setSearchQuery(text);

    // If user is typing and we're showing results, switch back to suggestions
    if (showResults && text !== searchQuery) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowResults(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      // Remove product card's shadow on android
      Animated.timing(elevation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (!showResults) fetchSearchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, showResults]);

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

  const ProductCard = ({ product, showRating = false }) => (
    <Animated.View
      className={`w-full bg-white border border-gray-100 rounded-lg ${
        Platform.OS === "ios" ? "shadow-sm" : ""
      }`}
      style={{ elevation: elevation }}
    >
      <TouchableOpacity
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
    </Animated.View>
  );

  const SortingTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      className="flex-none py-3 bg-white border-b border-gray-200"
    >
      {[
        { label: "Relevance", value: "relevance" },
        { label: "Price: Low to High", value: "price_low" },
        { label: "Price: High to Low", value: "price_high" },
        { label: "Rating", value: "rating" },
        { label: "Newest", value: "newest" },
      ].map((sort) => (
        <TouchableOpacity
          key={sort.value}
          className={`px-3 py-2 mr-3 rounded-lg border ${
            filters.sortBy === sort.value
              ? "bg-orange-500 border-orange-500"
              : "bg-white border-gray-300"
          }`}
          onPress={() => handleSortingChange(sort.value)}
        >
          <Text
            className={`font-medium text-sm ${filters.sortBy === sort.value ? "text-white" : "text-gray-700"}`}
          >
            {sort.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 pt-10">
        {/* Search Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1 px-3 py-2 bg-gray-100 rounded-lg">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              ref={searchInputRef}
              className="flex-1 ml-2 text-base"
              placeholder="Search products, stores..."
              value={searchQuery}
              onChangeText={handleSearchQueryChange}
              onSubmitEditing={handleSearchSubmit}
              autoFocus={true}
            />
          </View>

          {showResults && (
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className="p-1.5 ml-3 bg-orange-500 rounded-lg"
            >
              <Ionicons name="options" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sorting Tabs - Only show when displaying results */}
        {showResults && <SortingTabs />}

        {/* Search Content */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView className="flex-1">
            {searchQuery.trim() === "" ? (
              <View className="p-4">
                <Text className="mb-4 text-lg font-semibold">
                  Recent Searches
                </Text>
                <Text className="text-gray-500">No recent searches</Text>
              </View>
            ) : !showResults ? (
              <View className="p-4">
                <Text className="mb-4 text-lg font-semibold">Suggestions</Text>
                {searchSuggestions.length === 0 &&
                searchQuery.trim().length >= 2 ? (
                  <Text className="text-gray-500">No suggestions found</Text>
                ) : (
                  searchSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      className="py-3 border-b border-gray-100"
                      onPress={() => {
                        setSearchQuery(suggestion);
                        performSearch(suggestion);
                      }}
                    >
                      <Text className="text-gray-700">{suggestion}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : (
              <View className="p-4">
                <Text className="mb-4 text-lg font-semibold">
                  Search Results ({searchResults.length})
                </Text>
                {searchLoading ? (
                  <ActivityIndicator size="small" color="black" />
                ) : searchResults.length === 0 ? (
                  <View className="flex items-center justify-center py-12">
                    <Feather name="search" size={48} color="#9CA3AF" />
                    <Text className="mt-4 text-lg font-medium text-gray-600">
                      No results found
                    </Text>
                    <Text className="mt-2 text-center text-gray-500">
                      Try adjusting your search terms or filters to find what
                      you're looking for.
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap justify-between">
                    {searchResults.map((product) => (
                      <View key={product.id} className="w-1/2 p-2">
                        <ProductCard product={product} showRating={true} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      <FilterModal
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        handleFilterApply={handleFilterApply}
      />
    </View>
  );
};

export default SearchOverlayScreen;
