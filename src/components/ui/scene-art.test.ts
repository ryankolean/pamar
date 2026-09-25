import { describe, expect, it } from "vitest";
import { getProjects } from "@/content/projects";
import { getServices } from "@/content/services";
import { sceneForLabel } from "./scene-art";

describe("sceneForLabel", () => {
  it("matches labels to fitting scenes", () => {
    expect(sceneForLabel("Water main installation")).toBe("pipes");
    expect(sceneForLabel("Emergency bypass pumping setup")).toBe("emergency");
    expect(sceneForLabel("Road reconstruction")).toBe("road");
    expect(sceneForLabel("Demolition of retail building")).toBe("demolition");
    expect(sceneForLabel("Aerial view of graded industrial site")).toBe("site");
    expect(sceneForLabel("Crew safety briefing")).toBe("hardhat");
    expect(sceneForLabel("President headshot")).toBe("person");
    expect(sceneForLabel("Something else entirely")).toBe("crane");
  });

  it("gives every service and project image an illustration", async () => {
    for (const s of await getServices()) expect(sceneForLabel(s.name)).toBeTruthy();
    for (const p of await getProjects())
      for (const img of p.images) expect(sceneForLabel(img.alt)).toBeTruthy();
  });
});
