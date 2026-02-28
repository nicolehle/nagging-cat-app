import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { EmoteAnim, runEmoteAnimation } from "./animations";

type Props = {
  source: ImageSourcePropType;
  anim?: EmoteAnim;
  triggerKey?: string | number; // change to retrigger
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Emote({ source, anim = "hi", triggerKey, size = 60, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = runEmoteAnimation(anim, scale, opacity, translateY);
    seq.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim, triggerKey]);

  const animatedStyle = useMemo(
    () => ({
      width: size,
      height: size,
      opacity,
      transform: [{ translateY }, { scale }],
    }),
    [size, opacity, translateY, scale]
  );

  return (
    <Animated.Image
      source={source}
      style={[animatedStyle, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}
