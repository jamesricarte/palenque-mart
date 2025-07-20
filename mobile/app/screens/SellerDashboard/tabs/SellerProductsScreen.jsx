"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const SellerProductsScreen = ({ navigation }) => {
  const route = useRoute();
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.newProductAdded) {
        fetchProducts();
      }
    }, [route.params])
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/seller/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return `₱${Number.parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ProductCard = ({ product }) => (
    <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
      <View className="flex-row">
        {/* Product Image */}
        <View className="w-20 h-20 mr-4 bg-gray-100 rounded-lg">
          {product.image_keys ? (
            <Image
              source={{ uri: product.image_keys }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center justify-center w-full h-full bg-gray-200 rounded-lg">
              <Feather name="image" size={24} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Product Details */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text
              className="flex-1 text-lg font-semibold text-gray-900"
              numberOfLines={2}
            >
              {product.name}
            </Text>
            <View
              className={`ml-2 px-2 py-1 rounded-full ${product.is_active ? "bg-green-100" : "bg-red-100"}`}
            >
              <Text
                className={`text-xs font-medium ${product.is_active ? "text-green-800" : "text-red-800"}`}
              >
                {product.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {product.description && (
            <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>
              {product.description}
            </Text>
          )}

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-lg font-bold text-blue-600">
              {formatPrice(product.price)}
            </Text>
            <Text className="text-sm text-gray-500">
              Stock: {product.stock_quantity}
            </Text>
          </View>

          {product.category && (
            <View className="mt-1">
              <Text className="text-xs text-gray-500">
                Category: {product.category}
              </Text>
            </View>
          )}

          <Text className="mt-1 text-xs text-gray-400">
            Added: {formatDate(product.created_at)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 pt-3 mt-3 border-t border-gray-100">
        <TouchableOpacity className="flex-1 py-2 border border-gray-300 rounded-lg">
          <Text className="font-medium text-center text-gray-700">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-2 bg-blue-600 rounded-lg">
          <Text className="font-medium text-center text-white">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">My Products</Text>
        <TouchableOpacity
          className="flex-row items-center px-3 py-2 bg-blue-600 rounded-lg"
          onPress={() => navigation.navigate("AddProduct")}
        >
          <Feather name="plus" size={16} color="white" />
          <Text className="ml-1 font-semibold text-white">Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-2 text-gray-500">Loading products...</Text>
          </View>
        ) : products.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10 bg-white border border-gray-200 rounded-lg">
            <Feather name="package" size={48} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium">No Products Yet</Text>
            <Text className="mt-1 text-gray-500">
              Click "Add New" to list your first product.
            </Text>
          </View>
        ) : (
          <View>
            <Text className="mb-4 text-sm text-gray-600">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </Text>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SellerProductsScreen;
