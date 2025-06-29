import { View, Text } from "react-native";

import axios from "axios";

import { API_URL } from "@env";

const MobileNumberRegistrationScreen = () => {
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
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(`${API_URL}/api/create-account`, {
        email: route.params?.email,
        firstName: firstName,
        lastName: lastName,
        password: password,
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
          if (responseData?.success) {
            navigation.navigate("Dashboard");
          } else {
            setMessage(responseData);
          }
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  return (
    <View className="flex items-center justify-center h-screen">
      <Text>MobileNumberRegistrationScreen</Text>
    </View>
  );
};

export default MobileNumberRegistrationScreen;
