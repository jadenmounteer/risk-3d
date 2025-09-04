import React from "react";
import { TerritoryNode } from "./TerritoryNode";
import { useGame } from "../../contexts/GameContext";

/**
 * TerritoryContainer Component
 *
 * Manages and renders all territory nodes in the game.
 * Uses game context to:
 * - Render territories based on current game state
 * - Handle territory interactions
 * - Enforce game rules
 */
export const TerritoryContainer: React.FC = () => {
  const { gameState, gameService, isLoading } = useGame();

  if (isLoading || !gameState) {
    return null; // Or render a loading state
  }

  const handleTerritoryClick = async (territoryId: string) => {
    if (!gameState) return;

    switch (gameState.phase) {
      case "SETUP":
        // During setup, claim unoccupied territories
        if (gameState.territories[territoryId].teamId === "unoccupied") {
          await gameService.claimTerritory(
            territoryId,
            gameState.currentTurnPlayerId
          );
        }
        break;
      case "DEPLOY":
        // During deploy phase, add troops to owned territories
        if (
          gameState.territories[territoryId].teamId ===
          gameState.players.find((p) => p.id === gameState.currentTurnPlayerId)
            ?.teamId
        ) {
          await gameService.placeTroops(territoryId, 1);
        }
        break;
      // Add other phases later (ATTACK, FORTIFY)
    }
  };

  return (
    <>
      {Object.values(gameState.territories).map((territory) => (
        <TerritoryNode
          key={territory.id}
          territory={territory}
          isCurrentPlayer={
            gameState.players.find(
              (p) => p.id === gameState.currentTurnPlayerId
            )?.teamId === territory.teamId
          }
          onTerritoryClick={handleTerritoryClick}
        />
      ))}
    </>
  );
};
