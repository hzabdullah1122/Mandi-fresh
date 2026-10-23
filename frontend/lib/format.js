export const money = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
