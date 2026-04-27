import { SceneManager } from './utils/SceneManager.js';
import { TypingScene } from './scenes/TypingScene.js';
import { VideoScene } from './scenes/VideoScene.js';
import { TextScene } from './scenes/TextScene.js';

const sceneManager = new SceneManager();

async function initializeNarrative() {
  // Create scene instances
  // TypingScene and TextScene are DOM-based animations
  // VideoScene is Three.js 3D environment
  const typingScene = new TypingScene(sceneManager);
  const videoScene = new VideoScene();
  const textScene = new TextScene();

  // Register scenes in manager
  sceneManager.registerScene('typing', typingScene);
  sceneManager.registerScene('video', videoScene);
  sceneManager.registerScene('text', textScene);

  // Start with typing scene for debugging
  await sceneManager.transitionTo('typing');

  // Start main animation loop that handles all scenes
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Update current scene (handles both DOM and Three.js scenes)
  // Check for scene transitions
  // Render current scene
}

// Initialize on page load
initializeNarrative().catch(console.error);
