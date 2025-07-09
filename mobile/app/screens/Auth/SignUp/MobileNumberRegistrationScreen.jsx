import { useEffect, useState } from "react";

import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import axios from "axios";
import { Modal, Snackbar } from "react-native-paper";
import LottieView from "lottie-react-native";

import { API_URL } from "../../../config/apiConfig";

const MobileNumberRegistrationScreen = ({ navigation }) => {
  const route = useRoute();

  const [mobileNumber, setMobileNumber] = useState(null);

  const [isFieldValid, setIsFieldValid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [message, setMessage] = useState(null);

  const verifyMobileNumber = async () => {
    if (!isFieldValid) {
      setMessage({
        message: "Invalid mobile number",
      });
      setSnackBarVisible(true);
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    let formData = {
      mobileNumber: mobileNumber,
    };

    if (route.params?.email) {
      formData.email = route.params.email;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/sign-up-mobile`,
        formData
      );

      console.log(response.data);
      responseData = response.data;
    } catch (error) {
      console.log(error.response.data);
      responseData = error.response.data;
    } finally {
      const elapseTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          if (responseData.success) {
            let params = { mobileNumber: responseData.data.mobileNumber };

            if (responseData?.data?.email) {
              params.email = responseData.data.email;
            }

            navigation.navigate("MobileNumberVerification", params);
          } else {
            setMessage(responseData);
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  useEffect(() => {
    let isValid = true;
    const mobileFormat = /^(09|\+639)\d{9}$/;

    if (mobileFormat.test(mobileNumber)) isValid = true;
    else isValid = false;

    setIsFieldValid(isValid);
    setMessage(null);
  }, [mobileNumber]);

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
          Verify your mobile number?
        </Text>

        <Text className="mb-5">
          We need this to verify and secure your account
        </Text>

        <TextInput
          key="mobile"
          className={`w-full p-3 text-lg border  rounded-md ${
            message && !message?.success ? "border-red-500" : "border-black"
          }`}
          placeholder="Enter your mobile number"
          keyboardType="phone-pad"
          includeFontPadding={false}
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />

        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message?.message}</Text>
        )}

        <TouchableOpacity
          className={`flex items-center justify-center w-full px-4 py-3 mt-4 rounded-md ${
            !isFieldValid ? "bg-gray-300 opacity-60" : "bg-orange-600"
          }`}
          onPress={verifyMobileNumber}
          disabled={!isFieldValid}
        >
          <Text className="text-xl text-white">Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity className="px-4 py-3 mt-4 bg-orange-500 rounded-md">
          <Text className="text-center text-white">Skip</Text>
        </TouchableOpacity>
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

export default MobileNumberRegistrationScreen;
