import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";

import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import axios from "axios";

import { API_URL, WEBSOCKET_URL } from "../../../config/apiConfig";
import useWebSocket from "../../../hooks/useWebSocket";

import { useAuth } from "../../../context/AuthContext";

const EmailSentVerificationScreen = ({ navigation }) => {
  const customNavigation = useNavigation();
  const route = useRoute();

  const { login } = useAuth();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const { socket } = useWebSocket(WEBSOCKET_URL);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data from websocket:", data);

      if (route.params?.email === data.email) {
        proceedSignup(data.email);
      }
    };
  }, [socket]);

  const proceedSignup = async (email) => {
    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/check-email`, {
        email: email,
      });

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
          if (responseData.exists) {
            login(responseData.token);
            customNavigation.dispatch(
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
          } else {
            navigation.navigate("AccountDetailsCreation", { email: email });
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

      {!initialLoading && (
        <>
          <View className="flex items-center gap-4 p-8 pt-24">
            <View className="pt-10 pb-8">
              <Feather name="mail" size={50} color="black" />
            </View>
            <Text className="text-2xl font-bold text-center">
              Before we proceed creating your account, please verify your email
              first.
            </Text>
            <Text className="text-lg text-center">
              We have sent a verification link to your email:{" "}
              {route.params?.email}
            </Text>
          </View>

          <View className="flex gap-4 p-5 pb-10 mt-auto border-t border-gray-300">
            <TouchableOpacity className="flex items-center justify-center w-full px-4 py-3 bg-orange-600 rounded-md">
              <Text className="text-xl text-white">Check inbox</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex items-center justify-center w-full px-4 py-3 border border-gray-600 rounded-md">
              <Text className="text-xl text-gray-600">
                Resend verification link
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal transparent visible={initialLoading || loading}>
        <View className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 rounded-xl left-1/2 top-1/2">
          <ActivityIndicator size="large" color="black" />
        </View>
      </Modal>
    </>
  );
};

export default EmailSentVerificationScreen;
