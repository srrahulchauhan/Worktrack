import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";

export function WorkTrackLoginPage() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef(null);
  const navigate = useNavigate();
  const { redirectError, clearRedirectError } = useAuth();

  const isLogin = mode === "login";

  const errorMessages = {
    "auth/email-already-in-use":
      "This email already has an account. Log in instead.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed":
      "Network error. Check your connection and retry.",
    "auth/operation-not-allowed":
      "Enable this sign-in method in Firebase Console.",
    "auth/popup-blocked":
      "Allow pop-ups for this site to continue with Google.",
    "auth/popup-closed-by-user": "Google sign-in was closed before completion.",
    "auth/unauthorized-domain": `Add ${window.location.hostname} to Firebase Authentication's authorized domains.`,
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found for this email.",
    "auth/weak-password": "Choose a password with at least 8 characters.",
    "auth/wrong-password": "Email or password is incorrect.",
  };

  const showAuthError = (error) => {
    setNotice({
      type: "error",
      text:
        errorMessages[error.code] ||
        "We could not complete sign-in. Check your Firebase Auth settings and try again.",
    });
  };

  useEffect(() => {
    if (redirectError) {
      showAuthError(redirectError);
      clearRedirectError();
    }
  }, [redirectError, clearRedirectError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const displayName = String(formData.get("name") || "").trim();
        if (displayName) {
          await updateProfile(credential.user, { displayName });
        }
      }
      navigate("/worktrack/dashboard", { replace: true });
    } catch (error) {
      showAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setNotice(null);
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      if (window.matchMedia("(max-width: 767px)").matches) {
        await signInWithRedirect(auth, provider);
        return;
      }
      await signInWithPopup(auth, provider);
      navigate("/worktrack/dashboard", { replace: true });
    } catch (error) {
      showAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = emailRef.current?.value.trim();
    if (!email) {
      setNotice({ type: "error", text: "Enter your email address first." });
      emailRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice({ type: "success", text: "Password reset email sent." });
    } catch (error) {
      showAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setNotice(null);
  };

  return (
    <main className="min-h-screen bg-[#f5f8f6] lg:grid lg:grid-cols-2">
      <section className="relative isolate min-h-[210px] overflow-hidden bg-[#173b43] sm:min-h-[250px] lg:min-h-screen">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=85"
          alt="A laptop and notebook on a bright work desk"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#102d34]/95 via-[#102d34]/45 to-[#102d34]/15 lg:bg-gradient-to-br lg:from-[#102d34]/75 lg:via-[#102d34]/45 lg:to-[#102d34]/70" />

        <div className="absolute left-5 top-5 flex items-center gap-2.5 text-white sm:left-8 sm:top-8 lg:left-12 lg:top-10">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#54d6b2] text-[#123b3d] shadow-lg shadow-black/10">
            <Activity size={22} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold">WorkTrack</span>
        </div>

        <div className="absolute inset-x-5 bottom-5 max-w-xl text-white sm:inset-x-8 sm:bottom-8 lg:inset-x-12 lg:bottom-16">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ce5cb] sm:text-xs">
            Career, attendance, pay
          </p>
          <h1 className="max-w-lg text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">
            Know your work. Own what comes next.
          </h1>
          <p className="mt-3 hidden max-w-md text-sm leading-6 text-white/80 lg:block">
            Keep your workdays, earnings, and company history in one clear
            place.
          </p>
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-210px)] items-center justify-center px-5 py-9 sm:min-h-[calc(100vh-250px)] sm:px-10 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2 text-[#17464a] lg:hidden">
              <Activity
                size={20}
                strokeWidth={2.5}
                className="text-[#159b7c]"
              />
              <span className="font-extrabold">WorkTrack</span>
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#16866f]">
              Your workspace
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#172d34] sm:text-4xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-[#66777a]">
              {isLogin
                ? "Sign in to continue to your WorkTrack dashboard."
                : "Set up an account to start organizing your work."}
            </p>
          </div>

          <div
            className="mb-6 grid grid-cols-2 rounded-xl bg-[#e9efec] p-1"
            role="tablist"
            aria-label="Account access"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => switchMode("login")}
              className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${isLogin ? "bg-white text-[#173b43] shadow-sm" : "text-[#687a7b] hover:text-[#173b43]"}`}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => switchMode("signup")}
              className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${!isLogin ? "bg-white text-[#173b43] shadow-sm" : "text-[#687a7b] hover:text-[#173b43]"}`}
            >
              Create account
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#dbe5e2] bg-white px-4 text-sm font-bold text-[#263b3e] transition hover:border-[#a8c9bf] hover:bg-[#fbfdfc] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle size={18} className="animate-spin text-[#16866f]" />
            ) : (
              <span aria-hidden="true" className="font-black text-[#4285f4]">
                G
              </span>
            )}
            {isSubmitting ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa8a5]">
            <span className="h-px flex-1 bg-[#dfe7e3]" />
            or use your email
            <span className="h-px flex-1 bg-[#dfe7e3]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[#334a4d]">
                  Full name
                </span>
                <span className="flex h-12 items-center gap-3 rounded-xl border border-[#dbe5e2] bg-white px-3.5 transition focus-within:border-[#16866f] focus-within:ring-2 focus-within:ring-[#16866f]/10">
                  <UserRound size={17} className="shrink-0 text-[#8b9b99]" />
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Your name"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#20383b] outline-none placeholder:text-[#a3afad]"
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#334a4d]">
                Email address
              </span>
              <span className="flex h-12 items-center gap-3 rounded-xl border border-[#dbe5e2] bg-white px-3.5 transition focus-within:border-[#16866f] focus-within:ring-2 focus-within:ring-[#16866f]/10">
                <Mail size={17} className="shrink-0 text-[#8b9b99]" />
                <input
                  type="email"
                  name="email"
                  ref={emailRef}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#20383b] outline-none placeholder:text-[#a3afad]"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#334a4d]">
                Password
              </span>
              <span className="flex h-12 items-center gap-3 rounded-xl border border-[#dbe5e2] bg-white px-3.5 transition focus-within:border-[#16866f] focus-within:ring-2 focus-within:ring-[#16866f]/10">
                <LockKeyhole size={17} className="shrink-0 text-[#8b9b99]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={8}
                  required
                  placeholder="At least 8 characters"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#20383b] outline-none placeholder:text-[#a3afad]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#849491] transition hover:bg-[#f0f5f2] hover:text-[#245c53]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isSubmitting}
                  className="text-xs font-bold text-[#16866f] hover:text-[#116b59]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {notice && (
              <p
                role="status"
                className={`rounded-lg border px-3 py-2.5 text-xs leading-5 ${notice.type === "success" ? "border-[#b8e5d3] bg-[#effaf4] text-[#226348]" : "border-[#f0d9a8] bg-[#fff8e8] text-[#785a21]"}`}
              >
                {notice.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#167f69] px-4 text-sm font-extrabold text-white shadow-md shadow-[#167f69]/15 transition hover:bg-[#116b59] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? "Log in" : "Create account"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-[#84918e]">
            Sign in securely to access your WorkTrack data.
          </p>
        </div>
      </section>
    </main>
  );
}
