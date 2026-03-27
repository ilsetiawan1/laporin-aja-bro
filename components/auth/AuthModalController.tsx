"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import AuthModal from "@/components/auth/AuthModal";

export default function AuthModalController() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modal = searchParams.get("modal");
  const isOpen = modal === "login" || modal === "register";
  const defaultTab = modal === "register" ? "register" : "login";

  const handleClose = useCallback(() => {
    router.push("/", { scroll: false });
  }, [router]);

  const handleLoginSuccess = useCallback(() => {
    // Refresh the page data so Navbar and other server components reflect new auth state
    router.refresh();
  }, [router]);

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      defaultTab={defaultTab}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
