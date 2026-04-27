// Scene Manager handles transitions between different scene types (2D text and 3D video)

export class SceneManager {
  constructor() {
    this.currentScene = null;
    this.scenes = {};
    this.animationFrameId = null;
  }

  registerScene(sceneId, sceneInstance) {
    this.scenes[sceneId] = sceneInstance;
  }

  async transitionTo(sceneId) {
    if (this.currentScene) {
      await this.currentScene.cleanup();
    }
    this.currentScene = this.scenes[sceneId];
    await this.currentScene.init();
  }

  onSceneComplete() {
    // Called when current scene finishes
    // Determine next scene based on scene type
    // Transition to next scene
  }

  cleanup() {
    // Stop current scene animation/loop
    // Remove DOM elements or Three.js resources
    // Cancel animation frame
  }
}
