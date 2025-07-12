import { View, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

const TemplateScreen = ({ navigation }) => {
  return (
    <View className="flex-1">
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TemplateScreen;
