import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, ensureAnonymousAuth, setAdminSession } from "./firebase";
import { GameService, GameState, Player } from "../types/game";
import { TeamId } from "../types/territory";
import { TERRITORIES } from "../constants/territories";

// Constants
const GAME_DOC_ID = "current_game"; // Since we only have one game
const ADMIN_DOC_ID = "admin_config";
const ADMIN_PASSWORD_HASH =
  "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; // This is 'admin' hashed

// Helper function to hash password
const hashPassword = async (password: string) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

let isAdminLoggedIn = false;

export const firebaseGameService: GameService = {
  // Admin authentication
  loginAdmin: async (password: string) => {
    const hashedPassword = await hashPassword(password);
    if (hashedPassword === ADMIN_PASSWORD_HASH) {
      await setAdminSession(true);
      isAdminLoggedIn = true;
    } else {
      throw new Error("Invalid password");
    }
  },

  logoutAdmin: async () => {
    await setAdminSession(false);
    isAdminLoggedIn = false;
  },

  isAdmin: () => isAdminLoggedIn,

  // Game state
  getGameState: async () => {
    await ensureAnonymousAuth();
    const gameDoc = await getDoc(doc(db, "games", GAME_DOC_ID));
    return gameDoc.data() as GameState;
  },

  subscribeToGameState: (callback: (state: GameState) => void) => {
    const unsubscribe = onSnapshot(
      doc(db, "games", GAME_DOC_ID),
      (doc) => {
        callback(doc.data() as GameState);
      },
      (error) => {
        console.error("Error subscribing to game state:", error);
      }
    );
    return unsubscribe;
  },

  // Game actions
  claimTerritory: async (territoryId: string, playerId: string) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    await ensureAnonymousAuth();

    const gameRef = doc(db, "games", GAME_DOC_ID);
    const gameDoc = await getDoc(gameRef);
    const gameState = gameDoc.data() as GameState;

    const player = gameState.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");

    await updateDoc(gameRef, {
      [`territories.${territoryId}`]: {
        ...gameState.territories[territoryId],
        teamId: player.teamId,
        troops: 1,
      },
      lastUpdated: Date.now(),
    });
  },

  placeTroops: async (territoryId: string, troops: number) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    await ensureAnonymousAuth();

    const gameRef = doc(db, "games", GAME_DOC_ID);
    const gameDoc = await getDoc(gameRef);
    const gameState = gameDoc.data() as GameState;

    await updateDoc(gameRef, {
      [`territories.${territoryId}.troops`]:
        gameState.territories[territoryId].troops + troops,
      lastUpdated: Date.now(),
    });
  },

  attack: async (
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    await ensureAnonymousAuth();

    const gameRef = doc(db, "games", GAME_DOC_ID);
    const gameDoc = await getDoc(gameRef);
    const gameState = gameDoc.data() as GameState;

    const fromTerritory = gameState.territories[fromTerritoryId];

    await updateDoc(gameRef, {
      [`territories.${fromTerritoryId}.troops`]: fromTerritory.troops - troops,
      [`territories.${toTerritoryId}`]: {
        ...gameState.territories[toTerritoryId],
        teamId: fromTerritory.teamId,
        troops,
      },
      lastUpdated: Date.now(),
    });
  },

  fortify: async (
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number
  ) => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    await ensureAnonymousAuth();

    const gameRef = doc(db, "games", GAME_DOC_ID);
    const gameDoc = await getDoc(gameRef);
    const gameState = gameDoc.data() as GameState;

    await updateDoc(gameRef, {
      [`territories.${fromTerritoryId}.troops`]:
        gameState.territories[fromTerritoryId].troops - troops,
      [`territories.${toTerritoryId}.troops`]:
        gameState.territories[toTerritoryId].troops + troops,
      lastUpdated: Date.now(),
    });
  },

  endTurn: async () => {
    if (!isAdminLoggedIn) throw new Error("Admin only action");
    await ensureAnonymousAuth();

    const gameRef = doc(db, "games", GAME_DOC_ID);
    const gameDoc = await getDoc(gameRef);
    const gameState = gameDoc.data() as GameState;

    const currentPlayerIndex = gameState.players.findIndex(
      (p) => p.id === gameState.currentTurnPlayerId
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;

    await updateDoc(gameRef, {
      currentTurnPlayerId: gameState.players[nextPlayerIndex].id,
      lastUpdated: Date.now(),
    });
  },

  // Admin actions
  admin: {
    addPlayer: async (name: string, teamId: TeamId) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      await ensureAnonymousAuth();

      const gameRef = doc(db, "games", GAME_DOC_ID);
      const gameDoc = await getDoc(gameRef);
      const gameState = gameDoc.data() as GameState;

      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name,
        teamId,
        bonusTroops: 0,
      };

      await updateDoc(gameRef, {
        players: [...gameState.players, newPlayer],
        currentTurnPlayerId: gameState.currentTurnPlayerId || newPlayer.id,
        lastUpdated: Date.now(),
      });
    },

    removePlayer: async (playerId: string) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      await ensureAnonymousAuth();

      const gameRef = doc(db, "games", GAME_DOC_ID);
      const gameDoc = await getDoc(gameRef);
      const gameState = gameDoc.data() as GameState;

      await updateDoc(gameRef, {
        players: gameState.players.filter((p) => p.id !== playerId),
        lastUpdated: Date.now(),
      });
    },

    addBonusTroops: async (playerId: string, amount: number) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      await ensureAnonymousAuth();

      const gameRef = doc(db, "games", GAME_DOC_ID);
      const gameDoc = await getDoc(gameRef);
      const gameState = gameDoc.data() as GameState;

      const playerIndex = gameState.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) throw new Error("Player not found");

      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        bonusTroops: updatedPlayers[playerIndex].bonusTroops + amount,
      };

      await updateDoc(gameRef, {
        players: updatedPlayers,
        lastUpdated: Date.now(),
      });
    },

    startNewGame: async () => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      await ensureAnonymousAuth();

      const gameRef = doc(db, "games", GAME_DOC_ID);
      const gameDoc = await getDoc(gameRef);
      const currentState = gameDoc.data() as GameState;

      await setDoc(gameRef, {
        id: GAME_DOC_ID,
        currentTurnPlayerId: currentState?.players[0]?.id || "",
        phase: "SETUP",
        players: currentState?.players || [],
        territories: Object.fromEntries(
          TERRITORIES.map((territory) => [
            territory.id,
            { ...territory, troops: 0, teamId: "unoccupied" },
          ])
        ),
        lastUpdated: Date.now(),
      });
    },

    setGamePhase: async (phase: GameState["phase"]) => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      await ensureAnonymousAuth();

      const gameRef = doc(db, "games", GAME_DOC_ID);
      await updateDoc(gameRef, {
        phase,
        lastUpdated: Date.now(),
      });
    },

    resetGame: async () => {
      if (!isAdminLoggedIn) throw new Error("Admin only action");
      await ensureAnonymousAuth();

      const gameRef = doc(db, "games", GAME_DOC_ID);
      await setDoc(gameRef, {
        id: GAME_DOC_ID,
        currentTurnPlayerId: "",
        phase: "SETUP",
        players: [],
        territories: Object.fromEntries(
          TERRITORIES.map((territory) => [territory.id, territory])
        ),
        lastUpdated: Date.now(),
      });
    },
  },
};
