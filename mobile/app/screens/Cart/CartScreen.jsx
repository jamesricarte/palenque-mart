import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const CartScreen = ({ navigation }) => {
  return (
    <View className="items-center justify-center h-screen mt-14">
      <View className="absolute top-0 w-full p-3">
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <Text>CartScreen</Text>
    </View>
  );
};

export default CartScreen;
