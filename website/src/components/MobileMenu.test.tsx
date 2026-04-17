import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileMenu from "./MobileMenu";

const LINKS = [
  { label: "Product", href: "/product" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
];

describe("MobileMenu", () => {
  it("is closed by default and exposes a toggle", () => {
    render(<MobileMenu links={LINKS} />);
    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on toggle click and focuses the first interactive element", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} ctaText="Get demo" ctaHref="/demo" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const closeBtn = screen.getByRole("button", { name: /close menu/i });
    expect(closeBtn).toHaveFocus();
  });

  it("closes when Escape is pressed and returns focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    await user.click(toggle);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(toggle).toHaveFocus();
  });

  it("closes when the explicit close button is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.click(screen.getByRole("button", { name: /close menu/i }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes when any nav link is activated", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.click(screen.getByRole("link", { name: "Docs" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("traps focus: Tab from the last focusable wraps to the first", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} ctaText="Get demo" ctaHref="/demo" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await screen.findByRole("dialog");

    const cta = screen.getByRole("link", { name: "Get demo" });
    cta.focus();
    expect(cta).toHaveFocus();

    await user.tab();

    const closeBtn = screen.getByRole("button", { name: /close menu/i });
    expect(closeBtn).toHaveFocus();
  });

  it("traps focus: Shift+Tab from the first focusable wraps to the last", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} ctaText="Get demo" ctaHref="/demo" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await screen.findByRole("dialog");

    const closeBtn = screen.getByRole("button", { name: /close menu/i });
    expect(closeBtn).toHaveFocus();

    await user.tab({ shift: true });

    expect(screen.getByRole("link", { name: "Get demo" })).toHaveFocus();
  });

  it("renders each provided link with its href", async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    for (const { label, href } of LINKS) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
    }
  });
});
