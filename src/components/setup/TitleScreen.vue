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
      <div class="button-widths">
        <button class="btn btn-primary btn-lg btn-block" @click="toLobby">PLAY</button>
      </div>
    </div>
  </div>
</template>

<style scoped> 
.play-button {

}

.title-screen-buttons {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 60%;
  width: 100%;
  height: 10vh;
}

.button-widths {
  width: 15vw;
}


.root-div {
  width: 100vw;
  height: 100vh;
  background: url("/src/assets/title-screen-with-characters.png");
  background-repeat: no-repeat;
  background-size: 100vw 100vh;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>