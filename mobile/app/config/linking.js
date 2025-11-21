import * as Linking from "expo-linking";

const linking = {
  prefixes: ["palenquemart://"],
  config: {
    screens: {
      EmailSentVerification: "verify-email",
    },
  },
};

export default linking;
