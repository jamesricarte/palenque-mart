"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

import StoreTempBanner from "../../assets/images/store_temp_banner.jpg";

const AllVendorsScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingVendors, setFetchingVendors] = useState(false);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const fetchVendors = async (withSearch = false, showSpinner = false) => {
    try {
      if (showSpinner) {
        setFetchingVendors(true);
      }

      const params = {};
      if (withSearch && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (!withSearch && selectedLocation !== "All") {
        params.location = selectedLocation;
      }
      if (!withSearch && selectedCategory !== "All") {
        params.category = selectedCategory;
      }

      const response = await axios.get(`${API_URL}/api/seller/all-vendors`, {
        params,
      });
      if (response.data.success) {
        setVendors(response.data.data.vendors);

        setAvailableLocations(response.data.data.locations);
        setAvailableCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      Alert.alert("Error", "Failed to load vendors");
    } finally {
      setLoading(false);
      if (showSpinner) {
        setFetchingVendors(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVendors();
    setRefreshing(false);
  };

  const handleLocationFilter = (location) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleSearchCancel = () => {
    setIsSearchActive(false);
    setSearchQuery("");
    // Return to current filtered results (not all vendors)
    fetchVendors(false, true);
  };

  const handleSearchSubmit = () => {
    fetchVendors(true, true);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchVendors(false, true);
  }, [selectedLocation, selectedCategory]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) fetchVendors(true, true);
    }, 400);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const formatCardAddress = (city, province) => {
    let formattedCardAddress = "";

    if (city) {
      formattedCardAddress = city;

      if (province)
        formattedCardAddress = formattedCardAddress + ", " + province;
    }

    return formattedCardAddress;
  };

  const VendorCard = ({ vendor }) => (
    <TouchableOpacity
      className="mb-4 bg-white border border-gray-100 rounded-lg shadow-sm"
      onPress={() =>
        navigation.navigate("SellerStore", { sellerId: vendor.id })
      }
    >
      {/* Store Cover - Placeholder */}
      <View className="items-center justify-center h-24 bg-gray-200 rounded-t-lg">
        <Image
          source={StoreTempBanner}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="p-4">
        <View className="flex-row items-start">
          {/* Vendor Logo */}
          <View className="relative mr-3 -mt-8">
            {vendor.store_logo_key ? (
              <Image
                source={{ uri: vendor.store_logo_key }}
                className="w-16 h-16 border-4 border-white rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex items-center justify-center w-16 h-16 bg-gray-300 border-4 border-white rounded-full">
                <Feather name="image" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>
          {/* Vendor Info */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className="text-lg font-semibold text-gray-900"
                numberOfLines={1}
              >
                {vendor.store_name}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#FCD34D" />
                <Text className="ml-1 text-sm font-medium text-gray-700">
                  {vendor.average_rating || "5.0"}
                </Text>
                <Text className="ml-1 text-sm text-gray-500">
                  ({vendor.review_count || 0} reviews)
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={14} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-600" numberOfLines={1}>
                {formatCardAddress(vendor.city, vendor.province)}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Feather name="package" size={14} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-600" numberOfLines={1}>
                Products: {vendor.categories.join(", ")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = ({
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-96">
            <View className="p-4">
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`flex-row items-center justify-between p-3 mb-2 rounded-lg border ${
                    selectedValue === option
                      ? "bg-orange-50 border-orange-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  onPress={() => onSelect(option)}
                >
                  <Text
                    className={`text-base ${
                      selectedValue === option
                        ? "text-orange-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <Ionicons name="checkmark" size={20} color="#EA580C" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
              All Vendors
            </Text>
            <TouchableOpacity className="p-2">
              <Ionicons name="search" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="mt-4 text-gray-600">Loading vendors...</Text>
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

          {isSearchActive ? (
            <View className="flex-row items-center flex-1 mx-4">
              <TextInput
                className="flex-1 px-4 py-3 text-base bg-gray-100 rounded-lg"
                placeholder="Search vendors..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                autoFocus={true}
                returnKeyType="search"
              />
              <TouchableOpacity
                onPress={handleSearchCancel}
                className="p-2 ml-2"
              >
                <Text className="font-medium text-orange-600">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-lg font-semibold text-gray-900">
                All Vendors
              </Text>
              <TouchableOpacity onPress={handleSearchPress} className="p-2">
                <Ionicons name="search" size={24} color="black" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Filter Row - Hide when search is active */}
        {!isSearchActive && (
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setShowLocationModal(true)}
              className="flex-row items-center px-4 py-2 bg-white border border-gray-300 rounded-lg"
            >
              <Feather name="map-pin" size={16} color="#6B7280" />
              <Text className="ml-2 text-sm font-medium text-gray-700">
                {selectedLocation === "All"
                  ? "Location Filter"
                  : selectedLocation}
              </Text>
              <Feather name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="flex-row items-center px-4 py-2 bg-white border border-gray-300 rounded-lg"
            >
              <Feather name="tag" size={16} color="#6B7280" />
              <Text className="ml-2 text-sm font-medium text-gray-700">
                {selectedCategory === "All"
                  ? "Category Filter"
                  : selectedCategory}
              </Text>
              <Feather name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              {vendors.length} Vendor
              {vendors.length !== 1 ? "s" : ""} Found
            </Text>
          </View>

          {fetchingVendors ? (
            <ActivityIndicator size="small" color="black" />
          ) : vendors.length === 0 ? (
            <View className="items-center justify-center flex-1 py-20">
              <Feather name="users" size={64} color="#9CA3AF" />
              <Text className="mt-4 mb-2 text-xl font-semibold text-gray-600">
                No vendors found
              </Text>
              <Text className="px-8 text-center text-gray-500">
                {selectedLocation !== "All" || selectedCategory !== "All"
                  ? "Try adjusting your filters to see more vendors"
                  : "Check back later for new vendors on our platform"}
              </Text>
            </View>
          ) : (
            <>
              {vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Location Filter Modal */}
      <FilterModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="Select Location"
        options={["All", ...availableLocations]}
        selectedValue={selectedLocation}
        onSelect={(location) => handleLocationFilter(location)}
      />

      {/* Category Filter Modal */}
      <FilterModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Select Category"
        options={["All", ...availableCategories]}
        selectedValue={selectedCategory}
        onSelect={(category) => handleCategoryFilter(category)}
      />
    </View>
  );
};

export default AllVendorsScreen;
