import { View, Text, TouchableOpacity, TextInput, Modal } from "react-native";
import { useEffect, useState } from "react";

import { useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import LottieView from "lottie-react-native";
import axios from "axios";
import { Snackbar } from "react-native-paper";

import { API_URL } from "@env";

const AccountCreationScreen = ({ navigation }) => {
  const route = useRoute();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState(null);

  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasDigit, setHasDigit] = useState(false);

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("Weak");

  const createAccount = async () => {
    if (firstName === "" || lastName === "" || password === "") {
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

    setTimeout(() => {
      setLoading(false);
      navigation.navigate("MobileNumberRegistration", {
        email: route.params?.email,
        firstName: firstName,
        lastName: lastName,
        password: password,
      });
    }, 2500);
  };

  useEffect(() => {
    if (password !== "") setPasswordFocused(true);

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

        <Text className="mb-5 text-3xl font-bold">Let's get you started!</Text>

        <Text className="mb-5">
          First, let's create your Palenque Mart account with{" "}
          {route.params?.email}
        </Text>

        <View className="flex gap-5">
          <View className="flex flex-row gap-4">
            <TextInput
              key="first name"
              className={`flex-1 p-3 text-lg border  rounded-md ${message?.error?.code == "ALL_REQUIRED" && firstName == "" ? "border-red-500" : "border-black"}`}
              placeholder="First Name"
              includeFontPadding={false}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              key="last name"
              className={`flex-1 p-3 text-lg border rounded-md ${message?.error?.code == "ALL_REQUIRED" && lastName == "" ? "border-red-500" : "border-black"}`}
              placeholder="Last Name"
              includeFontPadding={false}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <TextInput
            key="password"
            className={`w-full p-3 text-lg border rounded-md ${(message?.error?.code == "ALL_REQUIRED" && password == "") || message?.error.code === "PASSWORD_REQUIREMENT_NOT_MET" ? "border-red-500" : "border-black"}`}
            placeholder="Password"
            secureTextEntry={true}
            includeFontPadding={false}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {message && (
          <Text className="mt-4 text-red-500">{message.message}</Text>
        )}

        {passwordFocused && (
          <View className="mt-4">
            <Text className="mb-3">
              Password strength
              <Text className="font-bold"> {passwordStrength}</Text>
            </Text>

            <Text
              className={`${hasMinLength ? "text-green-700" : "text-black"}`}
            >
              At least 6 characters
            </Text>
            <Text
              className={`${hasUppercase ? "text-green-700" : "text-black"}`}
            >
              At least one uppercase letter (A-Z)
            </Text>
            <Text
              className={`${hasLowercase ? "text-green-700" : "text-black"}`}
            >
              At least one lowecase letter (a-z)
            </Text>
            <Text className={`${hasDigit ? "text-green-700" : "text-black"}`}>
              At least one number (0-9)
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="flex items-center justify-center w-full px-4 py-3 mt-6 bg-orange-600 rounded-md"
          onPress={createAccount}
          disabled={!isPasswordValid}
        >
          <Text className="text-xl text-white">Continue</Text>
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

export default AccountCreationScreen;
