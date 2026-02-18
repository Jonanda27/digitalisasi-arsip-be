export function formatWIT(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    timeZone: "Asia/Jayapura",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIT";
}
