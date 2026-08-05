import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RevealText } from "./RevealText";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <section className="edge border-t border-border py-28 md:py-40">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
        <RevealText as="h2" className="display-lg max-w-xl">
          Private
          <br />
          Access
        </RevealText>

        <div className="lg:pb-3">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Collection releases, atelier notes and early access. Sent rarely, never resold.
          </p>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.p
                key="sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="label-xs mt-10 border-b border-foreground pb-4"
              >
                Thank you — you are on the list.
              </motion.p>
            ) : (
              <motion.form
                key="form"
                onSubmit={submit}
                exit={{ opacity: 0, y: -12 }}
                className="mt-10 flex items-center gap-4 border-b border-foreground/40 pb-4 transition-colors focus-within:border-foreground"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-transparent text-base tracking-tight outline-none placeholder:text-muted-foreground"
                />
                <motion.button
                  type="submit"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                  className="label-xs shrink-0"
                >
                  Subscribe
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}