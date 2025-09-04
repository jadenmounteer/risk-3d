import React, { useState } from "react";
import { useGame } from "../../contexts/GameContext";
import { TeamId } from "../../types/territory";
import { TEAM_COLORS } from "../../types/territory";
import "./AdminPanel.css";

export const AdminPanel: React.FC = () => {
  const { gameService, gameState } = useGame();
  const [isExpanded, setIsExpanded] = useState(false);
  const [password, setPassword] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<TeamId>("red");
  const [bonusTroops, setBonusTroops] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await gameService.loginAdmin(password);
      setPassword(""); // Clear password after successful login
      setIsExpanded(true); // Expand panel on successful login
    } catch (error) {
      setLoginError("Invalid password");
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicks

    try {
      setIsLoggingOut(true);
      await gameService.logoutAdmin();
      setIsExpanded(false); // Collapse panel on logout
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameService.admin) return;

    try {
      await gameService.admin.addPlayer(newPlayerName, selectedTeam);
      setNewPlayerName("");
    } catch (error) {
      console.error("Failed to add player:", error);
    }
  };

  const handleAddBonusTroops = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameService.admin || !selectedPlayer) return;

    try {
      await gameService.admin.addBonusTroops(selectedPlayer, bonusTroops);
      setBonusTroops(0);
    } catch (error) {
      console.error("Failed to add bonus troops:", error);
    }
  };

  return (
    <div className="admin-panel-container">
      <button
        className={`admin-toggle ${isExpanded ? "expanded" : ""}`}
        onClick={() => !isLoggingOut && setIsExpanded(!isExpanded)}
      >
        ▼
      </button>

      <div className={`admin-panel ${isExpanded ? "expanded" : ""}`}>
        {!gameService.isAdmin() ? (
          <div className="admin-login">
            <h2>Admin Access</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className={loginError ? "error" : ""}
              />
              {loginError && <div className="error-message">{loginError}</div>}
              <button type="submit">Login</button>
            </form>
          </div>
        ) : (
          <>
            <h2>Game Control Panel</h2>

            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer}>
              <h3>Add New Player</h3>
              <input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Player Name"
              />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value as TeamId)}
              >
                {Object.entries(TEAM_COLORS)
                  .filter(([id]) => id !== "unoccupied")
                  .map(([id, color]) => (
                    <option key={id} value={id}>
                      {id.charAt(0).toUpperCase() + id.slice(1)} Team
                    </option>
                  ))}
              </select>
              <button type="submit">Add Player</button>
            </form>

            {/* Add Bonus Troops Form */}
            <form onSubmit={handleAddBonusTroops}>
              <h3>Add Sprint Bonus Troops</h3>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                <option value="">Select Player</option>
                {gameState?.players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={bonusTroops}
                onChange={(e) => setBonusTroops(parseInt(e.target.value) || 0)}
                placeholder="Number of Troops"
              />
              <button type="submit">Add Bonus Troops</button>
            </form>

            {/* Game Controls */}
            <div className="game-controls">
              <h3>Game Controls</h3>
              <button
                onClick={() => gameService.admin?.startNewGame()}
                disabled={!gameService.admin || isLoggingOut}
              >
                Start New Game
              </button>
              <button
                onClick={() => gameService.admin?.resetGame()}
                disabled={!gameService.admin || isLoggingOut}
              >
                Reset Game
              </button>
              <button onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
