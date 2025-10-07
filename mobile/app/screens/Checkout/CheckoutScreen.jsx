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
import { useState, useCallback, useEffect } from "react";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
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
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState({});
  const [calculatingFees, setCalculatingFees] = useState(false);
  const [feesCalculated, setFeesCalculated] = useState(false);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  useEffect(() => {
    if (selectedAddress && items.length > 0) {
      calculateDeliveryFeesForAddress(selectedAddress.id);
    }
  }, [selectedAddress, items]);

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

  const calculateDeliveryFeesForAddress = async (addressId) => {
    if (!items || items.length === 0) return;

    setCalculatingFees(true);

    try {
      // Get unique seller IDs from items
      const sellerIds = [...new Set(items.map((item) => item.seller_id))];

      const response = await axios.post(
        `${API_URL}/api/orders/calculate-delivery-fees`,
        {
          deliveryAddressId: addressId,
          sellerIds: sellerIds,
        }
      );

      if (response.data.success) {
        const calculatedFees = {};
        Object.values(response.data.data.deliveryFees).forEach((feeData) => {
          calculatedFees[feeData.sellerId] = feeData.deliveryFee;
        });
        setDeliveryFees(calculatedFees);
        setFeesCalculated(true);
      }
    } catch (error) {
      console.error("Error calculating delivery fees:", error);
      // Fallback to default fee of 50 for each seller
      const defaultFees = {};
      const sellerIds = [...new Set(items.map((item) => item.seller_id))];
      sellerIds.forEach((sellerId) => {
        defaultFees[sellerId] = 50.0;
      });
      setDeliveryFees(defaultFees);
      setFeesCalculated(true);
    } finally {
      setCalculatingFees(false);
    }
  };

  const handleAddressChange = async (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
    // Recalculate delivery fees for new address
    await calculateDeliveryFeesForAddress(address.id);
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
    const totalDeliveryFee = getTotalDeliveryFee();
    return subtotal + totalDeliveryFee - discount;
  };

  const getTotalDeliveryFee = () => {
    return Object.keys(groupedItems).reduce((total, sellerId) => {
      return total + (deliveryFees[sellerId] || 50.0);
    }, 0);
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
        bargain_data: item.bargain_data ? item.bargain_data : null,
        is_preorder: item.is_preorder || false,
      }));

      const response = await axios.post(`${API_URL}/api/orders/create`, {
        items: orderItems,
        deliveryAddressId: selectedAddress.id,
        deliveryNotes,
        voucherCode: appliedVoucher?.code || null,
        paymentMethod: "cash_on_delivery",
        clearCart: fromCart,
        deliveryFees: deliveryFees,
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

  const hasPreOrderItems = () => {
    return items.some((item) => item.is_preorder);
  };

  if (loading || !feesCalculated) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-3 bg-white border-b border-gray-300 pt-14">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Checkout</Text>
          <View className="px-2 py-1 bg-white rounded-full"></View>
        </View>

        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="mt-4 text-gray-600">
            {loading ? "Loading checkout..." : "Calculating delivery fees..."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-3 bg-white border-b border-gray-300 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Checkout</Text>
        <View className="px-2 py-1 bg-white rounded-full"></View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Delivery Address */}
        <View className="p-4 mb-2 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Delivery Address
            </Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text className="font-medium text-primary">
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
                    <Text className="text-xs font-medium text-primary">
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
          const storeDeliveryFee = deliveryFees[sellerId] || 50.0;
          return (
            <View key={sellerId} className="p-4 mb-2 bg-white">
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
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {firstItem.store_name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Delivery Fee: ₱{storeDeliveryFee.toFixed(2)}
                  </Text>
                </View>
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
                    <View className="flex-row items-center">
                      <Text className="flex-1 text-base font-medium text-gray-900">
                        {item.name}
                      </Text>
                      {item.is_preorder && (
                        <View className="px-2 py-1 ml-2 bg-blue-100 rounded-full">
                          <Text className="text-xs font-medium text-blue-600">
                            Pre-Order
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-gray-500">
                      {formatUnitType(item.unit_type)}
                    </Text>
                    {item.is_preorder && item.expected_availability_date && (
                      <Text className="text-xs text-blue-600">
                        Expected:{" "}
                        {new Date(
                          item.expected_availability_date
                        ).toLocaleDateString()}
                      </Text>
                    )}

                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </Text>
                      {item.bargain_data ? (
                        <View className="flex-col items-end">
                          <Text className="font-medium text-green-600">
                            ₱{Number.parseFloat(item.total_price).toFixed(2)}
                          </Text>
                          <Text className="text-xs text-gray-500 line-through">
                            ₱
                            {(
                              Number.parseFloat(item.price) * item.quantity
                            ).toFixed(2)}
                          </Text>
                        </View>
                      ) : (
                        <Text className="font-medium text-primary">
                          ₱
                          {Number.parseFloat(
                            item.total_price || item.price * item.quantity
                          ).toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Voucher Section */}
        <View className="p-4 mb-2 bg-white">
          <Text className="mb-2 text-lg font-semibold text-gray-900">
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
                className="flex-1 p-3 mr-2 border text-lg border-gray-300 rounded-lg"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                className="px-4 py-3 bg-primary rounded-lg"
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
        <View className="p-4 mb-2 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Delivery Notes (Optional)
          </Text>
          <TextInput
            className="p-3 text-lg border border-gray-300 rounded-lg"
            placeholder="Add special instructions for delivery..."
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View className="p-4 mb-2 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Payment Method
          </Text>
          {hasPreOrderItems() && (
            <View className="p-3 mb-3 rounded-lg bg-blue-50">
              <View className="flex-row items-center mb-1">
                <Feather name="info" size={16} color="#2563EB" />
                <Text className="ml-2 font-medium text-blue-800">
                  Pre-Order Payment
                </Text>
              </View>
              <Text className="text-sm text-blue-700">
                Payment will be processed when pre-ordered items become
                available
              </Text>
            </View>
          )}
          <View className="flex-row items-center p-3 rounded-lg bg-gray-50">
            <MaterialCommunityIcons name="cash" size={24} color="#059669" />
            <Text className="ml-3 font-medium text-gray-900">
              Cash on Delivery
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View className="p-4 bg-white">
          <Text className="mb-1 text-lg font-semibold text-gray-900">
            Order Summary
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">
                ₱{calculateSubtotal().toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-1">
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
                <Text className="text-lg font-semibold text-primary">
                  ₱{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-primary">
        <TouchableOpacity
          className="items-center p-4 bg-white rounded-lg"
          onPress={handlePlaceOrder}
          disabled={processingOrder}
        >
          {processingOrder ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-semibold text-primary">
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
                        ? "border-primary bg-orange-50"
                        : "border-gray-200"
                    }`}
                    onPress={() => handleAddressChange(address)}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-medium text-gray-900">
                        {address.recipient_name}
                      </Text>

                      {address.is_default === 1 && (
                        <View className="px-2 py-1 bg-orange-100 rounded-full">
                          <Text className="text-xs font-medium text-primary">
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
                      navigation.navigate("AddNewAddress");
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

      <Modal transparent visible={calculatingFees} animationType="fade">
        <View
          className="items-center justify-center flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="items-center p-6 bg-white rounded-lg">
            <ActivityIndicator size="large" color="#EA580C" />
            <Text className="mt-4 text-base font-medium text-gray-900">
              Calculating delivery fees...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CheckoutScreen;
