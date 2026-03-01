import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <TextInput
        placeholderTextColor={tokens.colors.neutralSoft}
        {...props}
        style={[styles.input, style]}
      />
      {hint ? <Txt variant="muted">{hint}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: tokens.space.sm,
  },
  input: {
    height: 48,
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.space.lg,
    backgroundColor: tokens.colors.cardInner,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    color: tokens.colors.anchor,
  },
});