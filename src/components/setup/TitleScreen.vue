<script setup lang="ts">
import Game from '@/core/game';
import { GameState } from '@/core/game';

function toLobby() {
  Game.setState(GameState.IN_LOBBY)
}
</script>
<template>
  <div class="root-div">
    <div class="title-screen-buttons">
      <button class="btn btn-primary btn-lg btn-block" @click="toLobby">PLAY</button>
    </div>
  </div>
</template>

<style scoped> 
.play-button {

}

.title-screen-buttons {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 15vw;
  height: 10vh;
}

.root-div {
  width: 100vw;
  height: 100vh;
  background: url("/src/assets/title-screen.png");
  background-repeat: no-repeat;
  background-size: 100vw 100vh;
}
</style>