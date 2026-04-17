import { defineCollection, z } from "astro:content";

const wordCount = (value: string): number =>
  value.trim().split(/\s+/).filter(Boolean).length;

const maxWords = (limit: number) =>
  z
    .string()
    .min(1)
    .refine((value) => wordCount(value) <= limit, {
      message: `must be ${limit} words or fewer`,
    });

const ctaSchema = z.object({
  text: z.string().min(1).max(40),
  href: z.string().min(1),
});

const heroSchema = z.object({
  kind: z.literal("hero"),
  headline: maxWords(8),
  subhead: maxWords(25),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
});

const pillarsSchema = z.object({
  kind: z.literal("pillars"),
  pillars: z
    .array(
      z.object({
        icon: z.string().min(1),
        title: maxWords(4),
        description: z.string().min(1),
      }),
    )
    .length(3),
});

const ctaBlockSchema = z.object({
  kind: z.literal("cta"),
  headline: maxWords(10),
  blurb: z.string().min(1),
  button: ctaSchema,
});

const landingCollection = defineCollection({
  type: "content",
  schema: z.discriminatedUnion("kind", [
    heroSchema,
    pillarsSchema,
    ctaBlockSchema,
  ]),
});

export const collections = {
  landing: landingCollection,
};
