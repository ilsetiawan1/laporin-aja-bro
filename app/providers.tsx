"use client";

import { AuthProvider } from "@/lib/context/authContext";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "bg-navy border border-blue/30 text-white rounded-xl shadow-2xl backdrop-blur-md",
          descriptionClassName: "text-white/70",
        }}
      />
    </AuthProvider>
  );
}