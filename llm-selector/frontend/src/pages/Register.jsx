import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Loader2 } from "lucide-react";
import { register as registerApi } from "../api/auth";

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

export default function Register() {
  const navigate = useNavigate();
  const [err, setErr]       = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    setErr("");
    try {
      await registerApi(email, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      setErr(e.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <Bot size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Start finding the right LLM for your needs</p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-6">
              <div className="text-green-400 text-4xl mb-3">✓</div>
              <p className="text-green-400 font-medium">Account created! Redirecting…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input {...register("email")} type="email" placeholder="you@example.com" className="input" autoFocus />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <input {...register("password")} type="password" placeholder="Min 6 characters" className="input" />
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input {...register("confirm")} type="password" placeholder="Repeat password" className="input" />
                {errors.confirm && <p className="error-text">{errors.confirm.message}</p>}
              </div>

              {err && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
                  {err}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Creating…" : "Create Account"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
