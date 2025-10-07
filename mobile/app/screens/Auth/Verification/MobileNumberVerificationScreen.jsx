"use client";

import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";
import Snackbar from "../../../components/Snackbar";

import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const MobileNumberVerificationScreen = ({ navigation }) => {
  const route = useRoute();
  const customNavigation = useNavigation();

  const { login, setUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [message, setMessage] = useState(null);

  const [verificationCode, setVerificationCode] = useState(null);

  const [resendOtpTimeout, setResendOtpTimeout] = useState(0);

  const numDigits = 6;
  const [otp, setOTP] = useState(Array(numDigits).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputs = Array(numDigits)
    .fill(null)
    .map(() => useRef(null));

  const handleChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newOTP = [...otp];
      newOTP[index] = text;
      setOTP(newOTP);

      if (text && index < numDigits - 1) {
        inputs[index + 1].current.focus();
        setFocusedIndex(index + 1);
      }

      setVerificationCode(newOTP.join(""));
    }
  };

  const focusOnLastEmptyInput = () => {
    const lastEmptyIndex = otp.findIndex((digit) => digit === "");
    const targetIndex = lastEmptyIndex === -1 ? numDigits - 1 : lastEmptyIndex;
    inputs[targetIndex].current.focus();
    setFocusedIndex(targetIndex);
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] !== "") {
        // If current input has value, clear it
        const newOTP = [...otp];
        newOTP[index] = "";
        setOTP(newOTP);
        setVerificationCode(newOTP.join(""));
      } else if (index > 0) {
        // If current input is empty, move to previous input and clear it
        const newOTP = [...otp];
        newOTP[index - 1] = "";
        setOTP(newOTP);
        setVerificationCode(newOTP.join(""));
        inputs[index - 1].current.focus();
        setFocusedIndex(index - 1);
      }
    } else if (/^\d+$/.test(e.nativeEvent.key) && index < numDigits - 1) {
      inputs[index + 1].current.focus();
      setFocusedIndex(index + 1);
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

    if (message) setMessage(null);

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    const formData = {
      otp: verificationCode,
      mobileNumber: route.params?.mobileNumber,
    };

    if (route.params?.email) {
      formData.email = route.params.email;
    }

    if (route.params?.editing) {
      formData.editing = route.params?.editing;
      formData.id = route.params?.id;
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
              if (responseData?.editing) {
                setUser(responseData?.data);
              } else {
                login(responseData.token);
              }

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Dashboard",
                    state: {
                      routes: [
                        {
                          name: "Home",
                          params: { message: responseData?.message },
                        },
                      ],
                    },
                  },
                ],
              });
              return;
            } else {
              navigation.navigate("AccountDetailsCreation", {
                mobileNumber: responseData.data.mobileNumber,
              });
            }
          } else {
            setMessage(responseData);
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  const sendCodeAgain = async () => {
    if (resendOtpTimeout > 0) return;

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/send-otp`, {
        mobileNumber: route.params?.mobileNumber,
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
          setMessage(responseData);
          if (responseData?.success) {
            setResendOtpTimeout(60);
            setSnackBarVisible(true);
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

  useEffect(() => {
    let interval;

    if (resendOtpTimeout > 0) {
      interval = setInterval(() => {
        setResendOtpTimeout((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [resendOtpTimeout]);

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
          Verify your number
        </Text>
        <Text className="text-lg font-normal text-primary">
          Enter the 6-digit code sent to your mobile.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="mb-4 text-base text-darkgrey">
          Code sent to{" "}
          <Text className="font-medium text-black">
            {route.params?.mobileNumber}
          </Text>
        </Text>

        <View className="flex flex-row justify-between gap-3">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputs[index]}
              className={`flex-1 p-4 text-xl text-center bg-grey rounded-md text-black ${
                message && !message?.success ? "border border-red-500" : ""
              } ${focusedIndex === index ? "border-2 border-primary" : ""}`}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => {
                focusOnLastEmptyInput();
              }}
              caretHidden={true}
              maxLength={1}
            />
          ))}
        </View>
      </View>

      {message && !message?.success && (
        <Text className="mt-3 text-red-500">{message?.message}</Text>
      )}

      <View className="mt-6">
        <TouchableOpacity
          className={`flex items-center justify-center w-full p-4 rounded-md ${
            resendOtpTimeout > 0 ? "bg-gray-300" : "bg-primary"
          }`}
          onPress={sendCodeAgain}
          disabled={resendOtpTimeout > 0}
        >
          <Text className="text-lg font-semibold text-white">
            {resendOtpTimeout > 0
              ? `Resend in ${resendOtpTimeout}s`
              : "Send code again"}
          </Text>
        </TouchableOpacity>
      </View>

      <PersonalizedLoadingAnimation visible={loading} />

      <Snackbar
        visible={snackBarVisible}
        onDismiss={setSnackBarVisible}
        text={message?.message}
      />
    </View>
  );
};

export default MobileNumberVerificationScreen;
