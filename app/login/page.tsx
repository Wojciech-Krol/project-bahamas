"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock credentials
const MOCK_USERS = {
  "user@hakuna.com": { password: "user123", role: "user", name: "Alex Johnson", redirect: "/dashboard" },
  "partner@hakuna.com": { password: "partner123", role: "partner", name: "Alex Rivera", redirect: "/partner" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600)); // simulate network

    const user = MOCK_USERS[email as keyof typeof MOCK_USERS];
    if (!user || user.password !== password) {
      setError("Invalid email or password. Try the demo accounts below.");
      setLoading(false);
      return;
    }

    // Store mock session in sessionStorage
    sessionStorage.setItem("hakuna_user", JSON.stringify({ email, name: user.name, role: user.role }));
    router.push(user.redirect);
  };

  const fillDemo = (type: "user" | "partner") => {
    if (type === "user") {
      setEmail("user@hakuna.com");
      setPassword("user123");
    } else {
      setEmail("partner@hakuna.com");
      setPassword("partner123");
    }
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-[#f7f9ff] font-sans">
      {/* Left Panel — Brand / Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#553ce2] via-[#6f59fc] to-[#4d616c]" />

        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative blobs */}
        <div className="absolute top-1/4 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-[#ba002e]/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-16 py-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[#553ce2]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <span className="text-white text-2xl font-extrabold tracking-tighter" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</span>
          </Link>

          {/* Main copy */}
          <div className="mb-auto">
            <h2 className="text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Continue Your Journey of Discovery.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Join thousands of families in the Bahamas discovering the best classes for every age and passion.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-yellow-300 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="text-white/90 italic text-base leading-relaxed mb-6">
              &ldquo;Hakuna completely transformed our weekends. My daughter now swims competitively and my son discovered a passion for pottery. I can&apos;t imagine Saturdays without it.&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm">SM</div>
              <div>
                <p className="text-white font-bold text-sm">Sarah Miller</p>
                <p className="text-white/60 text-xs font-medium">Parent of 2 · Member since 2023</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            {[
              { value: "5,000+", label: "Active Families" },
              { value: "200+", label: "Expert Instructors" },
              { value: "50+", label: "Class Categories" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-black text-2xl" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{value}</p>
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[#553ce2] rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span className="text-[#553ce2] text-xl font-extrabold tracking-tighter" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</span>
        </Link>

        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-[#181c21] tracking-tight mb-3" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Welcome Back
            </h1>
            <p className="text-[#474555] text-base">
              Sign in to access your dashboard and classes.
            </p>
          </div>

          {/* Demo accounts banner */}
          <div className="mb-8 p-5 bg-[#e4dfff] rounded-2xl border border-[#c7bfff]/50">
            <p className="text-[#170065] font-bold text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#553ce2] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              Demo Accounts — click to fill
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => fillDemo("user")}
                className="flex-1 flex flex-col items-start p-3 bg-white rounded-xl border-2 border-transparent hover:border-[#553ce2] transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#553ce2] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                  <span className="font-bold text-xs text-[#553ce2]">LEARNER</span>
                </div>
                <p className="text-xs text-[#474555] font-medium">user@hakuna.com</p>
                <p className="text-xs text-[#787587]">user123</p>
              </button>
              <button
                onClick={() => fillDemo("partner")}
                className="flex-1 flex flex-col items-start p-3 bg-white rounded-xl border-2 border-transparent hover:border-[#ba002e] transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#ba002e] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                  <span className="font-bold text-xs text-[#ba002e]">PARTNER</span>
                </div>
                <p className="text-xs text-[#474555] font-medium">partner@hakuna.com</p>
                <p className="text-xs text-[#787587]">partner123</p>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[#181c21] mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#787587] text-xl">mail</span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#c8c4d8]/40 bg-white text-[#181c21] font-medium placeholder:text-[#787587]/60 focus:outline-none focus:border-[#553ce2] focus:ring-4 focus:ring-[#553ce2]/10 transition-all"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-[#181c21]" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs font-semibold text-[#553ce2] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#787587] text-xl">lock</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 rounded-xl border-2 border-[#c8c4d8]/40 bg-white text-[#181c21] font-medium placeholder:text-[#787587]/60 focus:outline-none focus:border-[#553ce2] focus:ring-4 focus:ring-[#553ce2]/10 transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#787587] hover:text-[#553ce2] transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-[#ffdad6] rounded-xl border border-[#ffb4ab]/50">
                <span className="material-symbols-outlined text-[#ba1a1a] text-lg flex-shrink-0">error</span>
                <p className="text-sm text-[#ba1a1a] font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#553ce2] to-[#6f59fc] text-white font-extrabold rounded-xl shadow-lg shadow-[#553ce2]/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  Signing In…
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[#c8c4d8]/30" />
            <span className="text-[#787587] text-xs font-bold uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-[#c8c4d8]/30" />
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-[#c8c4d8]/40 bg-white hover:bg-[#f1f4fb] hover:border-[#c8c4d8] transition-all font-semibold text-sm text-[#181c21]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-[#c8c4d8]/40 bg-white hover:bg-[#f1f4fb] hover:border-[#c8c4d8] transition-all font-semibold text-sm text-[#181c21]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Sign up link */}
          <p className="text-center mt-8 text-sm text-[#474555]">
            Don&apos;t have an account?{" "}
            <Link href="#" className="text-[#553ce2] font-bold hover:underline">
              Sign Up Free
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
          {["Terms", "Privacy", "Help"].map((link) => (
            <Link key={link} href="#" className="text-xs text-[#787587] hover:text-[#553ce2] transition-colors font-medium">
              {link}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
