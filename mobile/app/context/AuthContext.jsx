import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";

import { API_URL } from "../config/apiConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const checkToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");

      if (savedToken) {
        const response = await axios.get(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.data);
        setToken(savedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error(error);
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const login = async (token) => {
    setToken(token);
    await AsyncStorage.setItem("token", token);

    try {
      const response = await axios.get(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
