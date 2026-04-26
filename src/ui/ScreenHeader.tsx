import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  iconBg?: string;
  eyebrow?: string;
};

export function ScreenHeader({
  icon,
  title,
  subtitle,
  iconBg = tokens.colors.surfaceSubtle,
  eyebrow,
}: Props) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? (
        <View style={styles.eyebrowPill}>
          <Txt variant="caption" style={styles.eyebrowText}>
            {eyebrow}
          </Txt>
        </View>
      ) : null}

      <View style={styles.titleRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Txt variant="h2">{icon}</Txt>
        </View>
        <View style={styles.textBlock}>
          <Txt variant="h2">{title}</Txt>
          {subtitle ? (
            <Txt variant="meta" style={styles.subtitle}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: 24,
    paddingBottom: 18,
    gap: 10,
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radius.pill,
    backgroundColor: "#E7F7FB",
    borderWidth: 1,
    borderColor: "#CFEAF1",
  },
  eyebrowText: {
    color: tokens.colors.accentPressed,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  subtitle: {
    color: tokens.colors.textSecondary,
  },
});
