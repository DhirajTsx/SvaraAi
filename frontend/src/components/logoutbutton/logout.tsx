"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    router.push("/auth/login");
  };

  return (
    <Button
      onClick={handleLogout}
      className="rounded-full px-5 py-2  text-white shadow-lg active:scale-95 transition-all text-sm sm:text-base"
    >
      Logout
    </Button>
  );
}
