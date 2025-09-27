"use client";

import { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Image,
  ImageBackground,
} from "react-native";
import { CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";
import GoogleIcon from "../../../assets/images/Google.png";
import FacebookIcon from "../../../assets/images/Facebook.png";
import BackgroundImage from "../../../assets/images/background.jpg";
import LogoImage from "../../../assets/images/logo.png";

import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(false);

  const [phoneEmail, setPhoneEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [twoFA, setTwoFA] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^(\+639\d{9}|09\d{9}|9\d{9})$/;

  const handleLogin = async () => {
    if (!phoneEmail || !password) {
      setMessage({
        message: "All fields required.",
        error: { code: "ALL_FIELDS_REQUIRED" },
      });
      return;
    }

    const formData = {
      phoneEmail: phoneEmail,
      password: password,
      twoFA: twoFA,
    };

    if (emailRegex.test(phoneEmail) || mobileRegex.test(phoneEmail)) {
      setMessage(null);
      if (mobileRegex.test(phoneEmail)) {
        const fixedMobileNumber = phoneEmail.replace(/^(0|\+63)/, "");
        const countryCode = "+63";
        const righMobileFormat = countryCode + fixedMobileNumber;

        formData.phoneEmail = righMobileFormat;
      }
    } else {
      setMessage({
        message: "Invalid email or phone format.",
        error: { code: "INVALID_FORMAT" },
      });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/login`, formData);

      responseData = response.data;
    } catch (error) {
      console.error(error.response.data);
      responseData = error.response.data;
    } finally {
      const elapseTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          if (responseData?.success) {
            if (!responseData.exists) {
              let apiPath;
              let formData;

              if (responseData?.data?.email) {
                apiPath = "sign-up-email";
                formData = { email: responseData?.data?.email };
              } else if (responseData?.data?.mobileNumber) {
                apiPath = "sign-up-mobile";
                formData = { mobileNumber: responseData?.data?.mobileNumber };
              }

              async function signUpAccount() {
                setLoading(true);
                try {
                  const response = await axios.post(
                    `${API_URL}/api/${apiPath}`,
                    formData
                  );

                  console.log("Registering account...:", response.data);
                  if (response.data?.signUpOption === "email") {
                    navigation.navigate("EmailSentVerification", {
                      email: response.data.data.email,
                    });
                  } else if (response.data?.signUpOption === "mobileNumber") {
                    navigation.navigate("MobileNumberVerification", {
                      mobileNumber: response.data.data.mobileNumber,
                    });
                  }
                } catch (error) {
                  console.error(error);
                  setMessage({
                    message: "Something went wrong",
                    success: false,
                  });
                } finally {
                  setLoading(false);
                }
              }

              return signUpAccount();
            }

            if (!responseData?.twoFA) {
              login(responseData.data.token);

              // Check if user is admin and redirect accordingly
              if (responseData.data.isAdmin) {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "AdminDashboard" }],
                  })
                );
              } else {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: "Dashboard",
                        state: {
                          routes: [
                            {
                              name: "Account",
                              params: { message: responseData?.message },
                            },
                          ],
                        },
                      },
                    ],
                  })
                );
              }
              return;
            } else {
              if (responseData?.data?.email) {
                navigation.navigate("EmailSentVerification", {
                  email: responseData?.data?.email,
                });
              } else if (responseData?.data?.mobileNumber) {
                navigation.navigate("MobileNumberVerification", {
                  mobileNumber: responseData?.data?.mobileNumber,
                });
              }
              return;
            }
          } else {
            setMessage(responseData);
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

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
            Login your account
          </Text>
          <Text className="text-lg font-normal text-[#E85A4F] mt-1">
            Your market access starts here.
          </Text>
        </View>

        <View className="flex gap-5">
          <TextInput
            className={`w-full p-4 text-lg border rounded-md border-gray-300 bg-white text-black ${
              message?.error?.code === "INVALID_FORMAT" ||
              (message?.error?.code === "ALL_FIELDS_REQUIRED" && !phoneEmail)
                ? "border border-red-500"
                : ""
            }`}
            placeholder="Email or Mobile"
            placeholderTextColor="#9E9E9E"
            keyboardType="email-address"
            includeFontPadding={false}
            value={phoneEmail}
            onChangeText={setPhoneEmail}
          />

          <View className="relative">
            <TextInput
              className={`w-full p-4 text-lg border rounded-md border-gray-300 bg-white text-black ${
                message?.error?.code === "INCORRECT_PASSWORD" ||
                message?.error?.code === "PASSWORD_REQUIREMENT_NOT_MET" ||
                (message?.error?.code === "ALL_FIELDS_REQUIRED" && !password)
                  ? "border border-red-500"
                  : ""
              }`}
              placeholder="Password"
              placeholderTextColor="#9E9E9E"
              keyboardType="default"
              secureTextEntry={!showPassword}
              includeFontPadding={false}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              className="absolute transform -translate-y-1/2 right-4 top-1/2"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#9E9E9E"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-end mt-4">
          <TouchableOpacity>
            <Text className="text-[#4CAF50] font-medium">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message.message}</Text>
        )}

        <TouchableOpacity
          className="flex items-center justify-center w-full p-4 mt-6 rounded-md"
          style={{ backgroundColor: "#F16B44" }}
          onPress={handleLogin}
        >
          <Text className="text-lg font-semibold text-white">Login</Text>
        </TouchableOpacity>

        <View className="flex-row items-center w-full my-8">
          <View className="flex-1 h-0.5 bg-gray-200" />
          <Text className="mx-4 text-gray-300">Or login with</Text>
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
            <Text className="text-lg text-black">Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.replace("SignUp")}>
              <Text className="text-lg font-medium">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PersonalizedLoadingAnimation visible={loading} />
    </View>
  );
};

export default LoginScreen;
