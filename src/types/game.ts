import { Territory, TeamId } from "./territory";

export interface Player {
  id: string;
  name: string;
  teamId: TeamId;
}

export interface GameState {
  id: string;
  currentTurnPlayerId: string;
  phase: "SETUP" | "DEPLOY" | "ATTACK" | "FORTIFY" | "GAME_OVER";
  players: Player[];
  territories: Record<string, Territory>;
  winner?: string;
}

export interface GameService {
  // Game setup
  createGame: (players: Player[]) => Promise<string>; // Returns game ID
  joinGame: (gameId: string, player: Player) => Promise<void>;

  // Game state
  getGameState: (gameId: string) => Promise<GameState>;
  subscribeToGameState: (
    gameId: string,
    callback: (state: GameState) => void
  ) => () => void;

  // Game actions
  claimTerritory: (
    gameId: string,
    territoryId: string,
    playerId: string
  ) => Promise<void>;
  placeTroops: (
    gameId: string,
    territoryId: string,
    troops: number
  ) => Promise<void>;
  attack: (
    gameId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => Promise<void>;
  fortify: (
    gameId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => Promise<void>;
  endTurn: (gameId: string) => Promise<void>;
}
