import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { Pressable, StyleSheet, View } from "react-native";

export function SettingsRow({
  icon,
  title,
  subtitle,
  rightText,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Txt variant="h3">{icon}</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="h3">{title}</Txt>
          {subtitle ? (
            <Txt variant="muted" style={{ opacity: 0.7 }}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {rightText ? (
          <Txt variant="muted" style={{ opacity: 0.7 }}>
            {rightText}
          </Txt>
        ) : null}
        <Txt variant="h3" style={{ opacity: 0.35 }}>
          ›
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.cardInner,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});