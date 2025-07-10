import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const CartScreen = ({ navigation }) => {
  return (
    <>
      <View className="p-3 border-b border-gray-300 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View className="items-center justify-center flex-1">
        <Text>CartScreen</Text>
      </View>
    </>
  );
};

export default CartScreen;
