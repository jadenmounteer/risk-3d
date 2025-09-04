import React, { createContext, useContext, useEffect, useState } from "react";
import { GameService, GameState } from "../types/game";
import { firebaseGameService } from "../services/firebaseGameService";

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

  useEffect(() => {
    const unsubscribe = firebaseGameService.subscribeToGameState(
      (state: GameState) => {
        setGameState(state);
        setIsLoading(false);
      }
    );

    // Initialize game if it doesn't exist
    firebaseGameService.admin?.startNewGame().catch((error) => {
      console.error("Error initializing game:", error);
      setError(error);
    });

    return () => unsubscribe();
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
