import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const OrderConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orders, totalAmount } = route.params;

  // Handle both single order (legacy) and multiple orders (new)
  const ordersList = Array.isArray(orders)
    ? orders
    : [
        {
          orderId: route.params.orderId,
          orderNumber: route.params.orderNumber,
        },
      ];
  const finalTotalAmount = totalAmount || route.params.totalAmount;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
            <Feather name="x" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Order Confirmation</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Success Icon */}
        <View className="items-center py-8">
          <View className="items-center justify-center w-24 h-24 bg-green-100 rounded-full">
            <Feather name="check" size={48} color="#059669" />
          </View>
          <Text className="mt-4 text-2xl font-bold text-gray-900">
            Order{ordersList.length > 1 ? "s" : ""} Placed!
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            Your order{ordersList.length > 1 ? "s have" : " has"} been
            successfully placed and {ordersList.length > 1 ? "are" : "is"} being
            processed.
          </Text>
        </View>

        {/* Order Details */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Details
          </Text>

          <View className="space-y-3">
            {ordersList.length > 1 ? (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Orders Created</Text>
                <Text className="font-medium text-gray-900">
                  {ordersList.length} orders
                </Text>
              </View>
            ) : (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Order Number</Text>
                <Text className="font-medium text-gray-900">
                  {ordersList[0].orderNumber}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Amount</Text>
              <Text className="text-lg font-semibold text-orange-600">
                ₱{finalTotalAmount.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Payment Method</Text>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="cash" size={16} color="#059669" />
                <Text className="ml-1 text-gray-900">Cash on Delivery</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Status</Text>
              <View className="px-2 py-1 bg-yellow-100 rounded-full">
                <Text className="text-xs font-medium text-yellow-800">
                  Pending
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View className="p-4 mb-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            What's Next?
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="items-center justify-center w-6 h-6 mr-3 bg-orange-100 rounded-full">
                <Text className="text-xs font-bold text-orange-600">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">
                  Order Confirmation
                </Text>
                <Text className="text-sm text-gray-600">
                  Seller{ordersList.length > 1 ? "s" : ""} will review and
                  confirm your order
                  {ordersList.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                <Text className="text-xs font-bold text-gray-400">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-500">Preparation</Text>
                <Text className="text-sm text-gray-400">
                  Your items will be prepared for delivery
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="items-center justify-center w-6 h-6 mr-3 bg-gray-100 rounded-full">
                <Text className="text-xs font-bold text-gray-400">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-500">Delivery</Text>
                <Text className="text-sm text-gray-400">
                  Your order{ordersList.length > 1 ? "s" : ""} will be delivered
                  to your address
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Estimated Delivery */}
        <View className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
          <View className="flex-row items-center mb-2">
            <Feather name="clock" size={20} color="#2563EB" />
            <Text className="ml-2 font-medium text-blue-900">
              Estimated Delivery
            </Text>
          </View>
          <Text className="text-blue-800">
            Your order{ordersList.length > 1 ? "s" : ""} will be delivered
            within 1-2 hours after confirmation.
          </Text>
        </View>

        {/* Contact Info */}
        <View className="p-4 bg-white rounded-lg">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Need Help?
          </Text>
          <Text className="mb-2 text-gray-600">
            If you have any questions about your order
            {ordersList.length > 1 ? "s" : ""}, feel free to contact us.
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Feather name="phone" size={16} color="#059669" />
            <Text className="ml-2 font-medium text-green-600">
              Call Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="items-center flex-1 p-4 border border-orange-600 rounded-lg"
            onPress={() => navigation.navigate("Orders")}
          >
            <Text className="font-semibold text-orange-600">
              View My Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center flex-1 p-4 bg-orange-600 rounded-lg"
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text className="font-semibold text-white">Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OrderConfirmationScreen;
