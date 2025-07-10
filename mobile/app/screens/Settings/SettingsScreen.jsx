import { View, Text, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

const SettingsScreen = ({ navigation }) => {
  return (
    <>
      <View className="p-3 border-b border-gray-300 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View className="items-center justify-center flex-1">
        <Text>SettingsScreen</Text>
      </View>
    </>
  );
};

export default SettingsScreen;
