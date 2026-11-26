import type { LoginInput } from "@/types";

// so para avaliacao/demo: sem as duas variaveis o aviso nao aparece.
// acesso literal a process.env: o Next so embute NEXT_PUBLIC_* escritas assim.
export function demoCredentials(): LoginInput | null {
  const email = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL;
  const password = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD;
  return email && password ? { email, password } : null;
}
