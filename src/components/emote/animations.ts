import { Animated } from "react-native";

export type EmoteAnim = "hi" | "alert" | "sleep" | "gift";

export function runEmoteAnimation(
  anim: EmoteAnim,
  scale: Animated.Value,
  opacity: Animated.Value,
  translateY: Animated.Value
) {
  // reset baseline so retriggers always look the same
  scale.setValue(0.92);
  opacity.setValue(0);
  translateY.setValue(2);

  switch (anim) {
    case "hi":
      return Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.03, duration: 220, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]);

    case "alert":
      return Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.02, duration: 180, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
        Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]);

    case "gift":
      return Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.05, duration: 180, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -1, duration: 180, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 140, useNativeDriver: true }),
        ]),
      ]);

    case "sleep":
      return Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.015, duration: 280, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
        Animated.timing(scale, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]);

    default:
      return Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true });
  }
}
