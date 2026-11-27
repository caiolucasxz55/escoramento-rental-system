import type { LoginInput } from "@/types";

// so para demo: sem as duas variaveis o aviso some; process.env literal porque o Next so embute assim
export function demoCredentials(): LoginInput | null {
  const email = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL;
  const password = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD;
  return email && password ? { email, password } : null;
}
