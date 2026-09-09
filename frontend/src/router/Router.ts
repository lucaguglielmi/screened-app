import { ActiveTool } from "../types/investigation";

export interface ParsedRoute {
  path: string;
  tool: ActiveTool;
  investigationId: string | null;
  legalModal?: 'terms' | 'privacy' | null;
  tab?: string;
}

export const ROUTE_TITLES: Record<ActiveTool, string> = {
  CONVERSATIONAL_DESK: "Screened — Autonomous Cinema Intelligence",
  DUE_DILIGENCE: "Festival Due Diligence — Screened",
  GRANT_SCOUT: "Grant & Funding Research — Screened",
  OPPORTUNITY_SCOUT: "Grant & Funding Research — Screened",
  WHY_SCREENED: "Why Screened Exists — Screened",
  FESTIVAL_PROTECTION_GUIDE: "Festival Protection Guide — Screened",
  HOW_TO_USE: "Screened Agents & WebMCP Protocol — Screened",
  AGENTS: "Screened Agents & WebMCP Protocol — Screened",
  WHAT_CAN_YOU_DO: "What Can You Do — Platform Capabilities & Roadmap — Screened",
  DESIGN_PLAYGROUND: "Design Playground — Screened",
};

/**
 * Normalizes legacy query strings and alias paths to canonical URLs.
 * Example: /?id=foo -> /diligence/foo
 * Example: /investigation/foo -> /diligence/foo
 * Example: /scout -> /grants
 * Example: /how-to-use -> /agents
 */
export function normalizeLegacyUrl(pathname: string, search: string): string | null {
  const params = new URLSearchParams(search);
  const id = params.get("id") || params.get("investigationId");

  if (id) {
    params.delete("id");
    params.delete("investigationId");
    const remainingQuery = params.toString();
    return `/diligence/${encodeURIComponent(id)}${remainingQuery ? `?${remainingQuery}` : ""}`;
  }

  const investigationMatch = pathname.match(/^\/investigation\/([^/]+)/);
  if (investigationMatch) {
    const invId = decodeURIComponent(investigationMatch[1]);
    return `/diligence/${encodeURIComponent(invId)}${search}`;
  }

  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  if (cleanPath === "/scout") return `/grants${search}`;
  if (cleanPath === "/about") return `/why-screened${search}`;
  if (cleanPath === "/protection-guide" || cleanPath === "/festival-protection-guide") return `/guide${search}`;
  if (cleanPath === "/how-to-use") return `/agents${search}`;
  if (cleanPath === "/what-cana-you-do" || cleanPath === "/capabilities") return `/what-can-you-do${search}`;

  return null;
}

/**
 * Parses the current pathname and search into a structured route.
 */
export function parseCurrentRoute(pathname = window.location.pathname, search = window.location.search): ParsedRoute {
  // Check for legacy normalizations
  const normalized = normalizeLegacyUrl(pathname, search);
  if (normalized && typeof window !== "undefined") {
    window.history.replaceState(null, "", normalized);
    pathname = window.location.pathname;
    search = window.location.search;
  }

  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  // Check /diligence/:id/BYOA first
  const byoaMatch = cleanPath.match(/^\/diligence\/([^/]+)\/(?:BYOA|byoa)$/i);
  if (byoaMatch) {
    const invId = decodeURIComponent(byoaMatch[1]);
    return {
      path: "/agents",
      tool: "AGENTS",
      investigationId: invId,
    };
  }

  // Check /diligence/:id
  const diligenceMatch = cleanPath.match(/^\/diligence\/([^/]+)$/);
  if (diligenceMatch) {
    const invId = decodeURIComponent(diligenceMatch[1]);
    return {
      path: cleanPath,
      tool: "DUE_DILIGENCE",
      investigationId: invId,
    };
  }

  if (cleanPath === "/diligence") {
    return {
      path: "/diligence",
      tool: "DUE_DILIGENCE",
      investigationId: null,
    };
  }

  if (cleanPath === "/mcp" || cleanPath === "/byoa" || cleanPath === "/BYOA") {
    return {
      path: "/agents",
      tool: "AGENTS",
      investigationId: null,
    };
  }

  if (cleanPath === "/grants") {
    return {
      path: "/grants",
      tool: "GRANT_SCOUT",
      investigationId: null,
    };
  }

  if (cleanPath === "/why-screened") {
    return {
      path: "/why-screened",
      tool: "WHY_SCREENED",
      investigationId: null,
    };
  }

  if (cleanPath === "/guide") {
    return {
      path: "/guide",
      tool: "FESTIVAL_PROTECTION_GUIDE",
      investigationId: null,
    };
  }

  if (cleanPath === "/agents" || cleanPath === "/how-to-use") {
    return {
      path: "/agents",
      tool: "AGENTS",
      investigationId: null,
    };
  }

  if (cleanPath === "/what-can-you-do" || cleanPath === "/capabilities") {
    return {
      path: "/what-can-you-do",
      tool: "WHAT_CAN_YOU_DO",
      investigationId: null,
    };
  }

  if (cleanPath.startsWith("/playground")) {
    return {
      path: "/playground",
      tool: "DESIGN_PLAYGROUND",
      investigationId: null,
    };
  }

  if (cleanPath === "/terms") {
    return {
      path: "/terms",
      tool: "CONVERSATIONAL_DESK",
      investigationId: null,
      legalModal: "terms",
    };
  }

  if (cleanPath === "/privacy") {
    return {
      path: "/privacy",
      tool: "CONVERSATIONAL_DESK",
      investigationId: null,
      legalModal: "privacy",
    };
  }

  // Default to home / conversational desk
  return {
    path: "/",
    tool: "CONVERSATIONAL_DESK",
    investigationId: null,
  };
}

/**
 * Returns the canonical URL path for a given tool and optional investigation ID.
 */
export function toolToPath(tool: ActiveTool, investigationId?: string | null): string {
  switch (tool) {
    case "CONVERSATIONAL_DESK":
      return "/";
    case "DUE_DILIGENCE":
      return investigationId ? `/diligence/${encodeURIComponent(investigationId)}` : "/diligence";
    case "GRANT_SCOUT":
    case "OPPORTUNITY_SCOUT":
      return "/grants";
    case "WHY_SCREENED":
      return "/why-screened";
    case "FESTIVAL_PROTECTION_GUIDE":
      return "/guide";
    case "AGENTS":
    case "HOW_TO_USE":
      return "/agents";
    case "WHAT_CAN_YOU_DO":
      return "/what-can-you-do";
    case "DESIGN_PLAYGROUND":
      return "/playground";
    default:
      return "/";
  }
}

/**
 * Programmatic client navigation with History API and title update.
 */
export function navigateTo(
  targetPath: string,
  options?: { replace?: boolean; investigationId?: string | null }
): void {
  if (typeof window === "undefined") return;

  const currentFull = `${window.location.pathname}${window.location.search}`;
  if (currentFull === targetPath) return;

  if (options?.replace) {
    window.history.replaceState(null, "", targetPath);
  } else {
    window.history.pushState(null, "", targetPath);
  }

  // Dispatch custom event for immediate React component reactivity
  window.dispatchEvent(new CustomEvent("screened:navigate", { detail: { path: targetPath } }));
}
