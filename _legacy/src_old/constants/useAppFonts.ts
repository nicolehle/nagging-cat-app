import { useFonts } from "expo-font";

export function useAppFonts() {
  const [loaded] = useFonts({
    NunitoRegular: require("@/assets/fonts/Nunito-Regular.ttf"),
    NunitoSemiBold: require("@/assets/fonts/Nunito-SemiBold.ttf"),
    NunitoBold: require("@/assets/fonts/Nunito-Bold.ttf"),
  });

  return loaded;
}