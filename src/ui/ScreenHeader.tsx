import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  iconBg?: string; // default = secondary
};

export function ScreenHeader({
  icon,
  title,
  subtitle,
  iconBg = tokens.colors.secondary,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Txt variant="h3">{icon}</Txt>
        </View>
        <Txt variant="h1">{title}</Txt>
      </View>

      {subtitle ? (
        <Txt variant="muted" style={styles.subtitle}>
          {subtitle}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20, // match Figma header padding
    paddingTop: 24,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    opacity: 0.6,
  },
});