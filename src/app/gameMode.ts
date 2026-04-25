export type GameMode = "two-player" | "single-player";

let currentGameMode: GameMode = "two-player";

export function setGameMode(mode: GameMode) {
  currentGameMode = mode;
}

export function getGameMode(): GameMode {
  return currentGameMode;
}

export function isSinglePlayerMode() {
  return currentGameMode === "single-player";
}
