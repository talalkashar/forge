"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "./auth";
import { createMissingStripeMappings } from "./stripe";

export async function createMissingStripeMappingsAction() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const result = await createMissingStripeMappings();
  const params = new URLSearchParams({
    processed: String(result.processed),
    productsCreated: String(result.productsCreated),
    productsReused: String(result.productsReused),
    pricesCreated: String(result.pricesCreated),
    pricesReused: String(result.pricesReused),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/stripe");
  revalidatePath("/admin/sync");
  revalidatePath("/admin/products");
  revalidatePath("/admin/marketplace");
  redirect(`/admin/stripe?${params.toString()}`);
}
