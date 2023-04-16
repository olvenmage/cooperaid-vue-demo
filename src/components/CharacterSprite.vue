<script lang="ts" setup>
import type Character from '@/types/character';

defineProps<{
    character: Character
}>()
</script>

<template>
  <div class="sprite-wrapper">
      <img class="sprite" :class="{ 'sprite-dead': character.dead }"  :src="`/src/assets/sprites${character.identity.imagePath}`" style="margin: auto">
      <img class="cross-image" src="/src/assets/sprites/effects/dead-effect.png" v-if="character.dead">
      <img class="stunned-image" src="/src/assets/sprites/effects/stunned-effect.png" v-if="character.stats.stunned">
  </div>
</template>

<style>
  .stat-wrapper {
    float: right
  }

.sprite-dead {
  opacity: 0.4;
  filter: alpha(opacity=40); /* msie */
}

.sprite-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  color: black;
  background-color: rgba(200, 200, 200, 0.5);
  border: 4px solid rgba(150, 150, 150, 0.5);
}

.stunned-image {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.7;
  z-index: 2;
  
  width: 100%;
  height: 100%;
}

.cross-image {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.5;
  
  width: 100%;
  height: 100%;
}

.sprite {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  object-fit: scale-down;
  max-width:100%;
  max-height:100%;
}

</style>
