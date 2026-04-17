import type { ReactElement } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type MobileMenuLink = {
  label: string;
  href: string;
};

export type MobileMenuProps = {
  links: ReadonlyArray<MobileMenuLink>;
  ctaText?: string;
  ctaHref?: string;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function MobileMenu({
  links,
  ctaText,
  ctaHref,
}: MobileMenuProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = dialogRef.current;
    if (!panel) return;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("aria-hidden"));

    const initial = focusables()[0];
    initial?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open menu"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
      >
        <HamburgerIcon open={open} />
      </button>

      {open ? (
        <div
          ref={dialogRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className="fixed inset-0 z-50 flex flex-col bg-[color:var(--color-bg)]"
        >
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-6 py-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
            >
              <CloseIcon />
            </button>
          </div>
          <nav
            aria-label="Main"
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-md px-3 py-3 text-lg font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {ctaText && ctaHref ? (
            <div className="border-t border-[color:var(--color-border)] px-6 py-5">
              <a
                href={ctaHref}
                onClick={close}
                className="inline-flex w-full items-center justify-center rounded-lg bg-[color:var(--color-accent)] px-5 py-3 text-base font-medium text-white shadow-sm transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
              >
                {ctaText}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HamburgerIcon({ open }: { open: boolean }): ReactElement {
  return open ? (
    <CloseIcon />
  ) : (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
