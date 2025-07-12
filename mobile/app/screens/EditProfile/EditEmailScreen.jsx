import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Pressable,
  Text,
  Keyboard,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

import { API_URL } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";

const EditEmailScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [isFieldValid, setIsFieldValid] = useState(true);
  const [newEmail, setNewEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const changeEmail = async () => {
    if (!isFieldValid) return;

    if (newEmail === user.email) {
      setMessage({
        message:
          "This is your current email. Please enter a different email address.",
        success: false,
      });
      return;
    }

    Keyboard.dismiss();
    setMessage(null);
    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/send-email`, {
        email: newEmail,
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
            navigation.navigate("EmailSentVerification", {
              id: user.id,
              email: responseData.data?.email,
              editing: true,
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
    let isValid;
    const strictEmailFormat =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (strictEmailFormat.test(newEmail)) {
      isValid = true;
    } else {
      isValid = false;
    }

    setIsFieldValid(isValid);
  }, [newEmail]);

  return (
    <View className="flex-1 bg-white">
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="p-6">
        <TextInput
          className={`p-3 border rounded-md ${message && !message?.success ? "border-red-500" : "border-black"}`}
          placeholder={user.email ? "New Email Address" : "Email Address"}
          value={newEmail}
          onChangeText={setNewEmail}
        />

        {message && !message?.success && (
          <Text className="mt-3 text-red-500">{message?.message}</Text>
        )}

        <Pressable
          className={`flex items-center justify-center w-full p-4 mt-6 rounded-md ${
            !isFieldValid ? "bg-grey" : "bg-primary"
          }`}
          onPress={changeEmail}
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

export default EditEmailScreen;
