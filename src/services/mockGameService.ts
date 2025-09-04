import { GameService, GameState, Player } from "../types/game";
import { TERRITORIES } from "../constants/territories";
import { TeamId } from "../types/territory";

// In-memory storage for our mock service
let mockGameState: GameState = {
  id: "mock-game",
  currentTurnPlayerId: "",
  phase: "SETUP",
  players: [],
  territories: Object.fromEntries(
    TERRITORIES.map((territory) => [territory.id, territory])
  ),
  lastUpdated: Date.now(),
};

// Mock subscribers
const subscribers: ((state: GameState) => void)[] = [];

// Helper to notify all subscribers of state changes
const notifySubscribers = () => {
  subscribers.forEach((callback) => callback({ ...mockGameState }));
};

// Mock admin state
let isAdminLoggedIn = false;

// Mock admin password - in real app this would be in Firebase
const MOCK_ADMIN_PASSWORD = "admin123";

export const mockGameService: GameService = {
  // Admin authentication
  loginAdmin: async (password: string) => {
    // Mock login - in real app this would validate with Firebase
    if (password === MOCK_ADMIN_PASSWORD) {
      isAdminLoggedIn = true;
    } else {
      throw new Error("Invalid password");
    }
  },

  logoutAdmin: async () => {
    isAdminLoggedIn = false;
  },

  isAdmin: () => isAdminLoggedIn,

  // Game state
  getGameState: async () => {
    return { ...mockGameState };
  },

  subscribeToGameState: (callback: (state: GameState) => void) => {
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

  // Game actions
  claimTerritory: async (territoryId: string, playerId: string) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    const player = mockGameState.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");

    mockGameState.territories[territoryId] = {
      ...mockGameState.territories[territoryId],
      teamId: player.teamId,
      troops: 1,
    };
    mockGameState.lastUpdated = Date.now();
    notifySubscribers();
  },

  placeTroops: async (territoryId: string, troops: number) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    const territory = mockGameState.territories[territoryId];
    mockGameState.territories[territoryId] = {
      ...territory,
      troops: territory.troops + troops,
    };
    mockGameState.lastUpdated = Date.now();
    notifySubscribers();
  },

  attack: async (
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
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
    mockGameState.lastUpdated = Date.now();
    notifySubscribers();
  },

  fortify: async (
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
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
    mockGameState.lastUpdated = Date.now();
    notifySubscribers();
  },

  endTurn: async () => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    const currentPlayerIndex = mockGameState.players.findIndex(
      (p) => p.id === mockGameState.currentTurnPlayerId
    );
    const nextPlayerIndex =
      (currentPlayerIndex + 1) % mockGameState.players.length;
    mockGameState.currentTurnPlayerId =
      mockGameState.players[nextPlayerIndex].id;
    mockGameState.lastUpdated = Date.now();
    notifySubscribers();
  },

  // Admin actions
  admin: {
    addPlayer: async (name: string, teamId: TeamId) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name,
        teamId,
        bonusTroops: 0,
      };
      mockGameState.players.push(newPlayer);
      if (!mockGameState.currentTurnPlayerId) {
        mockGameState.currentTurnPlayerId = newPlayer.id;
      }
      mockGameState.lastUpdated = Date.now();
      notifySubscribers();
    },

    removePlayer: async (playerId: string) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      mockGameState.players = mockGameState.players.filter(
        (p) => p.id !== playerId
      );
      mockGameState.lastUpdated = Date.now();
      notifySubscribers();
    },

    addBonusTroops: async (playerId: string, amount: number) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      const player = mockGameState.players.find((p) => p.id === playerId);
      if (player) {
        player.bonusTroops += amount;
        mockGameState.lastUpdated = Date.now();
        notifySubscribers();
      }
    },

    startNewGame: async () => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      mockGameState.phase = "SETUP";
      mockGameState.territories = Object.fromEntries(
        TERRITORIES.map((territory) => [
          territory.id,
          { ...territory, troops: 0, teamId: "unoccupied" },
        ])
      );
      if (mockGameState.players.length > 0) {
        mockGameState.currentTurnPlayerId = mockGameState.players[0].id;
      }
      mockGameState.lastUpdated = Date.now();
      notifySubscribers();
    },

    setGamePhase: async (phase: GameState["phase"]) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      mockGameState.phase = phase;
      mockGameState.lastUpdated = Date.now();
      notifySubscribers();
    },

    resetGame: async () => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      mockGameState = {
        id: "mock-game",
        currentTurnPlayerId: "",
        phase: "SETUP",
        players: [],
        territories: Object.fromEntries(
          TERRITORIES.map((territory) => [territory.id, territory])
        ),
        lastUpdated: Date.now(),
      };
      notifySubscribers();
    },
  },
};
