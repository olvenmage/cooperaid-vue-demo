<script setup lang="ts">
import Game from '@/core/game';
import PlayerCharacter from './PlayerCharacter.vue';

const players = Game.players

</script>

<template>
  <section class="shop">
    <img class="background" src="/src/assets/shop-background.png">
    <div class="player-box">
<PlayerCharacter
      v-for="player in players"
      :key="player.id"
      :player="player"
      :casting-skill="null"
    >
   </PlayerCharacter>
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