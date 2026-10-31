import { redirect } from "next/navigation";
// Staff accounts are provisioned by an administrator, never through public registration.
export default function SignUp() {
  redirect("/sign-in");
}
