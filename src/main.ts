import { setEngine } from "./app/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { StartScreen } from "./app/screens/StartScreen";
import { AppColors, selectThemeFromString } from "./app/theme/colors";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Optional runtime theme switch: ?theme=neonArena
  selectThemeFromString(
    new URLSearchParams(window.location.search).get("theme"),
  );

  // Initialize the creation engine instance
  await engine.init({
    background: AppColors.appBackground,
    resizeOptions: { minWidth: 768, minHeight: 1024, letterbox: false },
  });

  // Initialize the user settings
  userSettings.init();

  // Show the load screen
  await engine.navigation.showScreen(LoadScreen);

  // Show the start screen once loading is complete
  await engine.navigation.showScreen(StartScreen);

  // Signal that loading is finished
  if (typeof PokiSDK !== "undefined") {
    PokiSDK.gameLoadingFinished();
  }
})();
