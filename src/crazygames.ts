type CrazyGamesSdkRuntime = {
  environment: "local" | "crazygames" | "disabled";
  init(): Promise<void>;
  ad: {
    requestAd(
      type: "midgame" | "rewarded",
      callbacks?: {
        adStarted?: () => void;
        adError?: (error: unknown) => void;
        adFinished?: () => void;
      },
    ): void;
  };
  game: {
    loadingStart(): Promise<void> | void;
    loadingStop(): Promise<void> | void;
    gameplayStart(): Promise<void> | void;
    gameplayStop(): Promise<void> | void;
  };
};

let sdkInitialized = false;

function getSdk() {
  const crazyGamesWindow = window as Window & {
    CrazyGames?: { SDK: CrazyGamesSdkRuntime };
  };
  return crazyGamesWindow.CrazyGames?.SDK;
}

function isSupportedEnvironment() {
  const sdk = getSdk();
  return Boolean(sdk && sdk.environment !== "disabled");
}

export async function initCrazyGamesSdk() {
  const sdk = getSdk();
  if (!sdk || !isSupportedEnvironment()) return false;

  try {
    await sdk.init();
    sdkInitialized = true;
    await sdk.game.loadingStart();
    return true;
  } catch (error) {
    console.warn("CrazyGames SDK init failed", error);
    return false;
  }
}

export async function crazyGamesLoadingStop() {
  const sdk = getSdk();
  if (!sdk || !sdkInitialized) return;

  try {
    await sdk.game.loadingStop();
  } catch (error) {
    console.warn("CrazyGames loadingStop failed", error);
  }
}

export function crazyGamesGameplayStart() {
  const sdk = getSdk();
  if (!sdk || !sdkInitialized) return;

  void Promise.resolve(sdk.game.gameplayStart()).catch((error: unknown) => {
    console.warn("CrazyGames gameplayStart failed", error);
  });
}

export function crazyGamesGameplayStop() {
  const sdk = getSdk();
  if (!sdk || !sdkInitialized) return;

  void Promise.resolve(sdk.game.gameplayStop()).catch((error: unknown) => {
    console.warn("CrazyGames gameplayStop failed", error);
  });
}

export function requestCrazyGamesAd(type: "midgame" | "rewarded") {
  const sdk = getSdk();
  if (!sdk || !sdkInitialized) return Promise.resolve(false);

  return new Promise<boolean>((resolve) => {
    try {
      sdk.ad.requestAd(type, {
        adFinished: () => resolve(true),
        adError: (error: unknown) => {
          console.warn(`CrazyGames ${type} ad failed`, error);
          resolve(false);
        },
      });
    } catch (error) {
      console.warn(`CrazyGames ${type} ad request threw`, error);
      resolve(false);
    }
  });
}
