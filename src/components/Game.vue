<script setup lang="ts">
import { ref } from 'vue'
import Battlefield from './Battlefield.vue'
  

import Game, { GameState } from '@/core/game';
import Shop from './Shop.vue'

import { CombatEncounter, ShopEncounter } from '@/core/encounter'
import GameoverScreen from './GameoverScreen.vue';

import Lobby from '@/components/setup/Lobby.vue';
import ChooseRewardScreen from './ChooseRewardScreen.vue';
import TitleScreen from './setup/TitleScreen.vue';
import VictoryScreen from './VictoryScreen.vue';

let state = ref(Game.state)

Game.onStateChanged(() => state.value = Game.state)
</script>

<template>
  <section style="width: 100%; height: 100%;">
    <TitleScreen v-if="state == GameState.TITLESCREEN"></TitleScreen>
    <VictoryScreen v-else-if="state == GameState.VICTORY"></VictoryScreen>
    <GameoverScreen v-else-if="state == GameState.GAME_OVER"></GameoverScreen>
    <Battlefield v-else-if="state == GameState.IN_COMBAT"></Battlefield>
    <Shop v-else-if="state == GameState.IN_SHOP"></Shop>
    <Lobby v-else-if="state == GameState.IN_LOBBY"></Lobby>
    <ChooseRewardScreen v-else-if="state == GameState.CHOOSING_REWARD"></ChooseRewardScreen>
    <div v-else>
      <h1> Cooperaid </h1>
    </div>
  </section>
</template>