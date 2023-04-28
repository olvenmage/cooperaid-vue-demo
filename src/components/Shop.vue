<script setup lang="ts">
import Game from '@/core/game';
import type CharacterWindowVue from './CharacterWindow.vue';
import CharacterWindow from './CharacterWindow.vue';

const players = Game.players.value

</script>

<template>
  <section class="shop">
    <img class="background" src="/src/assets/shop-background.png">
    <div class="player-box">
  <CharacterWindow
      v-for="player in players"
      :key="player.id"
      :character="player"
      :casting-skill="null"
    >
   </CharacterWindow>
    </div>
   
   </section>
</template>

<style scoped>
.shop {
  position: relative;
  width: 1800px;
  height: 1000px
}

.shop .background {
  object-fit: fill;
  pointer-events: none;
  z-index: -1;
  max-width: 100%;
  height: 100%;
  width: 100%;
}

.player-box {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: start;
  left: 50px;
  top: 520px;
}

</style>