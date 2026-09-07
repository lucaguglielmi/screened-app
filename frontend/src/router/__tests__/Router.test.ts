import { describe, it, expect } from "vitest";
import {
  parseCurrentRoute,
  normalizeLegacyUrl,
  toolToPath,
} from "../Router";

describe("Router unit tests", () => {
  describe("normalizeLegacyUrl", () => {
    it("normalizes ?id=... query param to /diligence/:id", () => {
      expect(normalizeLegacyUrl("/", "?id=demo_pinco_pallino")).toBe("/diligence/demo_pinco_pallino");
      expect(normalizeLegacyUrl("/diligence", "?id=inv-123")).toBe("/diligence/inv-123");
    });

    it("normalizes ?investigationId=... query param to /diligence/:id", () => {
      expect(normalizeLegacyUrl("/", "?investigationId=inv-456")).toBe("/diligence/inv-456");
    });

    it("normalizes /investigation/:id to /diligence/:id", () => {
      expect(normalizeLegacyUrl("/investigation/inv-789", "")).toBe("/diligence/inv-789");
    });

    it("normalizes alias paths", () => {
      expect(normalizeLegacyUrl("/scout", "")).toBe("/grants");
      expect(normalizeLegacyUrl("/about", "")).toBe("/why-screened");
      expect(normalizeLegacyUrl("/protection-guide", "")).toBe("/guide");
      expect(normalizeLegacyUrl("/how-to-use", "")).toBe("/agents");
    });

    it("returns null for standard canonical paths", () => {
      expect(normalizeLegacyUrl("/", "")).toBeNull();
      expect(normalizeLegacyUrl("/diligence", "")).toBeNull();
      expect(normalizeLegacyUrl("/diligence/inv-123", "")).toBeNull();
      expect(normalizeLegacyUrl("/grants", "")).toBeNull();
      expect(normalizeLegacyUrl("/agents", "")).toBeNull();
    });
  });

  describe("parseCurrentRoute", () => {
    it("parses root path as CONVERSATIONAL_DESK", () => {
      const route = parseCurrentRoute("/", "");
      expect(route.path).toBe("/");
      expect(route.tool).toBe("CONVERSATIONAL_DESK");
      expect(route.investigationId).toBeNull();
    });

    it("parses /diligence as DUE_DILIGENCE with no id", () => {
      const route = parseCurrentRoute("/diligence", "");
      expect(route.path).toBe("/diligence");
      expect(route.tool).toBe("DUE_DILIGENCE");
      expect(route.investigationId).toBeNull();
    });

    it("parses /diligence/:id as DUE_DILIGENCE with investigationId", () => {
      const route = parseCurrentRoute("/diligence/demo_pinco_pallino", "");
      expect(route.path).toBe("/diligence/demo_pinco_pallino");
      expect(route.tool).toBe("DUE_DILIGENCE");
      expect(route.investigationId).toBe("demo_pinco_pallino");
    });

    it("parses other semantic paths", () => {
      expect(parseCurrentRoute("/grants", "").tool).toBe("GRANT_SCOUT");
      expect(parseCurrentRoute("/why-screened", "").tool).toBe("WHY_SCREENED");
      expect(parseCurrentRoute("/guide", "").tool).toBe("FESTIVAL_PROTECTION_GUIDE");
      expect(parseCurrentRoute("/agents", "").tool).toBe("AGENTS");
      expect(parseCurrentRoute("/how-to-use", "").tool).toBe("AGENTS");
    });

    it("falls back to CONVERSATIONAL_DESK on unknown path", () => {
      const route = parseCurrentRoute("/random-unknown", "");
      expect(route.path).toBe("/");
      expect(route.tool).toBe("CONVERSATIONAL_DESK");
    });
  });

  describe("toolToPath", () => {
    it("maps tools to paths correctly", () => {
      expect(toolToPath("CONVERSATIONAL_DESK")).toBe("/");
      expect(toolToPath("DUE_DILIGENCE")).toBe("/diligence");
      expect(toolToPath("DUE_DILIGENCE", "demo_pinco_pallino")).toBe("/diligence/demo_pinco_pallino");
      expect(toolToPath("GRANT_SCOUT")).toBe("/grants");
      expect(toolToPath("WHY_SCREENED")).toBe("/why-screened");
      expect(toolToPath("FESTIVAL_PROTECTION_GUIDE")).toBe("/guide");
      expect(toolToPath("AGENTS")).toBe("/agents");
      expect(toolToPath("HOW_TO_USE")).toBe("/agents");
    });
  });
});
