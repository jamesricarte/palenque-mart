import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";

import { API_URL } from "../config/apiConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(async () => {
    const savedToken = await AsyncStorage.getItem("token");
    return savedToken ? savedToken : null;
  });

  const checkToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");

      if (savedToken) {
        const response = await axios.get(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        setUser(response.data.data);
        setToken(savedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error(error.response.data);
      setUser(null);
      setToken(null);
    }
  };

  const login = async (token) => {
    setToken(token);
    await AsyncStorage.setItem("token", token);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
  };

  useEffect(() => {
    if (token) {
      checkToken();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
