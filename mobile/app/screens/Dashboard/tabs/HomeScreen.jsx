import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";

const HomeScreen = ({ navigation }) => {
  return (
    <>
      {/* Top Nav */}
      <View className="flex gap-3 px-4 pt-16 pb-5 border-b border-gray-300">
        <Text className="text-2xl font-semibold">Palenque Mart</Text>
        <View className="flex flex-row items-center justify-between">
          <View>
            <TextInput
              className="p-3 border-2 border-gray-800 rounded-lg w-60"
              placeholder="Search item"
            ></TextInput>
          </View>
          <View className="flex flex-row gap-4">
            <TouchableOpacity>
              <Feather name="shopping-cart" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="notifications" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex flex-row justify-center gap-8 p-6 mt-auto border-t border-gray-300">
        <TouchableOpacity
          className="px-3 py-2 border border-black rounded-xl"
          onPress={() => navigation.push("Login")}
        >
          <Text className="text-xl">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="px-3 py-2 bg-black rounded-xl"
          onPress={() => navigation.push("Register")}
        >
          <Text className="text-xl text-white">Sign up</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default HomeScreen;
