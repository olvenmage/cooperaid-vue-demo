<script setup lang="ts">
defineProps<{
  gold: number
}>()
</script>

<template>
  <div class="gold-wrapper">
    <img class="gold-icon" src="/src/assets/sprites/resources/gold.png" alt="">
    <span style="font-size: 24px; ">{{ gold }}</span>
    <slot></slot>
  </div>
</template>



<style scoped>

.gold-icon {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.gold-wrapper {
  display: flex;
  justify-content: center;
  align-items: center; /* align vertical */
}
</style>