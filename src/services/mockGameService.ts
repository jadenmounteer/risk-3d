import { GameService, GameState, Player } from "../types/game";
import { TERRITORIES } from "../constants/territories";

// In-memory storage for our mock service
let mockGameState: GameState = {
  id: "mock-game",
  currentTurnPlayerId: "",
  phase: "SETUP",
  players: [],
  territories: Object.fromEntries(
    TERRITORIES.map((territory) => [territory.id, territory])
  ),
};

// Mock subscribers
const subscribers: ((state: GameState) => void)[] = [];

// Helper to notify all subscribers of state changes
const notifySubscribers = () => {
  subscribers.forEach((callback) => callback({ ...mockGameState }));
};

export const mockGameService: GameService = {
  createGame: async (players: Player[]) => {
    mockGameState = {
      ...mockGameState,
      players,
      currentTurnPlayerId: players[0].id,
      phase: "SETUP",
    };
    notifySubscribers();
    return mockGameState.id;
  },

  joinGame: async (gameId: string, player: Player) => {
    mockGameState.players.push(player);
    notifySubscribers();
  },

  getGameState: async (gameId: string) => {
    return { ...mockGameState };
  },

  subscribeToGameState: (
    gameId: string,
    callback: (state: GameState) => void
  ) => {
    subscribers.push(callback);
    // Initial callback with current state
    callback({ ...mockGameState });
    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  },

  claimTerritory: async (
    gameId: string,
    territoryId: string,
    playerId: string
  ) => {
    const player = mockGameState.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");

    mockGameState.territories[territoryId] = {
      ...mockGameState.territories[territoryId],
      teamId: player.teamId,
      troops: 1,
    };
    notifySubscribers();
  },

  placeTroops: async (gameId: string, territoryId: string, troops: number) => {
    const territory = mockGameState.territories[territoryId];
    mockGameState.territories[territoryId] = {
      ...territory,
      troops: territory.troops + troops,
    };
    notifySubscribers();
  },

  attack: async (
    gameId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => {
    // Implement mock attack logic
    // For now, just transfer troops and ownership
    const fromTerritory = mockGameState.territories[fromTerritoryId];
    mockGameState.territories[toTerritoryId] = {
      ...mockGameState.territories[toTerritoryId],
      teamId: fromTerritory.teamId,
      troops,
    };
    mockGameState.territories[fromTerritoryId] = {
      ...fromTerritory,
      troops: fromTerritory.troops - troops,
    };
    notifySubscribers();
  },

  fortify: async (
    gameId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => {
    const fromTerritory = mockGameState.territories[fromTerritoryId];
    const toTerritory = mockGameState.territories[toTerritoryId];

    mockGameState.territories[fromTerritoryId] = {
      ...fromTerritory,
      troops: fromTerritory.troops - troops,
    };
    mockGameState.territories[toTerritoryId] = {
      ...toTerritory,
      troops: toTerritory.troops + troops,
    };
    notifySubscribers();
  },

  endTurn: async (gameId: string) => {
    const currentPlayerIndex = mockGameState.players.findIndex(
      (p) => p.id === mockGameState.currentTurnPlayerId
    );
    const nextPlayerIndex =
      (currentPlayerIndex + 1) % mockGameState.players.length;
    mockGameState.currentTurnPlayerId =
      mockGameState.players[nextPlayerIndex].id;
    notifySubscribers();
  },
};
