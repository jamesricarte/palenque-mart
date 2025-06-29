import { View, Text, TouchableOpacity, TextInput } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";

const MobileNumberVerification = ({ navigation }) => {
  const route = useRoute();

  return (
    <View className="relative">
      <View className="p-3 border-b border-gray-300 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View className="p-6 h-[87%]">
        <View className="flex items-center">
          <View className="pt-10 pb-16">
            <Text className="text-3xl font-semibold">Palenque Mart</Text>
          </View>
        </View>

        <Text className="mb-5 text-3xl font-bold">
          Verify your mobile number
        </Text>

        <Text className="mb-5">
          Enter 4-digit code sent to yout mobile number{" "}
          <Text className="font-bold">{route.params?.mobileNumber}</Text>
        </Text>

        <View className="flex flex-row gap-4">
          <TextInput
            className="w-10 text-lg text-center border-b border-black"
            keyboardType="number-pad"
            maxLength={1}
          ></TextInput>
          <TextInput
            className="w-10 text-lg text-center border-b border-black"
            keyboardType="number-pad"
            maxLength={1}
          ></TextInput>
          <TextInput
            className="w-10 text-lg text-center border-b border-black"
            keyboardType="number-pad"
            maxLength={1}
          ></TextInput>
          <TextInput
            className="w-10 text-lg text-center border-b border-black"
            keyboardType="number-pad"
            maxLength={1}
          ></TextInput>
        </View>

        <View className="flex gap-4 mt-10">
          <TouchableOpacity
            className={`flex items-center justify-center px-4 py-3 rounded-md w-1/2 ${
              true ? "bg-orange-600" : "bg-gray-300 opacity-60"
            }`}
            onPress={() => {}}
            disabled={false}
          >
            <Text className="text-xl text-white">Send code again</Text>
          </TouchableOpacity>

          <Text className="text-lg">Try again in 26 seconds</Text>
        </View>
      </View>
    </View>
  );
};

export default MobileNumberVerification;
