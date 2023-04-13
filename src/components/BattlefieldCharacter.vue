<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type Character from '../types/character';
import type Skill from '../types/skill';
import Healthbar from "./character/Healthbar.vue";
import Energybar from "./character/Energybar.vue";
import Classbar from "./character/Classbar.vue";
import { defineEmits } from 'vue'
import Castbar from './character/Castbar.vue';
import Enemy from '@/types/enemy';
import SavingGrace from '@/types/buffs/saving-grace';
import { TargetType } from '../types/skill';
import type OnDamageTrigger from '@/types/triggers/on-damage-trigger';
import FloatingDamage from './FloatingDamage.vue';
import GameSettings from '@/core/settings';
import CharacterWindow from './CharacterWindow.vue';
import Player from '@/types/player';

const props = defineProps<{
  character: Character,
  castingSkill: Skill|null,
  casting: boolean
}>()

const emit = defineEmits(['start-cast', 'cast-at-all-enemies'])
const hasSavingGrace = computed(() => props.character.buffs.hasBuff(SavingGrace))
const isEnemy = props.character instanceof Enemy

let color = 'black';

if (props.character instanceof Player) {
  color = props.character.playerColor
}

function startCast(skill: Skill) {
  if (skill.targetType == TargetType.TARGET_NONE) {
    skill.cast(props.character, () => [])
  } else if (skill.targetType == TargetType.TARGET_ALL_ENEMIES) {
    emit('cast-at-all-enemies', skill)
  } else {
    emit('start-cast', skill)
  }
}

</script>

<template>
  <div class="char-wrapper">
      <CharacterWindow :character="character" :color="color" :class="{'casting-skill': castingSkill != null, 'saving-graced': hasSavingGrace}"></CharacterWindow>
      <Healthbar :health-bar="character.healthBar" :saving-grace="hasSavingGrace"></Healthbar>
      <Energybar  :energy-bar="character.energyBar"></Energybar>
      <Classbar v-if="character.classBar" :class-bar="character.classBar"></Classbar>
      <div v-if="!isEnemy" class="char-spell-list">
    <div
      class="spell-item"
      v-for="skill in character.skills"
      :class="{'selected': skill == castingSkill}"
      :style="{ background: skill.canCast(character) ? '' : 'gray' }"
      @click="() => startCast(skill)"
      >
      <span style="float: left; padding-left: 2px">{{ skill.energyCost }}</span>
      <div class="energy-icon-wrapper float-left">
        <img src="/src/assets/energy-icon.png">
      </div>
        {{ skill.name }}
    <span style="float: right" v-if="skill.onCooldown">
    ({{ (skill.cooldown - skill.onCooldownTimer) / 1000 }})
  </span>
  </div>
  </div>
  <Castbar  :character="character"></Castbar>
  </div>

</template>

<style scoped>
.char-spell-list {
  background: white;
  color: black;
}


.char-wrapper {
  margin-left: 15px;
}


.energy-icon-wrapper {
  display: flex;
  justify-content: center;
  width: 16px;
  height: 20px;
  float: left;
  padding-top: 6px;
}

.spell-item:not(.selected):hover {
  background: lightblue;
  cursor: pointer;
}

.spell-item.selected {
  background: #A4ECFE;
}

</style>