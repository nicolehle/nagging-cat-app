import { View, Text, Image, StyleSheet } from "react-native";
import { nagTheme } from "@/src/constants/theme";

export function NagHeader({
  title,
  subtitle,
  badgeCount,
}: {
  title: string;
  subtitle?: string;
  badgeCount?: number;
}) {
  return (
    <View style={styles.wrap}>
      {/* watermark logo */}
      <View style={styles.row}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {!!badgeCount && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>

        {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: nagTheme.colors.bg,
    overflow: "hidden",
  },
  row: { gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: {
    fontFamily: nagTheme.fonts.bold,
    fontSize: 22,
    color: nagTheme.colors.anchor,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: nagTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: nagTheme.fonts.bold,
    fontSize: 11,
    color: nagTheme.colors.onPrimary,
  },
  sub: {
    fontFamily: nagTheme.fonts.regular,
    fontSize: 12,
    color: "rgba(64,60,61,0.60)",
  },
});