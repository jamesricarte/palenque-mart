"use client";

import { useEffect, useState } from "react";

import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";
import Snackbar from "../../../components/Snackbar";

import { API_URL } from "../../../config/apiConfig";
import PhilIcon from "../../../assets/images/PhilFlag.png";

const MobileNumberRegistrationScreen = ({ navigation }) => {
  const route = useRoute();

  const [countryCode, setCountryCode] = useState("+63");
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

    if (message) setMessage(null);

    const rightMobileFormat = countryCode + mobileNumber;

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    const formData = {
      mobileNumber: rightMobileFormat,
      editing: true,
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
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          if (responseData.success) {
            const params = { mobileNumber: responseData.data.mobileNumber };

            if (responseData?.data?.email) {
              params.email = responseData.data.email;
            }

            navigation.navigate("MobileNumberVerification", params);
          } else {
            setMessage(responseData);
          }
        },
        Math.max(0, minimumTime - elapsedTime)
      );
    }
  };

  useEffect(() => {
    let isValid = false;
    const mobileFormat = /^(\+639\d{9}|09\d{9}|9\d{9})$/;

    if (mobileFormat.test(mobileNumber)) {
      isValid = true;
      setMobileNumber(mobileNumber.replace(/^(0|\+63)/, ""));
    }

    setIsFieldValid(isValid);
  }, [mobileNumber]);

  return (
    <View className="relative flex-1 px-6 py-16 bg-white">
      <View className="mb-10">
        <TouchableOpacity
          className="self-start p-2 rounded-full bg-grey"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>

      <View className="mb-10">
        <Text className="text-3xl font-semibold text-black">
          Enter your mobile number
        </Text>
        <Text className="text-lg font-normal text-primary">
          We'll send you a verification code to confirm your number.
        </Text>
      </View>

      <View className="mb-6">
        <View className="flex-row gap-2">
          <View
            className={`flex-row items-center gap-1 px-2 text-lg rounded-md bg-grey ${message && !message?.success ? "border border-red-500" : ""}`}
          >
            <Image source={PhilIcon} style={{ width: 20, height: 20 }} />
            <TextInput
              key="country-code"
              className="text-black"
              keyboardType="default"
              includeFontPadding={false}
              value={countryCode}
              editable={false}
            />
          </View>

          <TextInput
            className={`flex-1 px-4 py-4 text-lg bg-grey rounded-md text-black ${
              message && !message?.success ? "border border-red-500" : ""
            }`}
            placeholder="Mobile Number"
            placeholderTextColor="#9E9E9E"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
          />
        </View>
        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message?.message}</Text>
        )}
      </View>

      <TouchableOpacity
        className="flex items-center justify-center w-full p-4 rounded-md bg-primary"
        onPress={verifyMobileNumber}
      >
        <Text className="text-lg font-semibold text-white">
          Send Verification Code
        </Text>
      </TouchableOpacity>

      <PersonalizedLoadingAnimation visible={loading} />

      <Snackbar
        visible={snackBarVisible}
        onDismiss={() => setSnackBarVisible(false)}
        text={message?.message}
      />
    </View>
  );
};

export default MobileNumberRegistrationScreen;
