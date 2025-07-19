"use client"

import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native"
import { useState, useEffect } from "react"
import Feather from "@expo/vector-icons/Feather"
import axios from "axios"
import { API_URL } from "../../config/apiConfig"
import { useAuth } from "../../context/AuthContext"

const SellerProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Using a generic endpoint that might exist or creating a simple query
      const response = await axios.get(`${API_URL}/api/seller/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          seller_id: user.id,
        },
      })

      if (response.data.success) {
        setProducts(response.data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      // For now, we'll set empty array if endpoint doesn't exist
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = (productId) => {
    Alert.alert("Delete Product", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteProduct(productId) },
    ])
  }

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/seller/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Remove product from local state
      setProducts(products.filter((product) => product.id !== productId))
      Alert.alert("Success", "Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      Alert.alert("Error", "Failed to delete product")
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">My Products</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading products...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">My Products</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center px-3 py-2 bg-blue-600 rounded-lg"
          onPress={() => navigation.navigate("AddProduct")}
        >
          <Feather name="plus" size={16} color="white" />
          <Text className="ml-1 font-semibold text-white">Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {products.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10 bg-white border border-gray-200 rounded-lg">
            <Feather name="package" size={48} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium">No Products Yet</Text>
            <Text className="mt-1 text-gray-500 text-center px-4">
              Click "Add New" to list your first product and start selling.
            </Text>
            <TouchableOpacity
              className="mt-4 px-6 py-3 bg-blue-600 rounded-lg"
              onPress={() => navigation.navigate("AddProduct")}
            >
              <Text className="font-semibold text-white">Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {products.map((product) => (
              <View key={product.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <View className="p-4">
                  <View className="flex-row">
                    {/* Product Image */}
                    <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4">
                      {product.image_url ? (
                        <Image
                          source={{ uri: product.image_url }}
                          className="w-full h-full rounded-lg"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Feather name="image" size={24} color="#9ca3af" />
                        </View>
                      )}
                    </View>

                    {/* Product Info */}
                    <View className="flex-1">
                      <Text className="text-lg font-semibold mb-1">{product.name}</Text>
                      <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                        {product.description}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-green-600">
                          ₱{Number.parseFloat(product.price).toFixed(2)}
                        </Text>
                        <Text className="text-sm text-gray-500">Stock: {product.stock_quantity}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row mt-4 space-x-2">
                    <TouchableOpacity className="flex-1 py-2 bg-blue-100 rounded-lg">
                      <Text className="text-center text-blue-600 font-medium">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-2 bg-red-100 rounded-lg"
                      onPress={() => handleDeleteProduct(product.id)}
                    >
                      <Text className="text-center text-red-600 font-medium">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default SellerProductsScreen
