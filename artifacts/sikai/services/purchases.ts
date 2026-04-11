import { Alert, Platform } from "react-native";

/**
 * Real App Store subscriptions require StoreKit (e.g. RevenueCat or expo-in-app-purchases
 * with a dev client). This module blocks fake purchases and documents the gap.
 */
export function requestProSubscription(planId: "monthly" | "annual"): Promise<boolean> {
  return new Promise((resolve) => {
    const devSimulate =
      __DEV__ && Platform.OS !== "web"
        ? {
            text: "Simulate successful purchase (dev only)",
            onPress: () => resolve(true),
          }
        : null;

    Alert.alert(
      "In-app purchase not configured",
      "This build does not process App Store payments. For production you must integrate StoreKit (or RevenueCat), define subscription products in App Store Connect, and validate receipts on your backend.",
      [
        ...(devSimulate ? [devSimulate] : []),
        { text: "OK", style: "cancel", onPress: () => resolve(false) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
