<script src="./SceneView.js" />

<div id="scene-container" bind:this={container} />
<span id="round-marker">{text}</span>

<style lang="scss">
  #scene-container {
    height: 100%;
  }

  #round-marker {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 1rem 1.7rem;
    font-size: 1.3rem;
  }
</style>
