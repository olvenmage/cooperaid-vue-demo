<script setup lang="ts">
import { nextTick, ref, computed, onMounted, reactive, watch } from 'vue';
import type Player from '../../types/player';
import type Character from '@/types/character';
import CharacterWindow from '../CharacterWindow.vue';
import Game from '@/core/game';
import Healthbar from '../character/Healthbar.vue';


const props = defineProps<{
    player: Player|null,
    showHealth?: boolean
}>()

let tempCharacter = ref<Character|null>(null)

if (props.player?.playerClass) {
    tempCharacter.value = props.player.combatCharacter || props.player.createCharacter()
}

let playerClass = computed(() => props.player?.playerClass)

watch(playerClass, () => {
    if (props.player && playerClass.value) {
        tempCharacter.value = props.player.createCharacter()
    } else {
        tempCharacter.value = null
    }
}) 

function addCPU() {
  Game.addCPU()
}

</script>
<template>
   <div class="player-select">
    <div :style="{backgroundColor: player?.playerClass?.color || 'false'}">
        <h1 class="player-name game-font">{{ player?.name }}</h1>
    </div>
    <slot :player="player"></slot>
    <Healthbar v-if="showHealth && tempCharacter" :health-bar="tempCharacter.healthBar" :saving-grace="false" ></Healthbar>
    <CharacterWindow style="margin-top: 10px; height: 100%;" v-if="tempCharacter" :hide-name="true" :casting-skill="null" :casting=false :character="tempCharacter" />
    <div v-if="!player" class="add-button-wrapper">
        <button class="add-character-button btn btn-lg btn-primary btn-block game-font" @click="addCPU">
        +
    </button>
    </div>
   
   </div>
</template>

<style scoped>
.player-select {
    padding: 10px;
    text-align: center;
}

.char-window {
    height: 220px;
}

.player-name {
    color: white;
    -webkit-text-stroke-width: 2px;
    -webkit-text-stroke-color: black;
    font-size: 40px;
    margin-top: 0px;
    margin-bottom: 0px;
}

.add-character-button {
    font-size: 30px;
}

.add-button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}
</style>
