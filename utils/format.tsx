export const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatCurrency = (value, currency = "INR") => {
  const amount = toNumber(value, 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
};

export const formatPercent = (value) => `${Math.round(toNumber(value, 0))}%`;

export const formatDateLabel = (date = new Date()) => {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Today";
  }
};

export const getInitials = (name = "") => {
  const parts = name.split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .trim();
};

export const getDisplayName = (user) => {
  if (!user) return "Admin";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return full || user.email || "Admin";
};

export const normalizeRole = (role = "") => String(role).toLowerCase();

export const isOwnerRole = (role = "") =>
  normalizeRole(role).includes("owner");

export const isManagerRole = (role = "") =>
  normalizeRole(role).includes("manager");

export const isAdminRole = (role = "") =>
  normalizeRole(role).includes("admin");

export const isSuperAdminRole = (role = "") => {
  const value = normalizeRole(role);
  return value.includes("superadmin") || (value.includes("super") && value.includes("admin"));
};
