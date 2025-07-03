import { View, Text, TouchableOpacity, TextInput } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { Modal, Snackbar } from "react-native-paper";
import LottieView from "lottie-react-native";

import { API_URL } from "../../../config/apiConfig";

const MobileNumberVerification = ({ navigation }) => {
  const route = useRoute();

  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState(null);

  const verificationInputRef = useRef(null);

  const verifyCode = async () => {
    if (verificationCode.length < 6) {
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/verify-phone`, {
        email: route.params?.email,
        firstName: route.params?.firstName,
        lastName: route.params?.lastName,
        mobileNumber: route.params?.mobileNumber,
        password: route.params?.password,
        otp: verificationCode,
      });

      console.log(response.data);
      responseData = response.data;
    } catch (error) {
      console.error(error);
      responseData = error.response.data;
    } finally {
      const elapseTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          if (responseData?.success) {
            navigation.navigate("Dashboard");
          } else {
            console.log(responseData);
            setMessage(responseData);
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  useEffect(() => {
    if (verificationCode.length === 6) {
      verifyCode();
    }
  }, [verificationCode]);

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
          Enter 6-digit code sent to yout mobile number{" "}
          <Text className="font-bold">{route.params?.mobileNumber}</Text>
        </Text>

        {/* <View className="flex flex-row gap-4">
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
        </View> */}

        <TextInput
          key="mobile"
          ref={verificationInputRef}
          className={`w-full p-3 text-lg border  rounded-md ${
            message && !message?.success ? "border-red-500" : "border-black"
          }`}
          keyboardType="number-pad"
          includeFontPadding={false}
          value={verificationCode}
          onChangeText={setVerificationCode}
          maxLength={6}
        />

        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message?.message}</Text>
        )}

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

      <Snackbar
        visible={snackBarVisible}
        onDismiss={() => setSnackBarVisible(false)}
        duration={3000}
      >
        {message?.message}
      </Snackbar>
    </View>
  );
};

export default MobileNumberVerification;
