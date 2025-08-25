"use client";

import { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Image,
} from "react-native";
import { CommonActions } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";
import GoogleIcon from "../../../assets/images/Google.png";
import FacebookIcon from "../../../assets/images/Facebook.png";

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
          Login your account
        </Text>
        <Text className="text-lg font-normal text-primary">
          Your market access starts here.
        </Text>
      </View>

      <View className="flex gap-5">
        <TextInput
          className={`w-full p-4 text-lg bg-grey rounded-md text-black ${
            message?.error?.code === "INVALID_FORMAT" ||
            (message?.error?.code === "ALL_FIELDS_REQUIRED" && !phoneEmail)
              ? "border border-red-500"
              : ""
          }`}
          placeholder="Email Address or Mobile"
          placeholderTextColor="#9E9E9E"
          keyboardType="email-address"
          includeFontPadding={false}
          value={phoneEmail}
          onChangeText={setPhoneEmail}
        />

        <View className="relative">
          <TextInput
            className={`w-full p-4 text-lg bg-grey rounded-md text-black ${
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
          <Text className="text-primary">Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {message && !message?.success && (
        <Text className="mt-3 text-red-500">{message.message}</Text>
      )}

      <TouchableOpacity
        className="flex items-center justify-center w-full p-4 mt-6 rounded-md bg-primary"
        onPress={handleLogin}
      >
        <Text className="text-lg font-semibold text-white">Login</Text>
      </TouchableOpacity>

      <View className="flex-row items-center w-full my-10">
        <View className="flex-1 h-0.5 bg-grey" />
        <Text className="mx-4 text-darkgrey">Or login with</Text>
        <View className="flex-1 h-0.5 bg-grey" />
      </View>

      <View className="flex w-full gap-4">
        <TouchableOpacity
          className="items-center justify-center p-4 border rounded-md border-primary"
          onPress={() => {}}
        >
          <Image
            className="absolute left-4"
            source={GoogleIcon}
            style={{ width: 20, height: 20 }}
          />
          <Text className="text-lg text-center text-primary">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center justify-center p-4 border rounded-md border-primary"
          onPress={() => {}}
        >
          <Image
            className="absolute left-4"
            source={FacebookIcon}
            style={{ width: 21, height: 21 }}
          />
          <Text className="text-lg text-center text-primary">
            Continue with Facebook
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex items-center gap-4 mt-auto">
        <View className="flex flex-row gap-1">
          <Text className="text-lg text-black">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace("SignUp")}>
            <Text className="text-lg text-primary">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PersonalizedLoadingAnimation visible={loading} />
    </View>
  );
};

export default LoginScreen;
