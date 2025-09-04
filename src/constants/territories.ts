import { Territory } from "../types/territory";

// Define all territories in the game
export const TERRITORIES: Territory[] = [
  {
    id: "alaska",
    name: "Alaska",
    position: [-1.35, 0.5, 2.58],
    teamId: "unoccupied",
    troops: 0,
    adjacentTerritories: ["northwest_territory", "alberta"],
  },
  // We'll add more territories here as we get their coordinates
];

// Helper function to get a territory by ID
export const getTerritoryById = (id: string): Territory | undefined => {
  return TERRITORIES.find((territory) => territory.id === id);
};
