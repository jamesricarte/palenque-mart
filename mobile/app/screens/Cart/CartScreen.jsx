"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const CartScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());

  const fetchCartItems = async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/cart`);
      if (response.data.success) {
        setCartItems(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCartItems(false);
  };

  const formatUnitType = (unitType) => {
    const unitMap = {
      per_kilo: "Per Kilo",
      per_250g: "Per 250g",
      per_500g: "Per 500g",
      per_piece: "Per Piece",
      per_bundle: "Per Bundle",
      per_pack: "Per Pack",
      per_liter: "Per Liter",
      per_dozen: "Per Dozen",
    };
    return unitMap[unitType] || unitType;
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity <= 0) return;

    setUpdatingItems((prev) => ({ ...prev, [cartId]: true }));

    try {
      const response = await axios.put(`${API_URL}/api/cart/update/${cartId}`, {
        quantity: newQuantity,
      });

      if (response.data.success) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.cart_id === cartId
              ? {
                  ...item,
                  quantity: newQuantity,
                  total_price: (
                    Number.parseFloat(item.price) * newQuantity
                  ).toFixed(2),
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update cart item";
      Alert.alert("Error", errorMessage);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartId]: false }));
    }
  };

  const removeItem = async (cartId, productName) => {
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove "${productName}" from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setUpdatingItems((prev) => ({ ...prev, [cartId]: true }));

            try {
              const response = await axios.delete(
                `${API_URL}/api/cart/remove/${cartId}`
              );

              if (response.data.success) {
                setCartItems((prevItems) =>
                  prevItems.filter((item) => item.cart_id !== cartId)
                );
              }
            } catch (error) {
              console.error("Error removing cart item:", error);
              Alert.alert("Error", "Failed to remove cart item");
            } finally {
              setUpdatingItems((prev) => ({ ...prev, [cartId]: false }));
            }
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + Number.parseFloat(item.total_price),
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const toggleItemSelection = (cartId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cartId)) {
        newSet.delete(cartId);
      } else {
        newSet.add(cartId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.cart_id)));
    }
  };

  const getSelectedTotal = () => {
    return cartItems
      .filter((item) => selectedItems.has(item.cart_id))
      .reduce((sum, item) => sum + Number.parseFloat(item.total_price), 0);
  };

  const getSelectedItemsCount = () => {
    return cartItems
      .filter((item) => selectedItems.has(item.cart_id))
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  if (!user) {
    return (
      <>
        <View className="p-3 border-b border-gray-300 pt-14">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
        </View>

        <View className="items-center justify-center flex-1 px-6">
          <Feather name="shopping-cart" size={80} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Login Required
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Please login to view your cart items
          </Text>
          <TouchableOpacity
            className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="font-semibold text-white">Login</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <View className="flex-row items-center justify-between p-3 border-b border-gray-300 pt-14">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">My Cart</Text>
          <View style={{ width: 30 }} />
        </View>

        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation />
          <Text className="mt-4 text-gray-600">Loading cart items...</Text>
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-3 bg-white border-b border-gray-300 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">My Cart</Text>
        <View className="px-2 py-1 bg-orange-100 rounded-full">
          <Text className="text-sm font-medium text-orange-600">
            {getTotalItems()}
          </Text>
        </View>
      </View>

      {cartItems.length > 0 && (
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={selectAllItems}
          >
            <View
              className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                selectedItems.size === cartItems.length && cartItems.length > 0
                  ? "bg-orange-600 border-orange-600"
                  : "border-gray-300"
              }`}
            >
              {selectedItems.size === cartItems.length &&
                cartItems.length > 0 && (
                  <Feather name="check" size={14} color="white" />
                )}
            </View>
            <Text className="font-medium">
              Select All ({selectedItems.size}/{cartItems.length})
            </Text>
          </TouchableOpacity>
          <Text className="text-sm text-gray-600">
            {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
            selected
          </Text>
        </View>
      )}

      {cartItems.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="items-center justify-center flex-1 px-6">
            <Feather name="shopping-cart" size={80} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              Your cart is empty
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Add some products to your cart to get started
            </Text>
            <TouchableOpacity
              className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Text className="font-semibold text-white">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {cartItems.map((item) => (
              <View
                key={item.cart_id}
                className="p-4 mx-4 mt-4 bg-white rounded-lg shadow-sm"
              >
                <View className="flex-row">
                  {/* Selection Checkbox */}
                  <TouchableOpacity
                    className="mr-3"
                    onPress={() => toggleItemSelection(item.cart_id)}
                  >
                    <View
                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                        selectedItems.has(item.cart_id)
                          ? "bg-orange-600 border-orange-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedItems.has(item.cart_id) && (
                        <Feather name="check" size={14} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Product Image */}
                  <View className="mr-4">
                    {item.image_keys ? (
                      <Image
                        source={{ uri: item.image_keys }}
                        className="w-20 h-20 rounded-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="flex items-center justify-center w-20 h-20 bg-gray-200 rounded-lg">
                        <Feather name="image" size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>

                  {/* Product Details */}
                  <View className="flex-1">
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ProductDetails", {
                          productId: item.product_id,
                        })
                      }
                    >
                      <Text className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center mt-1">
                      {item.store_logo_key ? (
                        <Image
                          source={{ uri: item.store_logo_key }}
                          className="w-4 h-4 mr-2 rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="storefront-outline"
                          size={16}
                          color="#6B7280"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text className="text-sm text-gray-600">
                        {item.store_name}
                      </Text>
                    </View>

                    <Text className="mt-1 text-sm text-gray-500">
                      {formatUnitType(item.unit_type)}
                    </Text>

                    <View className="flex-row items-center justify-between mt-3">
                      <Text className="text-lg font-bold text-orange-600">
                        ₱{Number.parseFloat(item.total_price).toFixed(2)}
                      </Text>

                      {/* Quantity Controls */}
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full"
                          onPress={() =>
                            updateQuantity(item.cart_id, item.quantity - 1)
                          }
                          disabled={
                            item.quantity <= 1 || updatingItems[item.cart_id]
                          }
                        >
                          <Feather name="minus" size={16} color="#374151" />
                        </TouchableOpacity>

                        <View className="flex items-center justify-center w-12 h-8 mx-0">
                          {updatingItems[item.cart_id] ? (
                            <ActivityIndicator size="small" color="#EA580C" />
                          ) : (
                            <Text className="font-semibold text-gray-900">
                              {item.quantity}
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full"
                          onPress={() =>
                            updateQuantity(item.cart_id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.stock_quantity ||
                            updatingItems[item.cart_id]
                          }
                        >
                          <Feather name="plus" size={16} color="#374151" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Stock Warning */}
                    {item.quantity >= item.stock_quantity && (
                      <Text className="mt-1 text-xs text-red-500">
                        Maximum stock reached
                      </Text>
                    )}
                  </View>

                  {/*Keep this empty view to not overlap plus button in quantity */}
                  <View>
                    {/* Remove Button */}
                    <TouchableOpacity
                      className="p-2 ml-2 "
                      onPress={() => removeItem(item.cart_id, item.name)}
                      disabled={updatingItems[item.cart_id]}
                    >
                      <Feather name="trash-2" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Checkout Section */}
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Selected ({getSelectedItemsCount()} items)
              </Text>
              <Text className="text-2xl font-bold text-orange-600">
                ₱{getSelectedTotal().toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              className={`flex items-center justify-center p-4 rounded-lg ${
                selectedItems.size > 0 ? "bg-orange-600" : "bg-gray-300"
              }`}
              onPress={() => {
                if (selectedItems.size === 0) {
                  Alert.alert(
                    "No Items Selected",
                    "Please select items to checkout"
                  );
                  return;
                }

                const selectedCartItems = cartItems.filter((item) =>
                  selectedItems.has(item.cart_id)
                );
                navigation.navigate("Checkout", {
                  items: selectedCartItems,
                  fromCart: true,
                });
              }}
              disabled={selectedItems.size === 0}
            >
              <Text
                className={`text-lg font-semibold ${selectedItems.size > 0 ? "text-white" : "text-gray-500"}`}
              >
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default CartScreen;
