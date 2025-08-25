"use client";

import { useEffect, useState } from "react";

import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../../components/PersonalizedLoadingAnimation";
import Snackbar from "../../../components/Snackbar";

import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const AccountDetailsCreationScreen = ({ navigation }) => {
  const customNavigation = useNavigation();
  const route = useRoute();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState(null);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasDigit, setHasDigit] = useState(false);

  const [isFieldValid, setIsFieldValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("Weak");

  const createAccount = async () => {
    if (!isFieldValid) {
      setMessage({
        message: "All fields required",
        error: {
          code: "ALL_REQUIRED",
        },
      });
      setSnackBarVisible(true);
      return;
    }

    if (!isPasswordValid) return;

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    const formData = {
      firstName: firstName,
      lastName: lastName,
      password: password,
    };

    if (route.params?.email) formData.email = route.params.email;
    else if (route.params?.mobileNumber)
      formData.mobileNumber = route.params.mobileNumber;

    try {
      const response = await axios.post(
        `${API_URL}/api/create-account`,
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
            if (responseData?.data?.email) {
              login(responseData.token);
              navigation.reset({
                index: 1,
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
                  {
                    name: "MobileNumberRegistration",
                    params: {
                      email: responseData.data.email,
                    },
                  },
                ],
              });
            } else if (responseData?.data?.mobileNumber) {
              login(responseData.token);
              navigation.reset({
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

  useEffect(() => {
    if (firstName === "" || lastName === "" || password === "")
      setIsFieldValid(false);
    else setIsFieldValid(true);

    setMessage(null);
  }, [firstName, lastName, password]);

  useEffect(() => {
    const hasMinLength = /^.{6,}$/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);

    if (hasMinLength) setHasMinLength(true);
    else setHasMinLength(false);
    if (hasUppercase) setHasUppercase(true);
    else setHasUppercase(false);
    if (hasLowercase) setHasLowercase(true);
    else setHasLowercase(false);
    if (hasDigit) setHasDigit(true);
    else setHasDigit(false);

    if (hasMinLength && hasUppercase && hasLowercase && hasDigit)
      setIsPasswordValid(true);
    else setIsPasswordValid(false);

    if (hasMinLength && hasLowercase && hasUppercase && hasDigit)
      setPasswordStrength("Strong");
    else if (hasMinLength && hasLowercase && hasUppercase)
      setPasswordStrength("Good");
    else setPasswordStrength("Weak");
  }, [password]);

  useEffect(() => {
    if (message?.success === false) {
      setSnackBarVisible(true);
    }
  }, [message]);

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
          Complete your profile
        </Text>
        <Text className="text-lg font-normal text-primary">
          Let's set up your Palenque Mart account.
        </Text>
      </View>

      <View className="flex gap-5">
        <View className="flex flex-row gap-4">
          <TextInput
            className={`flex-1 p-4 text-lg bg-grey rounded-md text-black ${
              message?.error?.code == "ALL_REQUIRED" && firstName == ""
                ? "border border-red-500"
                : ""
            }`}
            placeholder="First Name"
            placeholderTextColor="#9E9E9E"
            includeFontPadding={false}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            className={`flex-1 p-4 text-lg bg-grey rounded-md text-black ${
              message?.error?.code == "ALL_REQUIRED" && lastName == ""
                ? "border border-red-500"
                : ""
            }`}
            placeholder="Last Name"
            placeholderTextColor="#9E9E9E"
            includeFontPadding={false}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View className="relative">
          <TextInput
            className={`w-full p-4 text-lg bg-grey rounded-md text-black ${
              (message?.error?.code == "ALL_REQUIRED" && password == "") ||
              message?.error?.code === "PASSWORD_REQUIREMENT_NOT_MET"
                ? "border border-red-500"
                : ""
            }`}
            placeholder="Password"
            placeholderTextColor="#9E9E9E"
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

      {message && <Text className="mt-3 text-red-500">{message.message}</Text>}

      {password !== "" && (
        <View className="p-4 mt-4 rounded-md bg-grey">
          <Text className="mb-3 text-base text-black">
            Password strength:{" "}
            <Text
              className={`font-semibold ${
                passwordStrength === "Strong"
                  ? "text-green-600"
                  : passwordStrength === "Good"
                    ? "text-yellow-600"
                    : "text-red-500"
              }`}
            >
              {passwordStrength}
            </Text>
          </Text>

          <View className="gap-1">
            <Text
              className={`text-sm ${hasMinLength ? "text-green-600" : "text-darkgrey"}`}
            >
              ✓ At least 6 characters
            </Text>
            <Text
              className={`text-sm ${hasUppercase ? "text-green-600" : "text-darkgrey"}`}
            >
              ✓ At least one uppercase letter (A-Z)
            </Text>
            <Text
              className={`text-sm ${hasLowercase ? "text-green-600" : "text-darkgrey"}`}
            >
              ✓ At least one lowercase letter (a-z)
            </Text>
            <Text
              className={`text-sm ${hasDigit ? "text-green-600" : "text-darkgrey"}`}
            >
              ✓ At least one number (0-9)
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        className={`flex items-center justify-center w-full p-4 mt-6 rounded-md ${
          isFieldValid && isPasswordValid ? "bg-primary" : "bg-gray-300"
        }`}
        onPress={createAccount}
        disabled={!(isFieldValid && isPasswordValid)}
      >
        <Text className="text-lg font-semibold text-white">Create Account</Text>
      </TouchableOpacity>

      <PersonalizedLoadingAnimation visible={loading} />

      <Snackbar
        visible={snackBarVisible}
        onDismiss={setSnackBarVisible}
        text={message?.message}
      />
    </View>
  );
};

export default AccountDetailsCreationScreen;
