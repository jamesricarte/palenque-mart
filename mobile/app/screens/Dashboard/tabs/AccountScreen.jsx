import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import AntDesign from "@expo/vector-icons/AntDesign"
import { useNavigation } from "@react-navigation/native"

const AccountScreen = () => {
  const navigation = useNavigation()

  const orderCategories = [
    { icon: "package", label: "To Pay", count: 2 },
    { icon: "truck", label: "To Ship", count: 1 },
    { icon: "box", label: "To Receive", count: 0 },
    { icon: "star", label: "To Rate", count: 3 },
  ]

  const menuItems = [
    { icon: "heart", label: "My Wishlist", screen: null },
    { icon: "clock", label: "Recently Viewed", screen: null },
    { icon: "message-circle", label: "My Reviews", screen: null },
    { icon: "help-circle", label: "Help Center", screen: null },
    { icon: "shield", label: "Privacy Policy", screen: null },
    { icon: "info", label: "About Us", screen: null },
  ]

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex gap-5 px-6 pt-16 pb-5 bg-white border-b border-gray-300">
        <View className="flex flex-row justify-end gap-5">
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Feather name="settings" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="shopping-cart" size={22} color="black" />
          </TouchableOpacity>
            <TouchableOpacity>
            <Ionicons name="notifications" size={22} color="black" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
          <View className="flex flex-row items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <MaterialIcons name="account-circle" size={50} color="black" />
            <View className="flex-1">
              <Text className="text-lg font-semibold">James Mickel C. Ricarte</Text>
              <Text className="text-sm text-gray-600">uhenyou@gmail.com</Text>
              <Text className="text-xs text-gray-500 mt-1">Tap to edit profile</Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Orders Section */}
      <View className="p-6 mt-4 bg-white border-b border-gray-200">
        <View className="flex flex-row items-center justify-between mb-4">
          <Text className="text-xl font-semibold">My Orders</Text>
          <TouchableOpacity>
            <Text className="text-black">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row justify-between">
          {orderCategories.map((category, index) => (
            <TouchableOpacity key={index} className="flex items-center flex-1">
              <View className="relative">
                <View className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-lg">
                  <Feather name={category.icon} size={20} color="black" />
                </View>
                {category.count > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                    <Text className="text-xs text-white font-bold">{category.count}</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-center mt-2 text-gray-700">{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Partnership Section */}
      <TouchableOpacity
        className="bg-white border-b border-gray-200"
        onPress={() => navigation.navigate("PartnershipOptions")}
      >
        <View className="flex flex-row items-center gap-4 p-6">
          <FontAwesome6 name="store" size={22} color="black" />
          <View className="flex-1">
            <Text className="text-lg font-semibold">Partnership Options</Text>
            <Text className="text-sm text-gray-600">Become a seller or partner</Text>
          </View>
          <Feather name="chevron-right" size={20} color="gray" />
        </View>
      </TouchableOpacity>

      {/* Menu Items */}
      <View className="mt-4 bg-white">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex flex-row items-center gap-4 p-6 ${index !== menuItems.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <Feather name={item.icon} size={20} color="black" />
            <Text className="flex-1 text-lg">{item.label}</Text>
            <Feather name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Section */}
      <View className="mt-4 mb-8 bg-white">
        <TouchableOpacity className="flex flex-row items-center gap-4 p-6">
          <AntDesign name="logout" size={20} color="#ef4444" />
          <Text className="flex-1 text-lg text-red-500">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default AccountScreen
