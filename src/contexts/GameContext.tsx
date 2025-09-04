import React, { createContext, useContext, useEffect, useState } from "react";
import { GameService, GameState } from "../types/game";
import { firebaseGameService } from "../services/firebaseGameService";
import { initializeFirestore } from "../services/initializeFirestore";
import { ensureAnonymousAuth } from "../services/firebase";

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

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle authentication and initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        // Ensure we have anonymous authentication
        await ensureAnonymousAuth();
        // Initialize Firestore with initial game state
        await initializeFirestore();
        setIsInitialized(true);
      } catch (err) {
        console.error("Error during initialization:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to initialize")
        );
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Subscribe to game state once initialized
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = firebaseGameService.subscribeToGameState(
      (state: GameState) => {
        setGameState(state);
        setIsLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [isInitialized]);

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
