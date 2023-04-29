<script setup lang="ts">
import { computed } from 'vue';
import Game from '@/core/game';

import PlayerSelect from './setup/PlayerSelect.vue';
import GameTitle from './GameTitle.vue';

const players = computed(() => Game.players.value)

const canContinue = true

function nextEncounter(): void {
    Game.nextEncounter()
}


</script>
<template>
  <img src="src/assets/menu-background.png" class="menu-background">
  <div class="">
    <div class="title-wrapper">
      <GameTitle style="width: 80vw; max-width: 1000px; height: 12vh"></GameTitle>
    </div>
    <div class="title-wrapper">
      <h3 class="game-font" style="color: white;">
        Selecting Rewards...
      </h3>
    </div>
    <div class="player-container" style="height: 70vh">
      <template v-for="player of players">
        <div style="height: 100%">
          <PlayerSelect class="player-select" :show-health="true" :player="player" :key="`player-select-${player?.id}`">
          </PlayerSelect>
          
        </div>
       
       
      </template>
   
    </div>
    <button class="btn btn-lg btn-primary btn-block game-font" :disabled="!canContinue" @click="nextEncounter">
        CONTINUE
    </button>
  </div>
</template>

<style scoped> 

.menu-background {
  position: absolute;
  width: 100vw;
  height: 100vh;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-select {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 247, 0.2)
}

.player-container {
  display: flex;
  flex-basis: 0;
  gap: 5%;
  margin-bottom: 5px;
  margin: 15px;
}
</style>