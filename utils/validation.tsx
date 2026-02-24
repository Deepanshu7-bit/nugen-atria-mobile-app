const EMAIL_RFC5322_LITE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email = "") => {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_RFC5322_LITE.test(trimmed)) return "Enter a valid email.";
  return null;
};

export const getPasswordIssues = (password = "") => {
  const issues = [];
  if (password.length < 8) issues.push("Minimum 8 characters.");
  if (!/[A-Z]/.test(password)) issues.push("At least 1 uppercase letter.");
  if (!/[a-z]/.test(password)) issues.push("At least 1 lowercase letter.");
  if (!/[0-9]/.test(password)) issues.push("At least 1 number.");
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    issues.push("At least 1 special character.");
  return issues;
};
