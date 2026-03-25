export const AUTH_PAGE_TYPE = {
  SIGN_IN: "signin",
  SIGN_UP: "signup",
} as const;

export type AuthPageType = (typeof AUTH_PAGE_TYPE)[keyof typeof AUTH_PAGE_TYPE];
