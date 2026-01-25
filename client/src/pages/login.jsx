import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const body = isRegistering
        ? { username, password, email, name }
        : { username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || (isRegistering ? "Registration failed" : "Login failed"));
      }
      await res.json();
      navigate("/"); // Redirect to Home
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-6">
            <span className="text-3xl">🥦</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isRegistering ? "Join GrocerySync" : "Welcome Back"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRegistering ? "Create your account to start shopping" : "Sign in to continue to your grocery store"}
          </p>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden backdrop-blur-sm bg-white/90">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={onSubmit}>
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11 bg-gray-50/50"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="johndoe"
                  className="h-11 bg-gray-50/50"
                />
              </div>
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="h-11 bg-gray-50/50"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={isRegistering ? 6 : undefined}
                  className="h-11 bg-gray-50/50"
                />
                {isRegistering && (
                  <p className="text-xs text-gray-500">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading
                  ? (isRegistering ? "Creating account..." : "Signing in...")
                  : (isRegistering ? "Create Account" : "Sign In")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setUsername("");
                  setPassword("");
                  setEmail("");
                  setName("");
                }}
                className="text-primary font-medium hover:text-primary/80 transition-colors flex items-center justify-center gap-2 mx-auto group"
              >
                {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-400 mt-8">
          © 2024 GrocerySync. All rights reserved.
        </p>
      </div>
    </div>
  );
}


