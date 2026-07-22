"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";
import { FormEvent, useState } from "react";

type FormFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFields: FormFields = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [messageState, setMessageState] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessageState("idle");

    const nextInvalidFields = Object.entries(fields)
      .filter(([, value]) => !value.trim())
      .map(([key]) => key);

    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      nextInvalidFields.push("email");
    }

    const uniqueInvalidFields = [...new Set(nextInvalidFields)];
    setInvalidFields(uniqueInvalidFields);

    if (uniqueInvalidFields.length > 0) {
      setMessageState("error");
      return;
    }

    const subject = encodeURIComponent(fields.subject.trim());
    const body = encodeURIComponent(
      `Name: ${fields.name.trim()}\nEmail: ${fields.email.trim()}\n\n${fields.message.trim()}`,
    );

    setMessageState("success");
    window.setTimeout(() => {
      window.location.href = `mailto:contact@forgegym.us?subject=${subject}&body=${body}`;
      setFields(initialFields);
      setInvalidFields([]);
    }, 150);
  };

  const fieldClass = (key: string) =>
    `w-full border bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 ${
      invalidFields.includes(key)
        ? "border-red-500"
        : "border-white/12 focus:border-white/35"
    }`;

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-6xl">
              Contact
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/50">
              Sizing, orders, or product questions. Replies typically within 1 to 2 business days.
            </p>
          </div>
        </section>

        <section className="px-6 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <a
                href="mailto:contact@forgegym.us"
                className="group flex items-start gap-4 border border-white/[0.08] bg-[#080808] p-5 transition-colors hover:border-white/20"
              >
                <span className="border border-white/12 p-3 text-white/70 transition-colors group-hover:text-white">
                  <Mail className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                    Email
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-white">
                    contact@forgegym.us
                  </span>
                </span>
              </a>
              <p className="mt-6 text-sm leading-6 text-white/40">
                Prefer policies first?{" "}
                <Link href="/shipping" className="text-white/70 hover:text-white">
                  Shipping
                </Link>
                {" · "}
                <Link href="/returns" className="text-white/70 hover:text-white">
                  Returns
                </Link>
                {" · "}
                <Link href="/faq" className="text-white/70 hover:text-white">
                  FAQ
                </Link>
              </p>
            </div>

            <div className="border border-white/[0.08] bg-[#080808] p-6 sm:p-8 lg:col-span-8">
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {(
                  [
                    ["name", "Name", "text"],
                    ["email", "Email", "email"],
                    ["subject", "Subject", "text"],
                  ] as const
                ).map(([key, label, type]) => (
                  <div key={key}>
                    <label
                      htmlFor={key}
                      className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/40"
                    >
                      {label}
                    </label>
                    <input
                      id={key}
                      type={type}
                      value={fields[key]}
                      onChange={(event) =>
                        setFields((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className={fieldClass(key)}
                      autoComplete={key === "email" ? "email" : "on"}
                    />
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/40"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={fields.message}
                    onChange={(event) =>
                      setFields((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    className={`${fieldClass("message")} resize-y`}
                  />
                </div>

                {messageState === "error" ? (
                  <p className="text-sm text-red-400">
                    Fill in all fields with a valid email.
                  </p>
                ) : null}
                {messageState === "success" ? (
                  <p className="text-sm text-emerald-400">
                    Opening your email client…
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="w-full rounded-full bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500 sm:w-auto sm:px-10"
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
