<script lang="ts" setup>
import type Character from '@/types/character';

const props = defineProps<{
    character: Character,
    width?: string,
    height?: string,
}>()

const styles = {
  width: props.width || '100%',
  height: props.height || '85%'
}
</script>

<template>
  <div class="sprite-frame" :style="styles" >
    <div class="sprite-wrapper">
      <img class="sprite" :class="{ 'sprite-dead': character.dead }"  :src="`/src/assets/sprites${character.identity.imagePath}`" style="margin: auto">
      <img class="cross-image" src="/src/assets/sprites/effects/dead-effect.png" v-if="character.dead">
      <img class="stunned-image" src="/src/assets/sprites/effects/stunned-effect.png" v-if="character.stats.stunned">
      <img class="flight-image" src="/src/assets/sprites/effects/flying.png" v-if="character.stats.flying">
    </div>
  <slot></slot>
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

.flight-image {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.9;
  z-index: -1;
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
  width: 100%;
  height: 100%;
  margin: auto;
  object-fit: contain;
}

</style>
