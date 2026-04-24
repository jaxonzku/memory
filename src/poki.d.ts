declare namespace PokiSDK {
  function init(): Promise<void>;
  function gameLoadingFinished(): void;
  function gameplayStart(): void;
  function gameplayStop(): void;
  function commercialBreak(): Promise<void>;
  function rewardedBreak(): Promise<boolean>;
}

interface Window {
  PokiSDK: typeof PokiSDK;
}
