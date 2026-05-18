import { redirect } from "next/navigation";

/**
 * Redirect /dashboard/new to /dashboard/products/new
 */
export default function NewRedirectPage() {
  redirect("/dashboard/products/new");
}
