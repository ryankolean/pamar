import { describe, expect, it } from "vitest";
import { GET } from "@/app/llms.txt/route";
import { careersFaqs, serviceFaqs, subcontractorFaqs } from "@/content/faqs";
import { getServiceBySlug, getServices } from "@/content/services";
import { faqJsonLd, serviceJsonLd } from "./seo";

describe("answer-engine content", () => {
  it("has FAQs for every service, and only for real services", async () => {
    const slugs = (await getServices()).map((s) => s.slug);
    expect(Object.keys(serviceFaqs).sort()).toEqual([...slugs].sort());
    for (const faqs of [...Object.values(serviceFaqs), careersFaqs, subcontractorFaqs]) {
      expect(faqs.length).toBeGreaterThan(0);
      for (const faq of faqs) {
        expect(faq.question.endsWith("?")).toBe(true);
        expect(faq.answer.length).toBeGreaterThan(20);
      }
    }
  });

  it("builds FAQPage and Service structured data", async () => {
    const faq = faqJsonLd(careersFaqs);
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(careersFaqs[0].answer);

    const service = serviceJsonLd((await getServiceBySlug("demolition"))!);
    expect(service["@type"]).toBe("Service");
    expect(service.provider["@type"]).toBe("GeneralContractor");
    expect(service.url).toMatch(/\/services\/demolition$/);
  });

  it("serves llms.txt listing services and key pages", async () => {
    const response = await GET();
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    const body = await response.text();
    expect(body.startsWith("# Pamar Enterprises")).toBe(true);
    for (const s of await getServices()) expect(body).toContain(s.name);
    expect(body).toContain("/subcontractors/opportunities");
    expect(body).toContain("/careers");
  });
});
