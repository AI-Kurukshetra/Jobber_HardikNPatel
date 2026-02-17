export const ROLES = {
  admin: "admin",
  staff: "staff",
  customer: "customer"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
