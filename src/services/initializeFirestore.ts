import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { TERRITORIES } from "../constants/territories";

export const initializeFirestore = async () => {
  try {
    // Check if game document exists first
    const gameRef = doc(db, "games", "current_game");
    const gameDoc = await getDoc(gameRef);

    // Only initialize if document doesn't exist
    if (!gameDoc.exists()) {
      console.log("Initializing game state...");
      await setDoc(gameRef, {
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
      });
      console.log("Game state initialized successfully");
    } else {
      console.log("Game state already exists");
    }
  } catch (error) {
    console.error("Error initializing game state:", error);
    throw error;
  }
};
