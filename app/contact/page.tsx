"use client";

import { Mail, Phone } from "lucide-react";
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
  const [messageState, setMessageState] = useState<"idle" | "success" | "error">("idle");

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
      window.location.href = `mailto:capacitygears@gmail.com?subject=${subject}&body=${body}`;
      setFields(initialFields);
      setInvalidFields([]);
    }, 150);
  };

  return (
    <>
      <a href="#maincontent" className="skip-link">
        Skip to Main Content
      </a>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main id="maincontent" tabIndex={-1}>
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 fade-in-up">
              Get in <span className="text-red-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-400 fade-in-up-delay-1">
              Have a question? We&apos;re here to help.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-2xl p-8 md:p-12 animate-on-scroll animated">
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {([
                  ["name", "Name", "text", "Your name"],
                  ["email", "Email", "email", "your.email@example.com"],
                  ["subject", "Subject", "text", "What's this about?"],
                ] as const).map(([key, label, type, placeholder]) => (
                  <div key={key}>
                    <label htmlFor={key} className="block text-white font-semibold mb-2">
                      {label}
                    </label>
                    <input
                      id={key}
                      name={key}
                      type={type}
                      value={fields[key]}
                      onChange={(event) =>
                        setFields((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      autoComplete={key}
                      required
                      aria-invalid={invalidFields.includes(key)}
                      className={`w-full px-4 py-3 bg-black border rounded-lg text-white focus:border-red-600 transition-colors duration-300 ${
                        invalidFields.includes(key) ? "border-red-600" : "border-gray-700"
                      }`}
                      placeholder={placeholder}
                    />
                    <span className="error-message text-red-600 text-sm hidden" />
                  </div>
                ))}

                <div>
                  <label htmlFor="message" className="block text-white font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={fields.message}
                    onChange={(event) =>
                      setFields((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    required
                    aria-invalid={invalidFields.includes("message")}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white focus:border-red-600 transition-colors duration-300 resize-none ${
                      invalidFields.includes("message") ? "border-red-600" : "border-gray-700"
                    }`}
                    placeholder="Tell us what's on your mind..."
                  />
                  <span className="error-message text-red-600 text-sm hidden" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 glow-red"
                >
                  Email Support
                </button>
              </form>

              <div
                className={`${messageState === "success" ? "block" : "hidden"} mt-6 p-4 bg-green-900/30 border border-green-600 rounded-lg text-green-400 text-center`}
              >
                <p className="font-semibold">Opening your email app with your message.</p>
              </div>

              <div
                className={`${messageState === "error" ? "block" : "hidden"} mt-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-center`}
              >
                <p className="font-semibold">Please complete the highlighted fields before continuing.</p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-on-scroll animated max-w-2xl mx-auto">
              <div className="bg-gray-900 p-6 rounded-lg text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600/15 text-red-500">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-white font-bold mb-2">Email</h3>
                <a
                  href="mailto:capacitygears@gmail.com"
                  className="text-gray-400 hover:text-red-600 transition-colors duration-300 text-sm break-all"
                >
                  capacitygears@gmail.com
                </a>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600/15 text-red-500">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="text-white font-bold mb-2">Phone</h3>
                <a
                  href="tel:5714160080"
                  className="text-gray-400 hover:text-red-600 transition-colors duration-300"
                >
                  (571) 416-0080
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
