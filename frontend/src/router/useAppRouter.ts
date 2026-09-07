import { useState, useEffect, useCallback } from "react";
import { ActiveTool } from "../types/investigation";
import {
  ParsedRoute,
  parseCurrentRoute,
  navigateTo,
  toolToPath,
  ROUTE_TITLES,
} from "./Router";

export function useAppRouter() {
  const [route, setRoute] = useState<ParsedRoute>(() => parseCurrentRoute());

  // Synchronize on popstate (browser back / forward) and custom navigation events
  useEffect(() => {
    const handleLocationChange = () => {
      const nextRoute = parseCurrentRoute();
      setRoute(nextRoute);

      const title = ROUTE_TITLES[nextRoute.tool] || "Screened";
      document.title = title;
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("screened:navigate", handleLocationChange);

    // Initial document title sync
    const initialTitle = ROUTE_TITLES[route.tool] || "Screened";
    document.title = initialTitle;

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("screened:navigate", handleLocationChange);
    };
  }, [route.tool]);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    navigateTo(path, options);
  }, []);

  const navigateToTool = useCallback(
    (tool: ActiveTool, investigationId?: string | null, options?: { replace?: boolean }) => {
      const path = toolToPath(tool, investigationId);
      navigateTo(path, options);
    },
    []
  );

  return {
    route,
    path: route.path,
    activeTool: route.tool,
    investigationId: route.investigationId,
    navigate,
    navigateToTool,
  };
}
