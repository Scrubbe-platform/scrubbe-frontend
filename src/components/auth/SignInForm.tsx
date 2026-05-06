"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import useAuthStore from "@/lib/stores/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { getEmailDomain } from "@/lib/utils";
import {
  FaBuilding,
  FaLink,
  FaGithub,
  FaGitlab,
  FaMicrosoft,
} from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";
import { getCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/lib/constant";
import { endpoint } from "@/lib/api/endpoint";
import { apiClient } from "@/lib/api/client";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

type SsoDiscoveryResult = {
  available?: boolean;
  enforced?: boolean;
  provider?: string | null;
  providerSlug?: "google" | "github" | "gitlab" | "microsoft-entra-id" | null;
  domain?: string | null;
  ssoDomain?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  protocol?: string | null;
  status?: string | null;
  loginUrl?: string | null;
};

const PROVIDER_OPTIONS = [
  {
    slug: "google",
    label: "Continue with Google",
    icon: <FcGoogle size={18} />,
  },
  {
    slug: "github",
    label: "Continue with GitHub",
    icon: <FaGithub size={18} />,
  },
  {
    slug: "gitlab",
    label: "Continue with GitLab",
    icon: <FaGitlab size={18} />,
  },
  {
    slug: "microsoft-entra-id",
    label: "Continue with Microsoft",
    icon: <FaMicrosoft size={18} />,
  },
] as const;

export default function SignInForm() {
  const { oauthLogin, requestMagicLink, consumeMagicLink } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const errorCode = searchParams.get("error");
  const magicToken = searchParams.get("magic");
  const isAuthRef = useRef(false);
  const shownErrorRef = useRef<string | null>(null);
  const inviteEmail = searchParams.get("email");
  const [steps, setSteps] = useState<"email" | "authenticate">("email");
  const [ssoDiscovery, setSsoDiscovery] = useState<SsoDiscoveryResult | null>(
    null
  );
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);

  // Keep the form handling sfirsture closer to the original
  // even though we're simplifying functionality
  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      // password: "",
    },
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const redirectAfterLogin = useCallback(
    (accountType?: string | null, purpose?: string | null) => {
      if (IS_STANDALONE) {
        if (path === "payment") {
          router.replace("/pricing");
          return;
        }
        if (path === "community") {
          router.replace("/community");
          return;
        }
        return;
      }

      if (path === "ezra") {
        router.push("/ezra/dashboard");
        return;
      }

      if (accountType === "BUSINESS") {
        if (purpose === "IMS") {
          const token = getCookie(COOKIE_KEYS.TOKEN);
          const incidentUrl =
            process.env.NEXT_PUBLIC_INCIDENT_URL ??
            "https://incidents.scrubbe.com";
          window.location.href = `${incidentUrl}/incident/tickets?token=${
            token ?? ""
          }`;
          return;
        }
        router.push("/incident");
        return;
      }

      if (accountType === "DEVELOPER") {
        router.push("/developer/dashboard");
        return;
      }

      router.push("/incident");
    },
    [path, router]
  );

  const handleContinue = async () => {
    const email = watch("email").trim();

    if (!email) {
      toast.error("Please enter your work email first");
      return;
    }

    try {
      setIsDiscoveryLoading(true);
      const response = await apiClient.get(endpoint.auth.sso_discover, {
        params: { email },
      });
      const result = response.data?.data ?? response.data ?? null;
      setSsoDiscovery(result as SsoDiscoveryResult | null);
    } catch (error) {
      console.error("SSO discovery error:", error);
      setSsoDiscovery(null);
      toast.error("Unable to look up workspace sign-in options", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "We will fall back to the standard sign-in options.",
      });
    } finally {
      setIsDiscoveryLoading(false);
      setSteps("authenticate");
    }
  };

  const onSubmit = async () => {
    await handleContinue();
  };

  const handleContinueWithSso = async () => {
    const email = watch("email").trim();

    if (!email) {
      toast.error("Please enter your work email first");
      return;
    }

    try {
      setIsSsoLoading(true);
      const response = await apiClient.get(endpoint.auth.sso_login, {
        params: {
          email,
          ...(path ? { to: path } : {}),
          dryrun: 1,
        },
      });

      const result = response.data?.data ?? response.data;
      const redirectUrl = result?.redirectUrl as string | undefined;

      if (!redirectUrl) {
        throw new Error("Unable to resolve the SSO redirect URL");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("SSO login error:", error);
      toast.error("SSO login failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Unable to start SSO sign in",
      });
    } finally {
      setIsSsoLoading(false);
    }
  };

  const handleRequestMagicLink = async () => {
    const email = watch("email").trim();

    if (!email) {
      toast.error("Please enter your work email first");
      return;
    }

    try {
      setIsMagicLinkLoading(true);
      await requestMagicLink(email, path);
      toast.success("Check your inbox", {
        description: "If your account exists, we sent a magic sign-in link.",
      });
    } catch (error) {
      console.error("Magic link request error:", error);
      toast.error("Unable to send magic link", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "We could not send the link right now",
      });
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const session = useSession();
  const workspaceProviderSlug = ssoDiscovery?.providerSlug ?? null;
  const workspaceProviderLabel =
    PROVIDER_OPTIONS.find((option) => option.slug === workspaceProviderSlug)
      ?.label ?? ssoDiscovery?.provider ?? "workspace SSO";
  const workspaceLabel =
    ssoDiscovery?.businessName ??
    ssoDiscovery?.ssoDomain ??
    getEmailDomain(watch("email")).domain;
  const ssoBridgeUnavailable = Boolean(
    ssoDiscovery?.available && !ssoDiscovery?.providerSlug
  );
  const enforceWorkspaceSso = Boolean(ssoDiscovery?.enforced);
  const lockProviderButtons = Boolean(enforceWorkspaceSso && workspaceProviderSlug);
  const disableProviderButtons = Boolean(enforceWorkspaceSso && ssoBridgeUnavailable);

  const startDirectProviderSignIn = useCallback(
    (provider: string) => {
      return signIn(provider, {
        callbackUrl: `/auth/signin${
          path ? `?to=${encodeURIComponent(path)}` : ""
        }`,
      });
    },
    [path]
  );

  const handleProviderSelection = async (provider: string) => {
    if (disableProviderButtons) {
      toast.error("Workspace SSO is not available on this deployment", {
        description:
          "This workspace needs a tenant-specific SSO bridge before users can sign in here.",
      });
      return;
    }

    if (workspaceProviderSlug && provider === workspaceProviderSlug) {
      await handleContinueWithSso();
      return;
    }

    if (lockProviderButtons && provider !== workspaceProviderSlug) {
      toast.info("Use your workspace provider to continue", {
        description: `${workspaceLabel} is configured for ${workspaceProviderLabel}.`,
      });
      return;
    }

    await startDirectProviderSignIn(provider);
  };

  const onSubmitOAuth = useCallback(async () => {
    try {
      if (!session.data) {
        return;
      }
      const data = {
        email: session.data?.user.email,
        provider_uuid: session.data?.user.id,
        oAuthProvider: session.data?.user.oAuthProvider,
      };
      const userDetails = await oauthLogin(
        data.email ?? "",
        data.provider_uuid ?? "",
        data.oAuthProvider ?? ""
      );

      toast.success("Successfully signed in!", {
        description: `${data.email}, you are being redirected...`,
        duration: 10000,
        id: "redirect",
      });

      await signOut({ redirect: false });
      redirectAfterLogin(
        userDetails?.accountType,
        userDetails?.purpose ?? null
      );
    } catch (error) {
      const status =
        error instanceof AxiosError ? error.response?.status : undefined;
      if (status === 404) {
        toast.error("No account found", {
          description: "Please create an account to continue.",
        });
        const params = new URLSearchParams();
        if (session.data?.user.email) {
          params.set("email", session.data.user.email);
        }
        if (path) {
          params.set("to", path);
        }
        router.push(`/auth/business-signup?${params.toString()}`);
        return;
      }

      console.error("Login error:", error);
      toast.error("Login failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Login failed",
      });
    }
  }, [oauthLogin, path, redirectAfterLogin, router, session.data]);

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      session.data?.user &&
      !isAuthRef.current &&
      !magicToken
    ) {
      isAuthRef.current = true;
      void onSubmitOAuth();
    }
  }, [magicToken, onSubmitOAuth, session.data?.user, session.status]);

  useEffect(() => {
    if (inviteEmail) {
      setValue("email", inviteEmail);
      setSsoDiscovery(null);
    }
  }, [inviteEmail, setValue]);

  useEffect(() => {
    if (!errorCode || shownErrorRef.current === errorCode) {
      return;
    }

    shownErrorRef.current = errorCode;

    const descriptions: Record<string, string> = {
      sso_provider_missing: "We could not determine which identity provider to use for this workspace.",
      sso_callback_not_supported:
        "This workspace still needs the tenant-specific callback implementation for the selected SSO provider.",
      AccessDenied: "The identity provider denied the sign-in request.",
    };

    toast.error("SSO sign-in failed", {
      description:
        descriptions[errorCode] ??
        "We could not complete the single sign-on flow. Please try again or contact your workspace admin.",
    });
  }, [errorCode]);

  useEffect(() => {
    if (!magicToken || isAuthRef.current) {
      return;
    }

    let isMounted = true;

    const handleConsumeMagicLink = async () => {
      try {
        setIsMagicLinkLoading(true);
        isAuthRef.current = true;

        const userDetails = await consumeMagicLink(magicToken);

        if (!isMounted) {
          return;
        }

        await signOut({ redirect: false });
        toast.success("Successfully signed in!", {
          description: `${
            userDetails?.email ?? "Your account"
          } is being redirected...`,
          duration: 10000,
          id: "magic-link-redirect",
        });

        redirectAfterLogin(
          userDetails?.accountType,
          userDetails?.purpose ?? null
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const description =
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Unable to consume magic link";

        toast.error("Magic link failed", {
          description,
        });

        const params = new URLSearchParams();
        if (path) {
          params.set("to", path);
        }
        router.replace(
          `/auth/signin${params.toString() ? `?${params.toString()}` : ""}`
        );
      } finally {
        if (isMounted) {
          setIsMagicLinkLoading(false);
        }
      }
    };

    void handleConsumeMagicLink();

    return () => {
      isMounted = false;
    };
  }, [consumeMagicLink, magicToken, path, redirectAfterLogin, router, signOut]);

  if (steps === "email") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {(session.status == "loading" || isMagicLinkLoading) && (
          <div className=" absolute inset-0 bg-black/20 z-50 flex justify-center pt-[20%] h-screen">
            <Loader2 className=" animate-spin text-primary-500" size={30} />
          </div>
        )}
        <div className="w-full p-6">
          <div className="mb-6 text-center">
            <h1 className=" text-xl md:text-2xl text-white font-semibold">
              Sign in
            </h1>
            <p className="text-base text-white">
              Enter your work email to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Work Email"
                  placeholder="Enter Email"
                  {...field}
                  error={errors.email?.message}
                  labelClassName="text-white"
                  className="text-white"
                />
              )}
            />

            {/* <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  label="Password"
                  placeholder="Enter Password"
                  {...field}
                  type="password"
                  error={errors.password?.message}
                  labelClassName="text-white"
                  className="text-white"
                />
              )}
            /> */}

            {/* <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isLoading ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-400"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-IMSCyan hover:underline"
              >
                Forgot password?
              </Link>
            </div> */}

            {/* <CButton type="submit" disabled={isLoading || !isValid}>
              {isLoading ? " Signing in..." : "Sign in"}
            </CButton> */}

            <CButton
              type="submit"
              disabled={!isValid || isDiscoveryLoading}
              className="mt-3 border border-zinc-600 bg-zinc-800 text-white hover:text-dark"
            >
              {isDiscoveryLoading ? "Checking workspace..." : "Continue"}
            </CButton>

            <div className="mt-4 text-center text-gray-200 text-base">
              New to Scrubbe?{" "}
              <Link
                href={`/auth/business-signup?to=${path}`}
                className={`${
                  IS_STANDALONE ? "text-IMSCyan" : "text-blue-600"
                } underline hover:underline inline-flex items-center`}
              >
                Create Workspace
              </Link>
            </div>
          </form>
        </div>
      </Suspense>
    );
  } else if (steps === "authenticate") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {(session.status == "loading" || isMagicLinkLoading) && (
          <div className=" absolute inset-0 bg-black/20 z-50 flex justify-center pt-[20%] h-screen">
            <Loader2 className=" animate-spin text-primary-500" size={30} />
          </div>
        )}
        <div className="w-full p-6">
          <div className="mb-6 text-center">
            <h1 className=" text-lg md:text-xl text-white font-semibold">
              Continue to your workspace
            </h1>
            <p className="text-base text-white">
              {ssoDiscovery?.available
                ? "Your workspace sign-in options were loaded from the server."
                : "We’ll route you to the right sign-in method for your organization."}
            </p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className=" border border-zinc-500 bg px-2 py-2 rounded-full text-sm text-zinc-300 w-fit capitalize flex items-center gap-2 bg-zinc-800/70">
              <FaBuilding />
              {getEmailDomain(watch("email")).domain}
            </div>
            <div className=" border border-zinc-500 bg px-2 py-2 rounded-full text-sm text-zinc-300 w-fit flex items-center gap-2 bg-zinc-800/70">
              <MdOutlineEmail />
              {getEmailDomain(watch("email")).email}
            </div>
          </div>

          {ssoDiscovery?.available && (
            <div className="mb-4 rounded-2xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200">
              <p className="font-semibold text-white">
                {workspaceLabel} {enforceWorkspaceSso ? "requires" : "supports"}{" "}
                {workspaceProviderLabel}.
              </p>
              <p className="mt-1 text-zinc-400">
                {ssoBridgeUnavailable
                  ? "This workspace is configured for a tenant-specific SSO bridge that is not active on this deployment yet."
                  : enforceWorkspaceSso
                    ? "Only the matching workspace provider is enabled below."
                    : "The matching workspace provider is highlighted below, and other sign-in methods stay available."}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {PROVIDER_OPTIONS.map((option) => {
              const matchesWorkspaceProvider =
                option.slug === workspaceProviderSlug;
              const isLockedOut =
                lockProviderButtons && !matchesWorkspaceProvider;

              return (
                <CButton
                  key={option.slug}
                  onClick={() => void handleProviderSelection(option.slug)}
                  type="button"
                  disabled={
                    isSsoLoading || isLockedOut || disableProviderButtons
                  }
                  className={`border text-white hover:text-dark flex items-center justify-center gap-2 ${
                    matchesWorkspaceProvider
                      ? "border-IMSCyan/70 bg-[#00313A]"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                >
                  {option.icon}
                  {matchesWorkspaceProvider && ssoDiscovery?.available
                    ? `${option.label} (Workspace SSO)`
                    : option.label}
                </CButton>
              );
            })}
          </div>

          <div className="flex justify-center items-center text-sm text-zinc-400 gap-2 py-3">
            <div className="h-[1px] w-[100%] bg-zinc-700" />
            or
            <div className="h-[1px] w-[100%] bg-zinc-700" />
          </div>

          <CButton
            onClick={handleRequestMagicLink}
            type="button"
            disabled={isMagicLinkLoading || enforceWorkspaceSso}
            className="border border-zinc-600 bg-zinc-800 text-white hover:text-dark"
          >
            <FaLink /> Email me a magic link
          </CButton>
          <div
            onClick={() => {
              setSsoDiscovery(null);
              setSteps("email");
            }}
            className="mt-4 text-center text-IMSCyan text-base cursor-pointer"
          >
            Use a different email
          </div>
        </div>
      </Suspense>
    );
  }
}
