export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const raw = process.env.ADMIN_EMAILS ?? "";
  if (!raw.trim()) {
    return false;
  }

  const admins = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase());
}
