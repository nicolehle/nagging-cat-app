// nagcat/components/NudgeCard.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewProps } from "react-native";

export function NudgeCard({
  pulseKey,
  children,
  style,
  ...rest
}: ViewProps & { pulseKey: string }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // quick pulse
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.03, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [pulseKey, scale]);

  return (
    <Animated.View style={[styles.card, style, { transform: [{ scale }] }]} {...rest}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#eee",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});
