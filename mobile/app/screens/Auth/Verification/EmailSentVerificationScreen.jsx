"use client";

import { useEffect, useState } from "react";

import { View, Text, TouchableOpacity } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

import axios from "axios";

import Snackbar from "../../../components/Snackbar";
import DefaultLoadingAnimation from "../../../components/DefaultLoadingAnimation";

import { API_URL, WEBSOCKET_URL } from "../../../config/apiConfig";
import useWebSocket from "../../../hooks/useWebSocket";
import { useAuth } from "../../../context/AuthContext";

const EmailSentVerificationScreen = ({ navigation }) => {
  const customNavigation = useNavigation();
  const route = useRoute();

  const { login, setUser } = useAuth();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const [resendEmailTimeout, setResendEmailTimeout] = useState(60);

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

    const formData = { email: email };

    if (route.params?.editing) {
      formData.editing = route.params?.editing;
      formData.id = route.params?.id;
    }

    try {
      const response = await axios.post(`${API_URL}/api/check-email`, formData);

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
            if (responseData?.editing) {
              setUser(responseData?.data);
            } else {
              login(responseData.token);
            }
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Dashboard",
                  state: {
                    routes: [
                      {
                        name: "Home",
                        params: { message: responseData?.message },
                      },
                    ],
                  },
                },
              ],
            });
            return;
          } else {
            navigation.navigate("AccountDetailsCreation", {
              email: responseData?.data?.email,
            });
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  const resendEmail = async () => {
    if (resendEmailTimeout > 0) return;

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/send-email`, {
        email: route.params?.email,
      });

      console.log(response.data);
      responseData = response.data;
    } catch (error) {
      console.log(error);
      responseData = error.response.data;
    } finally {
      const elapseTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          setMessage(responseData);
          if (responseData?.success) {
            setResendEmailTimeout(60);
            setSnackBarVisible(true);
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  useEffect(() => {
    let interval;

    if (resendEmailTimeout > 0) {
      interval = setTimeout(() => {
        setResendEmailTimeout((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [resendEmailTimeout]);

  return (
    <>
      <View className="relative flex-1 px-6 pt-16 pb-12 bg-white">
        <View className="mb-6">
          <TouchableOpacity
            className="self-start p-2 rounded-full bg-grey"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {!initialLoading && (
          <>
            <View className="mb-10">
              <Text className="text-3xl font-semibold text-black">
                Check your email
              </Text>
              <Text className="text-lg font-normal text-primary">
                We've sent a verification link to your inbox.
              </Text>
            </View>

            <View className="flex items-center justify-center flex-1">
              <View className="items-center mb-8">
                <View className="items-center justify-center w-20 h-20 mb-6 rounded-full bg-grey">
                  <Feather name="mail" size={32} color="gray" />
                </View>

                <Text className="mb-4 text-xl font-medium text-center text-black">
                  Verify your email address
                </Text>

                <Text className="text-base text-center text-darkgrey">
                  We sent a verification link to{"\n"}
                  <Text className="font-medium text-black">
                    {route.params?.email}
                  </Text>
                </Text>
              </View>
            </View>

            <View className="mt-auto">
              <TouchableOpacity
                className={`flex items-center justify-center w-full p-4 rounded-md ${
                  resendEmailTimeout > 0 ? "bg-gray-300" : "bg-primary"
                }`}
                onPress={resendEmail}
                disabled={resendEmailTimeout > 0}
              >
                <Text className="text-lg font-semibold text-white">
                  {resendEmailTimeout > 0
                    ? `Resend in ${resendEmailTimeout}s`
                    : "Resend verification email"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <DefaultLoadingAnimation visible={initialLoading || loading} />

        <Snackbar
          visible={snackBarVisible}
          onDismiss={setSnackBarVisible}
          text={message?.message}
        />
      </View>
    </>
  );
};

export default EmailSentVerificationScreen;
