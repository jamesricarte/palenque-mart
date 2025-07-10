import { View, Text, TouchableOpacity, TextInput } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { Modal, Snackbar } from "react-native-paper";
import LottieView from "lottie-react-native";

import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const MobileNumberVerificationScreen = ({ navigation }) => {
  const route = useRoute();
  const customNavigation = useNavigation();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [message, setMessage] = useState(null);

  const [verificationCode, setVerificationCode] = useState(null);

  const numDigits = 6;
  const [otp, setOTP] = useState(Array(numDigits).fill(""));

  const inputs = Array(numDigits)
    .fill()
    .map(() => useRef(null));

  const handleChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newOTP = [...otp];
      newOTP[index] = text;
      setOTP(newOTP);

      if (text && index < numDigits - 1) {
        inputs[index + 1].current.focus();
      }

      setVerificationCode(newOTP.join(""));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && index > 0) {
      inputs[index - 1].current.focus();
    } else if (/^\d+$/.test(e.nativeEvent.key) && index < numDigits - 1) {
      inputs[index + 1].current.focus();
      const newOTP = [...otp];
      newOTP[index + 1] = e.nativeEvent.key;
      setOTP(newOTP);

      setVerificationCode(newOTP.join(""));
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length < 6) {
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    let formData = {
      otp: verificationCode,
      mobileNumber: route.params?.mobileNumber,
    };

    if (route.params?.email) {
      formData.email = route.params.email;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/verify-phone`,
        formData
      );

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
            if (responseData.exists) {
              login(responseData.token);
              customNavigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Dashboard",
                      params: {
                        screen: "Account",
                      },
                    },
                  ],
                })
              );
            } else {
              navigation.navigate("AccountDetailsCreation", {
                mobileNumber: responseData.data.mobileNumber,
              });
            }
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
    if (verificationCode?.length === 6) {
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
          Enter 6-digit code sent to your mobile number{" "}
          <Text className="font-bold">{route.params?.mobileNumber}</Text>
        </Text>

        <View className="flex flex-row gap-4">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputs[index]}
              className="w-10 text-lg text-center border-b border-black"
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              maxLength={1}
            />
          ))}
        </View>

        {/* <TextInput
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
        /> */}

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

export default MobileNumberVerificationScreen;
