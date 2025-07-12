import { useState } from "react";

import { View, Text, TouchableOpacity, TextInput, Modal } from "react-native";
import { CommonActions } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import LottieView from "lottie-react-native";
import axios from "axios";

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
    if (phoneEmail === "" || password === "") {
      setMessage({ message: "All fields required." });
      return;
    }

    let formData = {
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

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/login`, formData);

      console.log(response.data);
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
              navigation.dispatch(
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
            className={`w-full p-3 text-lg border rounded-md ${message?.error?.code === "INVALID_FORMAT" ? "border-red-500" : "border-black"}`}
            placeholder="Email/Phone"
            keyboardType="email-address"
            includeFontPadding={false}
            value={phoneEmail}
            onChangeText={setPhoneEmail}
          />

          <View>
            <TextInput
              className={`w-full p-3 text-lg border rounded-md ${message?.error?.code === "INCORRECT_PASSWORD" || message?.error?.code === "PASSWORD_REQUIREMENT_NOT_MET" ? "border-red-500" : "border-black"}`}
              placeholder="Password"
              keyboardType="default"
              secureTextEntry={!showPassword}
              includeFontPadding={false}
              value={password}
              onChangeText={setPassword}
            />

            <Feather
              className="absolute transform -translate-y-1/2 right-6 top-1/2"
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="black"
              onPress={() => setShowPassword(!showPassword)}
            />
          </View>
        </View>

        <TouchableOpacity>
          <Text className="w-full mt-4 text-right text-gray-600">
            Forgot password?
          </Text>
        </TouchableOpacity>

        {message && !message?.success && (
          <Text className="text-red-500">{message.message}</Text>
        )}

        <TouchableOpacity
          className={`flex items-center justify-center w-full px-4 py-3 mt-4 rounded-md bg-orange-600`}
          onPress={handleLogin}
        >
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
    </>
  );
};

export default LoginScreen;
