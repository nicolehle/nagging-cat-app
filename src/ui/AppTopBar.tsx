import { appImages } from "@/src/theme/assets";
import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

type Props = {
  title?: string;
  centeredTitle?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  logo?: boolean;
  onProfilePress?: () => void;
};

export function AppTopBar({
  title,
  centeredTitle,
  showBack,
  onBackPress,
  logo,
  onProfilePress,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={onBackPress ?? (() => router.back())}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <ChevronLeft size={22} color={tokens.colors.textPrimary} strokeWidth={2} />
          </Pressable>
        ) : logo ? (
          <Txt variant="h1" style={styles.logoText}>
            nagcat
          </Txt>
        ) : null}
      </View>

      <View style={[styles.center, centeredTitle && styles.centerAbsolute]}>
        {title ? (
          <Txt variant="h2" style={styles.title}>
            {title}
          </Txt>
        ) : null}
      </View>

      <View style={[styles.side, styles.right]}>
        <Pressable
          onPress={onProfilePress ?? (() => router.push("/(tabs)/me"))}
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
        >
          <Image source={appImages.profile} style={styles.avatar} resizeMode="cover" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    position: "relative",
  },
  side: {
    minWidth: 64,
    justifyContent: "center",
  },
  right: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  centerAbsolute: {
    position: "absolute",
    left: 72,
    right: 72,
  },
  logoText: {
    fontSize: 28,
    lineHeight: 32,
    color: tokens.colors.textPrimary,
    textTransform: "lowercase",
  },
  title: {
    textAlign: "center",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.pill,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  pressed: {
    opacity: 0.88,
  },
});
