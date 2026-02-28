import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { nagTheme } from "@/src/constants/theme";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[nagTheme.colors.bg, nagTheme.colors.bgTexture]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: nagTheme.colors.bg,
  },
});