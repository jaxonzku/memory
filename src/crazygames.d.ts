export {};

declare global {
  type CrazyGamesEnvironment = "local" | "crazygames" | "disabled";

  interface CrazyGamesAdCallbacks {
    adStarted?: () => void;
    adError?: (error: unknown) => void;
    adFinished?: () => void;
  }

  interface CrazyGamesSdk {
    environment: CrazyGamesEnvironment;
    init(): Promise<void>;
    ad: {
      requestAd(
        type: "midgame" | "rewarded",
        callbacks?: CrazyGamesAdCallbacks,
      ): void;
    };
    game: {
      loadingStart(): Promise<void> | void;
      loadingStop(): Promise<void> | void;
      gameplayStart(): Promise<void> | void;
      gameplayStop(): Promise<void> | void;
    };
  }

  interface Window {
    CrazyGames?: {
      SDK: CrazyGamesSdk;
    };
  }
}
