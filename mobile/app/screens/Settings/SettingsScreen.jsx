import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useAuth } from "../../context/AuthContext";

const SettingsScreen = ({ navigation }) => {
  const { user } = useAuth();

  const settingsOptions = [
    {
      id: "addresses",
      title: "My Addresses",
      subtitle: "Manage your delivery addresses",
      icon: "location-on",
      onPress: () => navigation.navigate("AddressManagement"),
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      subtitle: "Manage your privacy settings",
      icon: "security",
      onPress: () => console.log("Privacy pressed"),
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: "help",
      onPress: () => console.log("Help pressed"),
    },
    {
      id: "about",
      title: "About",
      subtitle: "App version and information",
      icon: "info",
      onPress: () => console.log("About pressed"),
    },
  ];

  if (!user) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center p-4 pt-16 bg-white border-b border-gray-300">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Settings</Text>
        </View>

        {/* Login Required */}
        <View className="items-center justify-center flex-1 px-6">
          <Feather name="user" size={80} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Login Required
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Please login to access settings
          </Text>
          <TouchableOpacity
            className="px-6 py-3 mt-6 bg-orange-600 rounded-lg"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="font-semibold text-white">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-16 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="mr-4 text-xl font-semibold">Settings</Text>
        <View></View>
      </View>

      <View className="flex-1">
        <View className="mx-4 mt-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center p-4 ${
                index !== settingsOptions.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
              onPress={option.onPress}
            >
              <View className="flex items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
                <MaterialIcons name={option.icon} size={20} color="#374151" />
              </View>

              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {option.title}
                </Text>
                <Text className="text-sm text-gray-500">{option.subtitle}</Text>
              </View>

              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default SettingsScreen;
