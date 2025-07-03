import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

const CartScreen = ({ navigation }) => {
  // Temporary cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Fresh Bananas",
      price: 45.00,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
      seller: "Farm Fresh Store"
    },
    {
      id: 2,
      name: "Organic Tomatoes",
      price: 65.00,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      seller: "Green Valley Farm"
    },
    {
      id: 3,
      name: "Rice 5kg",
      price: 280.00,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      seller: "Grain Master"
    }
  ]);

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 
            ? null 
            : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (cartItems.length === 0) {
    return (
      <>
        <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 border-b border-gray-300">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Shopping Cart</Text>
          <View className="w-6" />
        </View>
        
        <View className="flex items-center justify-center flex-1 px-6">
          <Feather name="shopping-cart" size={80} color="#d1d5db" />
          <Text className="mt-4 text-2xl font-semibold text-gray-600">Your cart is empty</Text>
          <Text className="mt-2 text-center text-gray-500">
            Add some items to your cart to get started
          </Text>
          <TouchableOpacity 
            className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-lg text-white">Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Shopping Cart ({getTotalItems()})</Text>
        <TouchableOpacity>
          <Feather name="more-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <ScrollView className="flex-1 px-4">
        {cartItems.map((item) => (
          <View key={item.id} className="flex flex-row p-4 mb-3 bg-white border border-gray-200 rounded-lg">
            <Image 
              source={{ uri: item.image }}
              className="w-20 h-20 bg-gray-200 rounded-lg"
            />
            
            <View className="flex-1 ml-4">
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-600">{item.seller}</Text>
              <Text className="mt-1 text-lg font-bold text-orange-600">₱{item.price.toFixed(2)}</Text>
              
              <View className="flex flex-row items-center justify-between mt-2">
                <View className="flex flex-row items-center">
                  <TouchableOpacity 
                    className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center"
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Feather name="minus" size={16} color="black" />
                  </TouchableOpacity>
                  
                  <Text className="mx-4 text-lg font-semibold">{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center"
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Feather name="plus" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Summary */}
      <View className="px-4 py-6 border-t border-gray-300 bg-gray-50">
        <View className="flex flex-row justify-between mb-2">
          <Text className="text-lg">Subtotal ({getTotalItems()} items)</Text>
          <Text className="text-lg font-semibold">₱{getTotalPrice().toFixed(2)}</Text>
        </View>
        
        <View className="flex flex-row justify-between mb-2">
          <Text className="text-gray-600">Delivery Fee</Text>
          <Text className="text-gray-600">₱50.00</Text>
        </View>
        
        <View className="h-px my-3 bg-gray-300" />
        
        <View className="flex flex-row justify-between mb-4">
          <Text className="text-xl font-bold">Total</Text>
          <Text className="text-xl font-bold text-orange-600">₱{(getTotalPrice() + 50).toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity className="w-full py-4 bg-orange-600 rounded-lg">
          <Text className="text-xl font-semibold text-center text-white">Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CartScreen;