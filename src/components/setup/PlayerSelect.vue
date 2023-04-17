<script setup lang="ts">
import { nextTick, ref, computed, onMounted, reactive, watch } from 'vue';
import type Player from '../../types/player';
import type Character from '@/types/character';
import CharacterWindow from '../CharacterWindow.vue';
import Game from '@/core/game';


const props = defineProps<{
    player: Player|null
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
    <div  :style="{backgroundColor: player?.playerClass?.color || 'false'}">
        <h1 class="player-name game-font">{{ player?.name }}</h1>
    </div>
    <slot :player="player"></slot>
    <CharacterWindow style="margin-top: 10px;" v-if="tempCharacter" :hide-name="true" :casting-skill="null" :casting=false :character="tempCharacter" />
    <button v-if="!player" class="btn btn-lg btn-primary btn-block game-font" @click="addCPU">
        ADD CHAR
    </button>
   </div>
</template>

<style>
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

}
</style>
