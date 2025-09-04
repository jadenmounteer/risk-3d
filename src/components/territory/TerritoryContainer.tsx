import React from "react";
import { TerritoryNode } from "./TerritoryNode";
import { TERRITORIES } from "../../constants/territories";
import { Territory } from "../../types/territory";

interface TerritoryContainerProps {
  onTerritoryClick?: (territoryId: string) => void;
}

/**
 * TerritoryContainer Component
 *
 * Manages and renders all territory nodes in the game.
 * This component will later handle:
 * - Territory selection
 * - Territory state management
 * - Game rules enforcement
 */
export const TerritoryContainer: React.FC<TerritoryContainerProps> = ({
  onTerritoryClick,
}) => {
  return (
    <>
      {TERRITORIES.map((territory) => (
        <TerritoryNode
          key={territory.id}
          territory={territory}
          onTerritoryClick={onTerritoryClick}
        />
      ))}
    </>
  );
};
