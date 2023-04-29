<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type Character from '../types/character';
import type Skill from '../types/skill';
import Healthbar from "./character/Healthbar.vue";
import Energybar from "./character/Energybar.vue";
import Classbar from "./character/Classbar.vue";
import { defineEmits } from 'vue'
import Castbar from './character/Castbar.vue';
import SavingGrace from '@/types/buffs/saving-grace';
import CharacterWindow from './CharacterWindow.vue';
import BuffDisplay from './character/BuffDisplay.vue';

const props = defineProps<{
  character: Character,
  castingSkill: Skill|null,
  casting: boolean
}>()

const emit = defineEmits(['start-cast', 'cast-at-all-enemies', 'cast-at-all-friendlies'])
const hasSavingGrace = computed(() => props.character?.buffs?.hasBuff(SavingGrace))
const isEnemy = !props.character.isFriendly

let color = props.character.identity.color

function startCast(skill: Skill) {
  // TARGET_NONE
  if (skill.skillData.targetType == 2) {
    skill.cast(props.character, () => [])
    // TARGET_SELF
  } else if (skill.skillData.targetType == 3) {
    const self = props.character
    skill.cast(props.character, () => [self])
    // TARGET_ALL_ENEMIES
  } else if (skill.skillData.targetType == 5) {
    emit('cast-at-all-enemies', skill)
    // TARGET_ALL_FRIENDLIES
  } else if (skill.skillData.targetType == 6) {
    emit('cast-at-all-friendlies', skill)
  } else {
    emit('start-cast', skill)
  }
}

</script>

<template>
  <div class="char-wrapper" v-if="character">
      <CharacterWindow :character="character" :color="color" :class="{'casting-skill': castingSkill != null, 'saving-graced': hasSavingGrace}"></CharacterWindow>
      <Healthbar :pulses="!isEnemy" :health-bar="character.healthBar" :saving-grace="hasSavingGrace"></Healthbar>
      <Energybar v-if="character.isFriendly"  :energy-bar="character.energyBar"></Energybar>
      <Classbar v-if="character.classBar" :class-bar="character.classBar"></Classbar>
    <Castbar  :character="character"></Castbar>
      <BuffDisplay :character="character"> </BuffDisplay>
      <div class="char-spell-list">
    <div
      class="spell-item"
      v-for="skill in character.skills"
      :class="{'selected': skill == castingSkill}"
      :style="{ background: skill.canCast(character) ? '' : 'gray' }"
      @click="() => startCast(skill)"
      >
      <span style="float: left; padding-left: 2px">{{ skill.skillData.energyCost }}</span>
      <div class="energy-icon-wrapper float-left">
        <img src="/src/assets/icons/energy-icon.png">
      </div>
        {{ skill.skillData.name }}
    <span style="float: right" v-if="skill.onCooldown">
    ({{ skill.cooldownDisplay }})
  </span>
  </div>
  </div>
  </div>

</template>

<style scoped>
.char-spell-list {
  background: white;
  color: black;
}


.energy-icon-wrapper {
  display: flex;
  justify-content: center;
  width: 16px;
  height: 20px;
  float: left;
  padding-top: 6px;
}

.spell-item {
  font-size: 16px;
  padding: 2px;
}

.spell-item:not(.selected):hover {
  background: lightblue;
  cursor: pointer;
}

.spell-item.selected {
  background: #A4ECFE;
}

</style>