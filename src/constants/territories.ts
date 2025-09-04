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
  {
    id: "northwest_territory",
    name: "Northwest Territory",
    position: [-1.35, 0.5, 2.0], // You'll need to adjust this position
    teamId: "unoccupied",
    troops: 0,
    adjacentTerritories: ["alaska", "alberta", "ontario", "greenland"],
  },
  {
    id: "alberta",
    name: "Alberta",
    position: [-1.05, 0.5, 2.1], // You'll need to adjust this position
    teamId: "unoccupied",
    troops: 0,
    adjacentTerritories: [
      "alaska",
      "northwest_territory",
      "ontario",
      "western_united_states",
    ],
  },
];

// Helper function to get a territory by ID
export const getTerritoryById = (id: string): Territory | undefined => {
  return TERRITORIES.find((territory) => territory.id === id);
};

// Helper function to check if two territories are adjacent
export const areTerritoriesAdjacent = (
  territory1Id: string,
  territory2Id: string
): boolean => {
  const territory1 = getTerritoryById(territory1Id);
  return territory1?.adjacentTerritories.includes(territory2Id) || false;
};

// Helper function to get all adjacent territories for a given territory
export const getAdjacentTerritories = (territoryId: string): Territory[] => {
  const territory = getTerritoryById(territoryId);
  if (!territory) return [];

  return territory.adjacentTerritories
    .map(getTerritoryById)
    .filter((t): t is Territory => t !== undefined);
};
