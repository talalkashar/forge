import Link from "next/link";
import { logoutAdminAction } from "@/lib/admin/actions";
import type { AdminSetupStatus } from "@/lib/admin/data";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/marketplace", label: "Marketplace" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/stripe", label: "Stripe" },
  { href: "/admin/sync", label: "Sync" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.18),transparent_30%),linear-gradient(180deg,#050505_0%,#000_48%,#080808_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/"
              className="text-xs font-black uppercase tracking-[0.4em] text-red-500"
            >
              FORGE
            </Link>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Marketplace Admin
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-200 transition-colors hover:border-red-600/60 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="rounded-full border border-red-600/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-600/10"
              >
                Logout
              </button>
            </form>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

export function AdminCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(22,22,22,0.94),rgba(6,6,6,0.98))] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] ${className}`}
    >
      {title ? (
        <h2 className="mb-5 text-lg font-black tracking-[-0.03em] text-white">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <AdminCard>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </AdminCard>
  );
}

export function SetupWarning({ setup }: { setup: AdminSetupStatus }) {
  const missing = [
    !setup.hasPublicSupabaseEnv ? "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
    !setup.hasServiceRole ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    !setup.hasAdminPassword ? "ADMIN_DASHBOARD_PASSWORD" : null,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          Setup Required
        </p>
        <h1 className="mt-3 text-3xl font-black">Admin dashboard is not configured</h1>
        <p className="mt-4 text-sm leading-7 text-amber-50/85">
          Add the missing environment variables, restart the server, then return
          to <span className="font-semibold">/admin</span>.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-amber-100">
          {missing.map((item) => (
            <li key={item}>Missing: {item}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <AdminCard>
      <p className="text-sm font-semibold text-red-300">{message}</p>
    </AdminCard>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-red-600/70"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={4}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-red-600/70"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-red-600/70"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked = false,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean | null;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white">
      <input
        name={name}
        type="checkbox"
        defaultChecked={Boolean(defaultChecked)}
        className="h-4 w-4 accent-red-600"
      />
      {label}
    </label>
  );
}

export function SubmitButton({ children = "Save" }: { children?: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-full border border-red-600/60 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700"
    >
      {children}
    </button>
  );
}
