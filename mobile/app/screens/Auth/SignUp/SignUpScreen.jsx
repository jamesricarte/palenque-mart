import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";

import Ionicons from "@expo/vector-icons/Ionicons";
import LottieView from "lottie-react-native";

import { API_URL } from "@env";

const SignUpScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [signUpOption, setSignUpOption] = useState("email");

  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState(null);

  const [isFieldValid, setIsFieldValid] = useState(false);

  const [message, setMessage] = useState(null);

  const signUp = async () => {
    if (!isFieldValid) return;

    Keyboard.dismiss();
    setLoading(true);

    const formData =
      signUpOption === "email"
        ? { email: email }
        : { mobileNumber: mobileNumber };

    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/sign-up`, formData);

      console.log(response.data);
      responseData = response.data;
    } catch (error) {
      console.log(error.response.data);
      responseData = response.data;
    } finally {
      const elapseTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          if (responseData?.success && signUpOption === "email")
            navigation.navigate("EmailSentVerification", {
              email: responseData.data.email,
            });
          setMessage(responseData);
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  useEffect(() => {
    let isValid = true;
    const strictEmailFormat =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileFormat = /^(09|\+639)\d{9}$/;

    if (signUpOption === "email") {
      if (strictEmailFormat.test(email)) isValid = true;
      else isValid = false;
    } else if (signUpOption === "mobileNumber") {
      if (mobileFormat.test(mobileNumber)) isValid = true;
      else isValid = false;
    }

    setIsFieldValid(isValid);
    setMessage(null);
  }, [email, mobileNumber, signUpOption]);

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

        {signUpOption === "email" ? (
          <TextInput
            key="email"
            className={`w-full p-3 text-lg border  rounded-md ${
              message && !message?.success ? "border-red-500" : "border-black"
            }`}
            placeholder="Sign up with Email"
            keyboardType="email-address"
            includeFontPadding={false}
            value={email}
            onChangeText={setEmail}
          />
        ) : (
          <TextInput
            key="mobile"
            className={`w-full p-3 text-lg border  rounded-md ${
              message && !message?.success ? "border-red-500" : "border-black"
            }`}
            placeholder="Sign up with Mobile Number"
            keyboardType="phone-pad"
            includeFontPadding={false}
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        )}

        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message?.message}</Text>
        )}

        <Pressable
          onPress={() =>
            signUpOption === "email"
              ? setSignUpOption("mobileNumber")
              : setSignUpOption("email")
          }
        >
          <Text className="w-full mt-4 text-gray-600">
            {signUpOption === "email" ? "Use mobile number?" : "Use email?"}
          </Text>
        </Pressable>

        <TouchableOpacity
          className={`flex items-center justify-center w-full px-4 py-3 mt-4 rounded-md ${
            !isFieldValid ? "bg-gray-300 opacity-60" : "bg-orange-600"
          }`}
          onPress={signUp}
          disabled={!isFieldValid}
        >
          <Text className="text-xl text-white">Sign up</Text>
        </TouchableOpacity>

        <View className="flex-row items-center w-full mt-5 mb-8">
          <View className="flex-1 h-0.5 bg-gray-300" />
          <Text className="mx-4 text-dark-grey">Or sign up with</Text>
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
          <Text className="text-sm text-center text-gray-600">
            By signing up, you agree to Palenque Mart Terms of Service & Privacy
            Policy
          </Text>
          <View className="flex flex-row gap-2">
            <Text className="text-gray-600">Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text className="text-orange-500">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal transparent visible={loading}>
        <View className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl left-1/2 top-1/2">
          <LottieView
            source={require("../../../assets/animations/loading/loading-animation-2-2differentcolors.json")}
            autoPlay
            loop
            style={{ width: 70, height: 30 }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default SignUpScreen;
