import React, { createContext, useContext, useEffect, useState } from "react";
import { GameService, GameState } from "../types/game";
import { firebaseGameService } from "../services/firebaseGameService";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { TERRITORIES } from "../constants/territories";

interface GameContextType {
  gameService: GameService;
  gameState: GameState | null;
  isLoading: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: React.ReactNode;
}

// Default game state that everyone sees
const DEFAULT_GAME_STATE: GameState = {
  id: "current_game",
  currentTurnPlayerId: "",
  phase: "SETUP",
  players: [],
  territories: Object.fromEntries(
    TERRITORIES.map((territory) => [
      territory.id,
      { ...territory, troops: 0, teamId: "unoccupied" },
    ])
  ),
  lastUpdated: Date.now(),
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to game state changes
  useEffect(() => {
    const gameRef = doc(db, "games", "current_game");

    // First, ensure the document exists with default state
    setDoc(gameRef, DEFAULT_GAME_STATE, { merge: true })
      .then(() => {
        // Then subscribe to changes
        const unsubscribe = onSnapshot(
          gameRef,
          (doc) => {
            if (doc.exists()) {
              setGameState(doc.data() as GameState);
            }
            setIsLoading(false);
            setError(null);
          },
          (error) => {
            console.error("Error subscribing to game state:", error);
            setError(error as Error);
            setIsLoading(false);
          }
        );

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error ensuring default game state:", error);
        setError(error as Error);
        setIsLoading(false);
      });
  }, []);

  const value = {
    gameService: firebaseGameService,
    gameState,
    isLoading,
    error,
    setError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
