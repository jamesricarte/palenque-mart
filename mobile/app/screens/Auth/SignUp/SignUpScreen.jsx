import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Image,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import axios from "axios";
import { Modal } from "react-native-paper";
import LottieView from "lottie-react-native";

import GoogleIcon from "../../../assets/images/Google.png";
import FacebookIcon from "../../../assets/images/Facebook.png";
import PhilIcon from "../../../assets/images/PhilFlag.png";
// import MarketDesign from '../../../assets/images/MarketDesign.png';

// import { API_URL } from "@env";
import { API_URL } from "../../../config/apiConfig";

const SignUpScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [signUpOption, setSignUpOption] = useState("email");

  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState(null);
  const [countryCode, setCountryCode] = useState("+63");

  const [isFieldValid, setIsFieldValid] = useState(false);

  const [message, setMessage] = useState(null);

  const signUp = async () => {
    if (!isFieldValid) return;

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
    let isValid = true;
    const strictEmailFormat =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileFormat = /^(\+639\d{9}|09\d{9}|9\d{9})$/;

    if (signUpOption === "email") {
      if (strictEmailFormat.test(email)) isValid = true;
      else isValid = false;
    } else if (signUpOption === "mobileNumber") {
      if (mobileFormat.test(mobileNumber)) {
        isValid = true;
        setMobileNumber(mobileNumber.replace(/^(0|\+63)/, ""));
      } else isValid = false;
    }

    setIsFieldValid(isValid);
    setMessage(null);
  }, [email, mobileNumber, signUpOption]);

  return (
    <View className="relative flex-1 px-6 py-16 bg-white">
      {/* <View className="absolute top-0 right-0">
        <Image source={MarketDesign} style={{width: 400, height:200, transform: [{ rotate: '30deg' }]}}/>
        </View> */}

      <View className="mb-10">
        <Pressable
          className="self-start p-2 rounded-full bg-grey"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#9E9E9E" />
        </Pressable>
      </View>

      <View className="mb-10">
        <Text className="text-3xl font-semibold">Create your account</Text>
        <Text className="text-lg font-normal text-primary">
          Be part of something fresh.
        </Text>
      </View>

      {signUpOption === "email" ? (
        <TextInput
          key="email"
          className={`w-full p-4 text-lg bg-grey rounded-md text-black${
            message && !message?.success ? "border-error" : "border-black"
          }`}
          placeholder="Sign up with Email Address"
          placeholderTextColor="#9E9E9E"
          keyboardType="email-address"
          includeFontPadding={false}
          value={email}
          onChangeText={setEmail}
        />
      ) : (
        <View className="flex-row gap-2">
          <View className="flex-row items-center gap-1 px-2 text-lg rounded-md bg-grey">
            <Image source={PhilIcon} style={{ width: 20, height: 20 }} />
            <TextInput
              key="country-code"
              className={` text-black ${
                message && !message?.success ? "border-error" : "border-black"
              }`}
              keyboardType="default"
              includeFontPadding={false}
              value={countryCode}
              editable={false}
            />
          </View>

          <TextInput
            key="mobile"
            className={`flex-1 p-4 text-lg bg-grey rounded-md ${
              message && !message?.success ? "border-error" : "border-black"
            }`}
            placeholder="Sign up with Mobile Number"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
            includeFontPadding={false}
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        </View>
      )}

      {message && !message?.success && (
        <Text className="mt-3 text-error">{message?.message}</Text>
      )}

      <View className="items-end mt-2">
        <Pressable
          onPress={() =>
            signUpOption === "email"
              ? setSignUpOption("mobileNumber")
              : setSignUpOption("email")
          }
        >
          <Text className=" text-primary">
            {signUpOption === "email" ? "Use mobile number?" : "Use email?"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        className={`flex items-center justify-center w-full p-4 mt-6 rounded-md ${
          !isFieldValid ? "bg-grey" : "bg-primary"
        }`}
        onPress={signUp}
        disabled={!isFieldValid}
      >
        <Text
          className={`text-lg font-semibold ${
            !isFieldValid ? "text-darkgrey" : "text-white"
          }`}
        >
          Sign up
        </Text>
      </Pressable>

      <View className="flex-row items-center w-full my-10">
        <View className="flex-1 h-0.5 bg-grey" />
        <Text className="mx-4 text-darkgrey">Or signup with</Text>
        <View className="flex-1 h-0.5 bg-grey" />
      </View>

      <View className="flex w-full gap-4">
        <Pressable
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
        </Pressable>

        <Pressable
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
        </Pressable>
      </View>

      <View className="flex items-center gap-4 mt-auto">
        <Text className="text-sm text-center text-gray-600">
          By signing up, you agree to Palenque Mart{" "}
          <Text className="font-medium text-primary">Terms of Service</Text> &{" "}
          <Text className="font-medium text-primary">Privacy Policy</Text>
        </Text>

        <View className="flex flex-row gap-1">
          <Text className="text-lg text-black">Already have an account?</Text>

          <Pressable onPress={() => navigation.replace("Login")}>
            <Text className="text-lg text-primary">Login</Text>
          </Pressable>
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
  );
};

export default SignUpScreen;
