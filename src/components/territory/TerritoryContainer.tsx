import React from "react";
import { TerritoryNode } from "./TerritoryNode";
import { useGame } from "../../contexts/GameContext";

export const TerritoryContainer: React.FC = () => {
  const { gameState, gameService, isLoading } = useGame();

  if (isLoading || !gameState) {
    return null;
  }

  const handleTerritoryClick = async (territoryId: string) => {
    // Only handle clicks if user is admin
    if (!gameService.isAdmin()) return;

    switch (gameState.phase) {
      case "SETUP":
        if (gameState.territories[territoryId].teamId === "unoccupied") {
          await gameService.claimTerritory(
            territoryId,
            gameState.currentTurnPlayerId
          );
        }
        break;
      case "DEPLOY":
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
