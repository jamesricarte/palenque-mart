import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const AccountScreen = () => {
  return (
    <>
      <View className="flex gap-5 px-6 pt-16 pb-5 border-b border-gray-300">
        <View className="flex flex-row justify-end gap-5">
          <TouchableOpacity>
            <Feather name="settings" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="shopping-cart" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications" size={22} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <View className="flex flex-row gap-2 p-3 border border-gray-300 rounded-lg">
            <MaterialIcons name="account-circle" size={40} color="black" />
            <View>
              <Text className="text-lg">James Mickel C. Ricarte</Text>
              <Text className="text-sm">uhenyou@gmail.com</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View className="p-5">
          <Text className="mb-4 text-xl font-semibold">Your Orders</Text>
          <View className="flex flex-row justify-around">
            <TouchableOpacity>
              <View className="border border-gray-400 rounded-md w-14 h-14"></View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View className="border border-gray-400 rounded-md w-14 h-14"></View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View className="border border-gray-400 rounded-md w-14 h-14"></View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View className="border border-gray-400 rounded-md w-14 h-14"></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity>
        <View className="flex flex-row items-center gap-4 p-6 border-b border-gray-300">
          <FontAwesome6 name="store" size={22} color="black" />
          <Text className="text-xl">Partnership Options</Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default AccountScreen;
