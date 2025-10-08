// decide landing pelo cookie (SSR)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = (await cookies()).get("token")?.value; // ajuste o nome se o seu cookie for outro
  if (token) redirect("/dashboard");
  redirect("/login");
}
