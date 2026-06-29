import { CardStatus } from "@/src/features/nudges/cardModel";

export function getDirectionLabel(from: "me" | "partner") {
  return from === "me" ? "To Partner" : "From Partner";
}

export function getHomeStatusLabel(status: CardStatus) {
  if (status === "active") return "Due today";
  if (status === "evening_reminder") return "Evening reminder";
  if (status === "final_warning") return "Final warning";
  if (status === "expired") return "Expired";
  if (status === "dismissed") return "Dismissed";
  return "Done";
}

