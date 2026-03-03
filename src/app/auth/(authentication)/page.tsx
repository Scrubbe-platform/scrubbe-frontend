// app/auth/page.tsx
import { redirect } from "next/navigation";

export default function AuthPage() {
  redirect("/auth/signin");
}
