import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const LoginScreen = ({ navigation }) => {
  return (
    <>
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

        <View className="flex gap-5">
          <TextInput
            className="w-full p-3 text-lg border border-black rounded-md"
            placeholder="Phone/Email/Username"
            keyboardType="email-address"
            includeFontPadding={false}
          />

          <TextInput
            className="w-full p-3 text-lg border border-black rounded-md"
            placeholder="Password"
            keyboardType="email-address"
            includeFontPadding={false}
          />
        </View>

        <TouchableOpacity>
          <Text className="w-full mt-4 text-right text-gray-600">
            Forgot password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex items-center justify-center w-full px-4 py-3 mt-4 bg-orange-600 rounded-md">
          <Text className="text-xl text-white">Log in</Text>
        </TouchableOpacity>

        <View className="flex-row items-center w-full mt-5 mb-8">
          <View className="flex-1 h-0.5 bg-gray-300" />
          <Text className="mx-4 text-dark-grey">Or login with</Text>
          <View className="flex-1 h-0.5 bg-gray-300" />
        </View>

        <View className="flex w-full gap-4">
          <TouchableOpacity
            className="py-3 border border-gray-400 rounded-lg"
            onPress={() => {}}
          >
            <Text className="text-base text-center text-black">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 border border-gray-400 rounded-lg"
            onPress={() => {}}
          >
            <Text className="text-base text-center text-black">
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex items-center gap-4 mt-auto">
          <View className="flex flex-row gap-2">
            <Text className="text-gray-600">Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.replace("SignUp")}>
              <Text className="text-orange-500">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default LoginScreen;
