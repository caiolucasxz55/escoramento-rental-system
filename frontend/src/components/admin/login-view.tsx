"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HardHat, LogIn } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/error-messages";
import { useAdminSession } from "@/store/admin-session";

const ADMIN_HOME = "/admin";

export function LoginView() {
  const { token, login } = useAdminSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) router.replace(ADMIN_HOME);
  }, [token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-sm border-t-4 border-t-brand-500">
        <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <HardHat className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-semibold text-ink">Área administrativa</h1>
        <p className="mt-1 text-sm text-ink-muted">Entre para gerenciar as solicitações.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="E-mail" htmlFor="login-email" required>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </Field>
          <Field label="Senha" htmlFor="login-password" required>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" block loading={submitting}>
            {!submitting && <LogIn aria-hidden />} Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
