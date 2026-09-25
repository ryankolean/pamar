import { describe, expect, it } from "vitest";
import { getJobBySlug } from "@/content/jobs";
import { absoluteUrl, breadcrumbJsonLd, jobPostingJsonLd, serializeJsonLd } from "./seo";

describe("seo helpers", () => {
  it("builds absolute URLs from the site URL", () => {
    expect(absoluteUrl("/projects")).toMatch(/^https?:\/\/[^/]+\/projects$/);
  });

  it("escapes < so JSON-LD can't close its script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });

  it("maps a job to a JobPosting with Google's required fields", async () => {
    const job = (await getJobBySlug("general-laborer-seasonal"))!;
    const data = jobPostingJsonLd(job);
    expect(data["@type"]).toBe("JobPosting");
    expect(data.title).toBe(job.title);
    expect(data.datePosted).toBe(job.postedAt);
    expect(data.employmentType).toBe("TEMPORARY");
    expect(data.hiringOrganization.name).toBeTruthy();
    expect(data.jobLocation.address.addressCountry).toBe("US");
    expect(data.description).toContain("<li>");
  });

  it("numbers breadcrumb items from 1", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
    ]);
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});
