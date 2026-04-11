import type { ExpoConfig } from "expo/config";
import appJson from "./app.json";

const expo = appJson.expo as ExpoConfig;

const config: ExpoConfig = {
  ...expo,
  extra: {
    ...(typeof expo.extra === "object" && expo.extra !== null ? expo.extra : {}),
    /** Base URL for Sik AI API, e.g. http://192.168.1.5:3333 — no trailing /api */
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  },
};

export default config;
