import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYBOARD_FLAG = "keyboardOpenedOnce";

export async function hasKeyboardOpenedOnce() {
  const value = await AsyncStorage.getItem(KEYBOARD_FLAG);
  return value === "true";
}
