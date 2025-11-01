export default {
  expo: {
    name: "Palenque Mart",
    slug: "Palenque Mart",
    scheme: "palenquemart",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./app/assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./app/assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.PalenqueMart",
      config: {
        googleMapsApiKey: "AIzaSyCYnz_StMrjKEKNnnCdciltxcNTKa_8yaU",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./app/assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.PalenqueMart",
      config: {
        googleMaps: {
          apiKey: "AIzaSyCYnz_StMrjKEKNnnCdciltxcNTKa_8yaU",
        },
      },
      softwareKeyboardLayoutMode: "resize",
    },
    web: {
      favicon: "./app/assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "react-native-video",
      // [
      //   "react-native-vlc-media-player",
      //   {
      //     ios: {
      //       includeVLCKit: false,
      //     },
      //     android: {
      //       legacyJetifier: false,
      //     },
      //   },
      // ],
    ],
  },
};
