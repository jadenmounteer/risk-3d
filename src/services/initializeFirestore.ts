import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { TERRITORIES } from "../constants/territories";

export const initializeFirestore = async () => {
  // Initialize the game document
  const gameRef = doc(db, "games", "current_game");
  await setDoc(
    gameRef,
    {
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
    },
    { merge: true }
  ); // Use merge to avoid overwriting if document exists
};
