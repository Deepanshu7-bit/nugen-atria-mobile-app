const recentKeys = new Map();
const DEFAULT_WINDOW_MS = 4000;

export const shouldShowPopup = (key, windowMs = DEFAULT_WINDOW_MS) => {
  if (!key) return false;
  const now = Date.now();
  const lastSeen = recentKeys.get(key);
  if (lastSeen && now - lastSeen < windowMs) {
    return false;
  }

  recentKeys.set(key, now);
  if (recentKeys.size > 300) {
    for (const [storedKey, storedAt] of recentKeys) {
      if (now - storedAt > 10_000) {
        recentKeys.delete(storedKey);
      }
    }
  }

  return true;
};

const normalizeSuffix = (value) => value.replace(/_/g, "-");

const normalizePrefixedType = (prefix, type) => {
  if (!type) return null;
  const lower = String(type).toLowerCase();

  if (lower.startsWith(`${prefix}:`)) {
    return `${prefix}:${normalizeSuffix(lower.slice(prefix.length + 1))}`;
  }
  if (lower.startsWith(`${prefix}_`)) {
    return `${prefix}:${normalizeSuffix(lower.slice(prefix.length + 1))}`;
  }
  if (lower.startsWith(`${prefix}-`)) {
    return `${prefix}:${normalizeSuffix(lower.slice(prefix.length + 1))}`;
  }

  return null;
};

export const normalizeOrderType = (type) => {
  return normalizePrefixedType("order", type);
};

export const normalizeBookingType = (type) => {
  const normalized = normalizePrefixedType("booking", type);
  if (normalized) return normalized;

  if (!type) return null;
  const lower = String(type).toLowerCase();
  const compact = lower.replace(/[^a-z]+/g, "_");

  if (compact.includes("check_in") || compact.includes("checked_in")) {
    return "booking:checked-in";
  }
  if (compact.includes("check_out") || compact.includes("checked_out")) {
    return "booking:checked-out";
  }
  if (compact.includes("booking") && compact.includes("confirm")) {
    return "booking:confirmed";
  }
  if (compact.includes("booking") && compact.includes("cancel")) {
    return "booking:cancelled";
  }

  return null;
};

export const normalizePaymentType = (type) => {
  return normalizePrefixedType("payment", type);
};

const normalizeEventType = (eventType) => {
  return String(eventType || "")
    .toLowerCase()
    .replace(/_/g, "-");
};

export const buildOrderKey = (eventType, orderId) => {
  return `${normalizeEventType(eventType)}:${orderId}`;
};

export const buildBookingKey = (eventType, bookingId) => {
  return `${normalizeEventType(eventType)}:${bookingId}`;
};

export const buildPaymentKey = (eventType, paymentId) => {
  return `${normalizeEventType(eventType)}:${paymentId}`;
};

export const buildGenericKey = (...parts) => {
  const value = parts.find((part) => part && String(part).trim());
  return `generic:${value ?? "unknown"}`;
};
