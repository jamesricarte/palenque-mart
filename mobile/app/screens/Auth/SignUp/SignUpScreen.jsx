"use client";

import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Image,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Ionicons from "@expo/vector-icons/Ionicons";

import axios from "axios";

import GoogleIcon from "../../../assets/images/Google.png";
import FacebookIcon from "../../../assets/images/Facebook.png";
import PhilIcon from "../../../assets/images/PhilFlag.png";
import BackgroundImage from "../../../assets/images/background.jpg";
import LogoImage from "../../../assets/images/logo.png";

import { API_URL } from "../../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";

const SignUpScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [signUpOption, setSignUpOption] = useState("email");

  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState(null);
  const [countryCode, setCountryCode] = useState("+63");

  const [message, setMessage] = useState(null);

  const strictEmailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileFormat = /^(\+639\d{9}|09\d{9}|9\d{9})$/;

  const signUp = async () => {
    if (
      (signUpOption === "email" && !email) ||
      (signUpOption === "mobileNumber" && !mobileNumber)
    ) {
      setMessage({
        message: "All fields required.",
        error: { code: "ALL_FIELDS_REQUIRED" },
      });
      return;
    }

    if (signUpOption === "email" && !strictEmailFormat.test(email)) {
      setMessage({ message: "Invalid email" });
      return;
    } else if (
      signUpOption === "mobileNumber" &&
      !mobileFormat.test(mobileNumber)
    ) {
      setMessage({ message: "Invalid mobile number format" });
      return;
    }

    const righMobileFormat = countryCode + mobileNumber;

    Keyboard.dismiss();
    setLoading(true);

    const formData =
      signUpOption === "email"
        ? { email: email }
        : { mobileNumber: righMobileFormat };

    const apiPath =
      signUpOption === "email" ? "sign-up-email" : "sign-up-mobile";

    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/${apiPath}`, formData);

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
          if (responseData?.success) {
            if (responseData.signUpOption === "email")
              navigation.navigate("EmailSentVerification", {
                email: responseData.data.email,
              });
            else if (responseData.signUpOption === "mobileNumber")
              navigation.navigate("MobileNumberVerification", {
                mobileNumber: responseData.data.mobileNumber,
              });
          } else {
            setMessage(responseData);
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  useEffect(() => {
    if (signUpOption === "mobileNumber") {
      if (mobileFormat.test(mobileNumber)) {
        setMobileNumber(mobileNumber.replace(/^(0|\+63)/, ""));
      }
    }

    setMessage(null);
  }, [email, mobileNumber, signUpOption]);

  return (
    <View className="relative flex-1 bg-white">
      <ImageBackground source={BackgroundImage} className="h-[210px] px-6 pb-4">
        <LinearGradient
          colors={["rgba(232, 90, 79, 0.8)", "rgba(210, 105, 30, 0.8)"]}
          className="absolute inset-0"
        />

        <View className="absolute top-24 left-4">
          <TouchableOpacity
            className="self-start p-2 rounded-full bg-white/20"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          <Image
            source={LogoImage}
            style={{ width: 300, height: 180 }}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>

      <View
        className="flex-[2] px-8 pt-8 -mt-8 bg-white rounded-t-3xl"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <View className="mb-8">
          <Text className="text-3xl font-semibold text-black">
            Create your account
          </Text>
          <Text className="text-lg font-normal text-[#E85A4F] mt-1">
            Be part of something fresh.
          </Text>
        </View>

        {signUpOption === "email" ? (
          <TextInput
            key="email"
            className={`w-full p-4 text-lg border rounded-md border-gray-300 bg-white text-black ${
              message && !message?.success ? "border border-red-500" : ""
            }`}
            placeholder="Email Address"
            placeholderTextColor="#9E9E9E"
            keyboardType="email-address"
            includeFontPadding={false}
            value={email}
            onChangeText={setEmail}
          />
        ) : (
          <View className="flex-row gap-2">
            <View
              className={`flex-row items-center gap-1 px-2 text-lg rounded-md bg-gray-100 ${message && !message?.success ? "border border-red-500" : ""}`}
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
              key="mobile"
              className={`flex-1 p-4 text-lg border rounded-md border-gray-300 bg-white text-black ${
                message && !message?.success ? "border border-red-500" : ""
              }`}
              placeholder="Mobile Number"
              placeholderTextColor="#9E9E9E"
              keyboardType="phone-pad"
              includeFontPadding={false}
              value={mobileNumber}
              onChangeText={setMobileNumber}
            />
          </View>
        )}

        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message?.message}</Text>
        )}

        <View className="items-end mt-2">
          <Pressable
            onPress={() =>
              signUpOption === "email"
                ? setSignUpOption("mobileNumber")
                : setSignUpOption("email")
            }
          >
            <Text className="text-[#4CAF50] font-medium">
              {signUpOption === "email"
                ? "Use mobile number?"
                : "Use email address?"}
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity
          className="flex items-center justify-center w-full p-4 mt-6 rounded-md"
          style={{ backgroundColor: "#F16B44" }}
          onPress={signUp}
        >
          <Text className="text-lg font-semibold text-white">Register</Text>
        </TouchableOpacity>

        <View className="flex-row items-center w-full my-8">
          <View className="flex-1 h-0.5 bg-gray-200" />
          <Text className="mx-4 text-gray-300">Or register with</Text>
          <View className="flex-1 h-0.5 bg-gray-200" />
        </View>

        <View className="flex w-full gap-4">
          <TouchableOpacity
            className="items-center justify-center p-4 border rounded-md border-gray-300 bg-white"
            onPress={() => {}}
          >
            <Image
              className="absolute left-4"
              source={GoogleIcon}
              style={{ width: 20, height: 20 }}
            />
            <Text className="text-lg text-center text-black">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center justify-center p-4 border rounded-md border-gray-300 bg-white"
            onPress={() => {}}
          >
            <Image
              className="absolute left-4"
              source={FacebookIcon}
              style={{ width: 21, height: 21 }}
            />
            <Text className="text-lg text-center text-black">
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex items-center gap-4 mt-auto mb-6">
          <View className="flex flex-row gap-1">
            <Text className="text-lg text-black">Already have an account?</Text>

            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text className="text-lg font-medium">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PersonalizedLoadingAnimation visible={loading} />
    </View>
  );
};

export default SignUpScreen;
