import type { FloorPlanLayout } from "@/lib/floorplan";

/**
 * Known, verified floor layouts for specific apartment/villa projects.
 *
 * When a visitor picks a location from the autocomplete dropdown (e.g.
 * "Prestige Sojourn, Whitefield, Bangalore"), we take the text before the
 * first comma as the project name and look it up here. If it's a project
 * EnNaksha has actually surveyed/verified, we use its real unit layout
 * instead of generating a generic one — a real match beats an AI guess.
 *
 * This starts empty. Add entries as your team verifies real project
 * layouts (from builder brochures, site visits, RERA filings, etc.).
 * The key must be the project name lowercased and trimmed.
 *
 * Example — remove the leading comment markers once you have a real,
 * verified layout to add:
 *
 * "prestige sojourn": {
 *   projectName: "Prestige Sojourn",
 *   location: "Whitefield, Bangalore",
 *   units: {
 *     "2 BHK": {
 *       title: "Prestige Sojourn — 2 BHK",
 *       totalWidth: 32,
 *       totalHeight: 28,
 *       rooms: [
 *         { name: "Foyer", type: "foyer", x: 0, y: 22, width: 8, height: 6 },
 *         { name: "Living Room", type: "living", x: 8, y: 14, width: 14, height: 14 },
 *         { name: "Kitchen", type: "kitchen", x: 22, y: 14, width: 10, height: 8 },
 *         { name: "Dining Area", type: "dining", x: 22, y: 22, width: 10, height: 6 },
 *         { name: "Master Bedroom", type: "master_bedroom", x: 0, y: 0, width: 14, height: 14 },
 *         { name: "Attached Bathroom", type: "bathroom", x: 14, y: 0, width: 6, height: 6 },
 *         { name: "Bedroom 2", type: "bedroom", x: 20, y: 0, width: 12, height: 14 },
 *       ],
 *       notes: "Verified from Prestige Sojourn's builder floor plan.",
 *     },
 *   },
 * },
 */
export type ProjectLayoutTemplate = {
  projectName: string;
  location?: string;
  units: Partial<Record<string, FloorPlanLayout>>;
};

const PROJECT_LAYOUTS: Record<string, ProjectLayoutTemplate> = {
  // Add real, verified project layouts here — see the example above.
};

/** "Prestige Sojourn, Whitefield, Bangalore" -> "Prestige Sojourn" */
export function extractProjectName(location: string): string {
  return location.split(",")[0].trim();
}

/**
 * Looks up a known layout for a project by name. Prefers an exact BHK-type
 * match; falls back to any unit type on file for that project so we still
 * show something real rather than nothing.
 */
export function findProjectLayout(projectNameRaw: string, bhkType?: string): FloorPlanLayout | null {
  const key = projectNameRaw.trim().toLowerCase();
  if (!key) return null;

  const project = PROJECT_LAYOUTS[key];
  if (!project) return null;

  if (bhkType && project.units[bhkType]) {
    return project.units[bhkType]!;
  }

  const firstAvailable = Object.values(project.units)[0];
  return firstAvailable ?? null;
}

export function hasKnownProjectLayouts() {
  return Object.keys(PROJECT_LAYOUTS).length > 0;
}
