// useKeyboardFlag.js
import { useEffect, useRef } from "react";
import { AppState, Keyboard } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYBOARD_FLAG = "keyboardOpenedOnce";

export function useKeyboardFlag() {
  const appState = useRef(AppState.currentState);

  // 🔹 Set flag on first keyboard open
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", async () => {
      const alreadySet = await AsyncStorage.getItem(KEYBOARD_FLAG);
      if (!alreadySet) {
        await AsyncStorage.setItem(KEYBOARD_FLAG, "true");
        console.log("✅ Keyboard flag set in AsyncStorage");
      }
    });

    return () => sub.remove();
  }, []);

  // 🔹 Remove flag when app goes to background/closed
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      if (
        appState.current.match(/active/) &&
        nextState.match(/background|inactive/)
      ) {
        await AsyncStorage.removeItem(KEYBOARD_FLAG);
        console.log("🗑️ Keyboard flag cleared");
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);
}
