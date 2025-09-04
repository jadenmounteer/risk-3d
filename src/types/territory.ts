// Define the possible teams that can control territories
export type TeamId =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "unoccupied";

// Define the team colors
export const TEAM_COLORS: Record<TeamId, string> = {
  red: "#ff4444",
  blue: "#4444ff",
  green: "#44ff44",
  yellow: "#ffff44",
  purple: "#ff44ff",
  unoccupied: "#808080",
};

// Define the structure of a territory
export interface Territory {
  id: string;
  name: string;
  position: [number, number, number];
  teamId: TeamId;
  troops: number;
  adjacentTerritories: string[]; // Array of territory IDs that this territory connects to
}

// Define the props for our TerritoryNode component
export interface TerritoryNodeProps {
  territory: Territory;
  onTerritoryClick?: (territoryId: string) => void;
}
