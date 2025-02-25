"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BackNavigationHandler() {
  const router = useRouter();

  useEffect(() => {
    const handlePopState = () => {
      // Redirect to the parent route when the browser back is triggered.
      router.replace("/woodwork");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  return null; // This component doesn't render anything visible.
}
