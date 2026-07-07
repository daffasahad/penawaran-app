// app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(email: string, password: string) {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = "Email wajib diisi";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Format email tidak valid";
    }

    if (!password) {
      errors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      errors.password = "Minimal 6 karakter";
    }

    return errors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const errors = validate(email, password);
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const res = await signIn("credentials", {
  email,
  password,
  redirect: false,
  callbackUrl: "/dashboard",
    });

    if (res?.error) {
      setError("Email atau password salah");
      setIsSubmitting(false);
      return;
    }

router.push(res?.url || "/dashboard");

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-6 border border-muted"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-primary">Login</h1>
          <p className="text-xs text-primary/70">
            Masuk untuk mengakses sistem penawaran
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center bg-red-50 border border-red-100 rounded py-2 px-3">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm text-primary" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            className="w-full border border-muted rounded px-3 py-2 text-sm
                       text-[#171717] placeholder-primary
                       focus:outline-none focus:ring-2 focus:ring-primary"
            type="email"
            required
            placeholder="Masukkan email"
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-sm text-primary" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              className="w-full border border-muted rounded px-3 py-2 pr-12 text-sm
                         text-[#171717] placeholder-primary
                         focus:outline-none focus:ring-2 focus:ring-primary"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Masukkan password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-primary hover:text-secondary"
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            >
              {showPassword ? (
                // eye-off icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.97 0-9-3.582-9-8 
                       0-1.32.34-2.566.94-3.675m2.103-2.568A8.962 8.962 0 0112 5c4.97 0 
                       9 3.582 9 8 0 1.482-.402 2.873-1.107 4.053M3 3l18 18"
                  />
                </svg>
              ) : (
                // eye icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.97 0 
                       8.268 2.943 9.542 7-1.274 4.057-5.065 
                       7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded bg-primary text-light text-sm font-medium 
                     hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Memproses..." : "Login"}
        </button>
      </motion.form>
    </div>
  );
}
