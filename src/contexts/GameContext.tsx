import React, { createContext, useContext, useEffect, useState } from "react";
import { GameService, GameState } from "../types/game";
import { mockGameService } from "../services/mockGameService";

interface GameContextType {
  gameService: GameService;
  gameState: GameState | null;
  isLoading: boolean;
  error: Error | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: React.ReactNode;
  gameId: string;
}

export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  gameId,
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = mockGameService.subscribeToGameState(
      gameId,
      (state) => {
        setGameState(state);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  const value = {
    gameService: mockGameService,
    gameState,
    isLoading,
    error,
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
