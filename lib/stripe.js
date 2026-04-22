import Stripe from "stripe";

export function createStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}
