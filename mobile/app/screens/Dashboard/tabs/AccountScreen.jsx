import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";

const AccountScreen = () => {
  return (
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

      <View className="flex flex-row gap-2">
        <MaterialIcons name="account-circle" size={40} color="black" />
        <View>
          <Text className="text-lg">James Mickel C. Ricarte</Text>
          <Text className="text-sm">uhenyou@gmail.com</Text>
        </View>
      </View>
    </View>
  );
};

export default AccountScreen;
