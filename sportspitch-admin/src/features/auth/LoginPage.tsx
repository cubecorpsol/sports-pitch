import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/", { replace: true });
    } else {
      setError("Incorrect username or password.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-surface-2 p-6">
        <p className="mb-1 text-lg font-semibold">
          SportsPitch <span className="font-normal text-ink-muted">admin</span>
        </p>
        <p className="mb-6 text-sm text-ink-secondary">Sign in to manage bookings and payments.</p>

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Username</label>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} className="mb-4" autoFocus />

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />

        {error && <p className="mb-4 text-xs font-medium text-status-overdue">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Login
        </Button>
      </form>
    </div>
  );
}
