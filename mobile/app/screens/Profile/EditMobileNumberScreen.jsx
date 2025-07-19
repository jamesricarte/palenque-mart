import { useEffect, useState } from "react";

import {
  View,
  TouchableOpacity,
  TextInput,
  Pressable,
  Text,
  Image,
  Keyboard,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import axios from "axios";

import PhilIcon from "../../assets/images/PhilFlag.png";

import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const EditMobileNumberScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [isFieldValid, setIsFieldValid] = useState(false);

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [countryCode, setCountryCode] = useState("+63");
  const [mobileNumber, setMobileNumber] = useState("");

  const changeMobileNumber = async () => {
    if (!isFieldValid) {
      setMessage({
        message: "Invalid mobile number",
      });
      setSnackBarVisible(true);
      return;
    }

    const righMobileFormat = countryCode + mobileNumber;

    if (righMobileFormat === user?.phone) {
      setMessage({
        message:
          "This is your current phone number. Please enter a different one.",
        success: false,
      });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/send-otp`, {
        mobileNumber: righMobileFormat,
        editing: true,
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
          if (responseData?.success) {
            navigation.navigate("MobileNumberVerification", {
              mobileNumber: responseData?.data?.mobileNumber,
              editing: true,
              id: user?.id,
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
    const mobileFormat = /^(\+639\d{9}|09\d{9}|9\d{9})$/;

    if (mobileFormat.test(mobileNumber)) {
      isValid = true;
      setMobileNumber(mobileNumber.replace(/^(0|\+63)/, ""));
    } else isValid = false;

    setIsFieldValid(isValid);
    setMessage(null);
  }, [mobileNumber]);

  return (
    <View className="flex-1 bg-white">
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="p-6">
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
            placeholder={user?.phone ? "New Phone Number" : "Phone Number"}
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
            includeFontPadding={false}
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        </View>

        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message?.message}</Text>
        )}

        <Pressable
          className={`flex items-center justify-center w-full p-4 mt-6 rounded-md ${
            !isFieldValid ? "bg-grey" : "bg-primary"
          }`}
          onPress={changeMobileNumber}
          disabled={!isFieldValid}
        >
          <Text
            className={`text-lg font-semibold ${
              !isFieldValid ? "text-darkgrey" : "text-white"
            }`}
          >
            Next
          </Text>
        </Pressable>
      </View>

      <PersonalizedLoadingAnimation visible={loading} />
    </View>
  );
};

export default EditMobileNumberScreen;
