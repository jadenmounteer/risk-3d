import { Territory, TeamId } from "./territory";

export interface Player {
  id: string;
  name: string;
  teamId: TeamId;
  bonusTroops: number; // Accumulated from sprint performance
}

export interface GameState {
  id: string;
  currentTurnPlayerId: string;
  phase: "SETUP" | "DEPLOY" | "ATTACK" | "FORTIFY" | "GAME_OVER";
  players: Player[];
  territories: Record<string, Territory>;
  winner?: string;
  lastUpdated: number; // Timestamp for tracking changes
}

// Admin-specific actions
export interface AdminActions {
  // Player management
  addPlayer: (name: string, teamId: TeamId) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;

  // Sprint bonus management
  addBonusTroops: (playerId: string, amount: number) => Promise<void>;

  // Game control
  startNewGame: () => Promise<void>;
  setGamePhase: (phase: GameState["phase"]) => Promise<void>;
  resetGame: () => Promise<void>;
}

export interface GameService {
  // Admin authentication
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  isAdmin: () => boolean;

  // Game state
  getGameState: () => Promise<GameState>;
  subscribeToGameState: (callback: (state: GameState) => void) => () => void;

  // Game actions (only available to admin)
  claimTerritory: (territoryId: string, playerId: string) => Promise<void>;
  placeTroops: (territoryId: string, troops: number) => Promise<void>;
  attack: (
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => Promise<void>;
  fortify: (
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => Promise<void>;
  endTurn: () => Promise<void>;

  // Admin actions
  admin?: AdminActions;
}
