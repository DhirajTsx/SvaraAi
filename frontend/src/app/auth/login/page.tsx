"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: keyof LoginFormData, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
      } else {
        localStorage.setItem("token", data.token);
        router.push("/projects");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border border-gray-100">
        <CardHeader className="text-center pt-10">
          <CardTitle className="text-4xl font-extrabold text-gray-800">
            Login
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1  rounded-lg"
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="mt-1 rounded-lg"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-8 ">
          <Button
            className="w-full py-3  text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className=" hover:underline font-medium"
            >
              Sign up here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
