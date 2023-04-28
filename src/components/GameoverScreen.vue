<script setup lang="ts">
</script>

<template>
  <img class="gameover-img" src="/src/assets/game-over.png" alt="">
</template>

<style scoped>
.gameover-img {
  object-fit: fill;
  pointer-events: none;
  position: absolute;
  z-index: -1;
  max-width: 100%;
  height: 100vh;
  width: 100vw; /* ie8 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>