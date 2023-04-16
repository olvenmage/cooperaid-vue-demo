<script setup lang="ts">
import { nextTick, ref, computed, onMounted, reactive, watch } from 'vue';
import type Player from '../../types/player';
import type Character from '@/types/character';
import CharacterWindow from '../CharacterWindow.vue';


const props = defineProps<{
    player: Player
}>()

let tempCharacter = ref<Character|null>(null)

if (props.player.playerClass) {
    tempCharacter.value = props.player.combatCharacter || props.player.createCharacter()
}

let playerClass = computed(() => props.player.playerClass)

const isExternal = props.player.connectedExternally

watch(playerClass, () => {
    if (playerClass.value) {
        tempCharacter.value = props.player.createCharacter()
    } else {
        tempCharacter.value = null
    }
}) 


</script>
<template>
   <div>
    <div class="player-select" :style="{backgroundColor: player.playerClass?.color || 'false'}">
        <h1 class="player-name game-font">{{ player.name }}</h1>
    </div>
    <slot></slot>
    <CharacterWindow style="margin-top: 10px;" v-if="tempCharacter" :hide-name="true" :casting-skill="null" :casting=false :character="tempCharacter" />
   
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
