"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Route params can be either cart items or single product (from Buy Now)
  const { items: routeItems, fromCart = false } = route.params || {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    address_type: "home",
    recipient_name: user?.first_name + " " + user?.last_name || "",
    phone_number: user?.phone || "",
    street_address: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    landmark: "",
    is_default: false,
  });

  const deliveryFee = 50.0;

  useEffect(() => {
    if (fromCart && routeItems) {
      // Use the selected items passed from CartScreen
      setItems(routeItems);
      setLoading(false);
    } else if (!fromCart && routeItems) {
      // For Buy Now from product details
      setItems(routeItems);
      setLoading(false);
    } else {
      navigation.goBack();
    }
    fetchUserAddresses();
  }, []);

  const fetchUserAddresses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/addresses`);
      if (response.data.success) {
        const userAddresses = response.data.data.addresses;
        setAddresses(userAddresses);

        // Set default address as selected
        const defaultAddress = userAddresses.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (userAddresses.length > 0) {
          setSelectedAddress(userAddresses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const addNewAddress = async () => {
    // Validate required fields
    if (
      !newAddress.recipient_name ||
      !newAddress.phone_number ||
      !newAddress.street_address ||
      !newAddress.barangay ||
      !newAddress.city ||
      !newAddress.province
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/addresses`, newAddress);
      if (response.data.success) {
        Alert.alert("Success", "Address added successfully");
        setShowAddAddressModal(false);
        fetchUserAddresses();

        // Reset form
        setNewAddress({
          address_type: "home",
          recipient_name: user?.first_name + " " + user?.last_name || "",
          phone_number: user?.phone || "",
          street_address: "",
          barangay: "",
          city: "",
          province: "",
          postal_code: "",
          landmark: "",
          is_default: false,
        });
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address");
    }
  };

  // Group items by store
  const groupedItems = items.reduce((groups, item) => {
    const sellerId = item.seller_id;
    if (!groups[sellerId]) {
      groups[sellerId] = [];
    }
    groups[sellerId].push(item);
    return groups;
  }, {});

  const calculateSubtotal = () => {
    return items.reduce(
      (sum, item) =>
        sum + Number.parseFloat(item.total_price || item.price * item.quantity),
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = appliedVoucher ? appliedVoucher.calculated_discount : 0;
    const totalDeliveryFee = Object.keys(groupedItems).length * deliveryFee; // Delivery fee per store
    return subtotal + totalDeliveryFee - discount;
  };

  const getTotalDeliveryFee = () => {
    return Object.keys(groupedItems).length * deliveryFee;
  };

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      Alert.alert("Error", "Please enter a voucher code");
      return;
    }

    setVoucherLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/orders/validate-voucher`,
        {
          code: voucherCode.trim(),
          subtotal: calculateSubtotal(),
        }
      );

      if (response.data.success) {
        setAppliedVoucher(response.data.data.voucher);
        Alert.alert("Success", "Voucher applied successfully!");
      }
    } catch (error) {
      console.error("Error validating voucher:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid voucher code";
      Alert.alert("Error", errorMessage);
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("No Address Selected", "Please select a delivery address");
      setShowAddressModal(true);
      return;
    }

    if (items.length === 0) {
      Alert.alert("Error", "No items to order");
      return;
    }

    const storeCount = Object.keys(groupedItems).length;
    const totalAmount = calculateTotal();

    Alert.alert(
      "Confirm Order",
      `Place ${storeCount} order${storeCount > 1 ? "s" : ""} for ₱${totalAmount.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: processOrder },
      ]
    );
  };

  const processOrder = async () => {
    setProcessingOrder(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product_id || item.id,
        quantity: item.quantity,
        preparationOptions: item.preparation_options || null,
      }));

      const response = await axios.post(`${API_URL}/api/orders/create`, {
        items: orderItems,
        deliveryAddressId: selectedAddress.id,
        deliveryNotes,
        voucherCode: appliedVoucher?.code || null,
        paymentMethod: "cash_on_delivery",
        clearCart: fromCart,
      });

      if (response.data.success) {
        navigation.replace("OrderConfirmation", {
          orders: response.data.data.orders,
          totalAmount: response.data.data.totalAmount,
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to place order";
      Alert.alert("Error", errorMessage);
    } finally {
      setProcessingOrder(false);
    }
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

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Checkout</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <Text className="mt-4 text-gray-600">Loading checkout...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Checkout</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Delivery Address */}
        <View className="p-4 mb-4 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Delivery Address
            </Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text className="font-medium text-orange-600">
                {selectedAddress ? "Change" : "Select"}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View>
              <View className="flex-row items-center mb-2">
                <Text className="text-base font-medium text-gray-900">
                  {selectedAddress.recipient_name}
                </Text>

                {selectedAddress.is_default === 1 && (
                  <View className="px-2 py-1 ml-2 bg-orange-100 rounded-full">
                    <Text className="text-xs font-medium text-orange-600">
                      Default
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-600">
                {selectedAddress.phone_number}
              </Text>
              <Text className="mt-1 text-gray-700">
                {selectedAddress.street_address}, {selectedAddress.barangay}
              </Text>
              <Text className="text-gray-700">
                {selectedAddress.city}, {selectedAddress.province}{" "}
                {selectedAddress.postal_code}
              </Text>
              {selectedAddress.landmark && (
                <Text className="text-sm text-gray-500">
                  Landmark: {selectedAddress.landmark}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              className="p-4 border-2 border-gray-300 border-dashed rounded-lg"
              onPress={() => setShowAddressModal(true)}
            >
              <Text className="text-center text-gray-500">
                Tap to select delivery address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items Grouped by Store */}
        {Object.entries(groupedItems).map(([sellerId, storeItems]) => {
          const firstItem = storeItems[0];
          return (
            <View key={sellerId} className="p-4 mb-4 bg-white">
              {/* Store Header */}
              <View className="flex-row items-center pb-3 mb-3 border-b border-gray-200">
                {firstItem.store_logo_key ? (
                  <Image
                    source={{ uri: firstItem.store_logo_key }}
                    className="w-8 h-8 mr-3 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex items-center justify-center w-8 h-8 mr-3 bg-gray-200 rounded-full">
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={16}
                      color="#6B7280"
                    />
                  </View>
                )}
                <Text className="text-lg font-semibold text-gray-900">
                  {firstItem.store_name}
                </Text>
              </View>

              {/* Store Items */}
              {storeItems.map((item, index) => (
                <View
                  key={index}
                  className="flex-row pb-4 mb-4 border-b border-gray-200 last:border-b-0 last:mb-0"
                >
                  <View className="mr-4">
                    {item.image_keys ? (
                      <Image
                        source={{ uri: item.image_keys }}
                        className="w-16 h-16 rounded-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                        <Feather name="image" size={20} color="#9CA3AF" />
                      </View>
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {formatUnitType(item.unit_type)}
                    </Text>

                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </Text>
                      <Text className="font-medium text-orange-600">
                        ₱
                        {Number.parseFloat(
                          item.total_price || item.price * item.quantity
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Voucher Section */}
        <View className="p-4 mb-4 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Voucher
          </Text>

          {appliedVoucher ? (
            <View className="p-3 border border-green-200 rounded-lg bg-green-50">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-medium text-green-800">
                    {appliedVoucher.title}
                  </Text>
                  <Text className="text-sm text-green-600">
                    {appliedVoucher.description}
                  </Text>
                  <Text className="text-sm font-medium text-green-800">
                    Discount: -₱{appliedVoucher.calculated_discount.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity onPress={removeVoucher}>
                  <Feather name="x" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-row">
              <TextInput
                className="flex-1 p-3 mr-2 border border-gray-300 rounded-lg"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                className="px-4 py-3 bg-orange-600 rounded-lg"
                onPress={validateVoucher}
                disabled={voucherLoading}
              >
                {voucherLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="font-medium text-white">Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Delivery Notes */}
        <View className="p-4 mb-4 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Delivery Notes (Optional)
          </Text>
          <TextInput
            className="p-3 border border-gray-300 rounded-lg"
            placeholder="Add special instructions for delivery..."
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View className="p-4 mb-4 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Payment Method
          </Text>
          <View className="flex-row items-center p-3 rounded-lg bg-gray-50">
            <MaterialCommunityIcons name="cash" size={24} color="#059669" />
            <Text className="ml-3 font-medium text-gray-900">
              Cash on Delivery
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View className="p-4 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Summary
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">
                ₱{calculateSubtotal().toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">
                Delivery Fee ({Object.keys(groupedItems).length} store
                {Object.keys(groupedItems).length > 1 ? "s" : ""})
              </Text>
              <Text className="text-gray-900">
                ₱{getTotalDeliveryFee().toFixed(2)}
              </Text>
            </View>

            {appliedVoucher && (
              <View className="flex-row justify-between">
                <Text className="text-green-600">Voucher Discount</Text>
                <Text className="text-green-600">
                  -₱{appliedVoucher.calculated_discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View className="pt-2 border-t border-gray-200">
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold text-gray-900">
                  Total
                </Text>
                <Text className="text-lg font-semibold text-orange-600">
                  ₱{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="items-center p-4 bg-orange-600 rounded-lg"
          onPress={handlePlaceOrder}
          disabled={processingOrder}
        >
          {processingOrder ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">
              Place Order - ₱{calculateTotal().toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Selection Modal */}
      <Modal
        transparent
        visible={showAddressModal}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl max-h-96">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Select Address</Text>
                <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    className={`p-4 mb-3 border rounded-lg ${
                      selectedAddress?.id === address.id
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200"
                    }`}
                    onPress={() => {
                      setSelectedAddress(address);
                      setShowAddressModal(false);
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-medium text-gray-900">
                        {address.recipient_name}
                      </Text>

                      {address.is_default === 1 && (
                        <View className="px-2 py-1 bg-orange-100 rounded-full">
                          <Text className="text-xs font-medium text-orange-600">
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-gray-600">
                      {address.phone_number}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      {address.street_address}, {address.barangay},{" "}
                      {address.city}
                    </Text>
                  </TouchableOpacity>
                ))}

                {addresses.length > 0 ? (
                  <TouchableOpacity
                    className="p-4 mt-2 bg-white border border-gray-300 rounded-lg"
                    onPress={() => {
                      setShowAddressModal(false);
                      navigation.navigate("AddressManagement");
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Feather name="settings" size={20} color="#6B7280" />
                      <Text className="ml-2 font-medium text-gray-600">
                        Manage Addresses
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="p-4 mt-2 border-2 border-gray-300 border-dashed rounded-lg"
                    onPress={() => {
                      setShowAddressModal(false);
                      setShowAddAddressModal(true);
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Feather name="plus" size={20} color="#6B7280" />
                      <Text className="ml-2 font-medium text-gray-600">
                        Add New Address
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        transparent
        visible={showAddAddressModal}
        animationType="slide"
        onRequestClose={() => setShowAddAddressModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View
              className="p-6 bg-white rounded-t-3xl"
              style={{ maxHeight: "90%" }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Add New Address</Text>
                <TouchableOpacity onPress={() => setShowAddAddressModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="space-y-4">
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Recipient Name *
                    </Text>
                    <TextInput
                      className="p-3 border border-gray-300 rounded-lg"
                      value={newAddress.recipient_name}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          recipient_name: text,
                        }))
                      }
                      placeholder="Full name"
                    />
                  </View>

                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Phone Number *
                    </Text>
                    <TextInput
                      className="p-3 border border-gray-300 rounded-lg"
                      value={newAddress.phone_number}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          phone_number: text,
                        }))
                      }
                      placeholder="+63 XXX XXX XXXX"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Street Address *
                    </Text>
                    <TextInput
                      className="p-3 border border-gray-300 rounded-lg"
                      value={newAddress.street_address}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          street_address: text,
                        }))
                      }
                      placeholder="House number, street name"
                    />
                  </View>

                  <View className="flex-row space-x-2">
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-gray-700">
                        Barangay *
                      </Text>
                      <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        value={newAddress.barangay}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            barangay: text,
                          }))
                        }
                        placeholder="Barangay"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-gray-700">
                        City *
                      </Text>
                      <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        value={newAddress.city}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            city: text,
                          }))
                        }
                        placeholder="City"
                      />
                    </View>
                  </View>

                  <View className="flex-row space-x-2">
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-gray-700">
                        Province *
                      </Text>
                      <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        value={newAddress.province}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            province: text,
                          }))
                        }
                        placeholder="Province"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-gray-700">
                        Postal Code
                      </Text>
                      <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        value={newAddress.postal_code}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            postal_code: text,
                          }))
                        }
                        placeholder="4500"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Landmark
                    </Text>
                    <TextInput
                      className="p-3 border border-gray-300 rounded-lg"
                      value={newAddress.landmark}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          landmark: text,
                        }))
                      }
                      placeholder="Near church, mall, etc."
                    />
                  </View>

                  <View className="flex-row items-center">
                    <TouchableOpacity
                      className={`w-5 h-5 border-2 rounded mr-3 ${
                        newAddress.is_default
                          ? "bg-orange-600 border-orange-600"
                          : "border-gray-300"
                      }`}
                      onPress={() =>
                        setNewAddress((prev) => ({
                          ...prev,
                          is_default: !prev.is_default,
                        }))
                      }
                    >
                      {newAddress.is_default && (
                        <Feather name="check" size={12} color="white" />
                      )}
                    </TouchableOpacity>
                    <Text className="text-sm text-gray-700">
                      Set as default address
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                className="items-center p-4 mt-4 bg-orange-600 rounded-lg"
                onPress={addNewAddress}
              >
                <Text className="text-lg font-semibold text-white">
                  Save Address
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CheckoutScreen;
