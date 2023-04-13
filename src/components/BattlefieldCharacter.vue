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

const props = defineProps<{
  character: Character,
  castingSkill: Skill|null
}>()

const emit = defineEmits(['start-cast', 'cast-at-all-enemies'])
const isEnemy = props.character instanceof Enemy
const hasSavingGrace = computed(() => props.character.buffs.hasBuff(SavingGrace))
const damageFloats = ref<OnDamageTrigger[]>([]);

onMounted(() => {
  props.character.identity.onDamageTakenTriggers.push(addDamageFloat)
})

onUnmounted(() => {
  const index =  props.character.identity.onDamageTakenTriggers.findIndex((item) => item == addDamageFloat)

  if (index != -1) {
    props.character.identity.onDamageTakenTriggers.splice(index, 1)
  }
})

function addDamageFloat(trigger: OnDamageTrigger) {
  if (trigger.actualDamage <= 0) {
    return 
  }

    damageFloats.value.push(trigger)
    setTimeout(() => {
        const index = damageFloats.value.findIndex((item) => item.id == trigger.id)

        if (index != -1) {
          damageFloats.value.splice(index, 1)
        }
    }, 1000 / GameSettings.speedFactor)
}

function startCast(skill: Skill) {
  if (skill.targetType == TargetType.TARGET_NONE) {
    skill.cast(props.character, [])
  } else if (skill.targetType == TargetType.TARGET_ALL_ENEMIES) {
    emit('cast-at-all-enemies', skill)
  } else {
    emit('start-cast', skill)
  }
}

</script>

<template>
  <div class="char-wrapper">
    <section>
      <span :style="{color: character.dead ? 'red' : 'unset'}">{{ character.identity.name }}</span>
      <div class="image-wrapper">
        <div class="damage-floats">
            <FloatingDamage v-for="damageFloat in damageFloats" :key="damageFloat.id" :damage="damageFloat"></FloatingDamage>
        </div>
        
        <img class="sprite" :class="{ 'sprite-dead': character.dead }" :src="character.identity.imagePath" style="margin: auto">
        <img class="cross-image" src="/src/assets/red-cross.png" v-if="character.dead">
        <div class="armor-wrapper">
          <img class="armor" width="16" height="16" src="/src/assets/magical-armor-symbol.png" alt="">
          <span style="font-size: 20px; margin-right: 8px">{{ character.stats.magicalArmor.value }}</span>
          <img class="armor" width="16" height="16" src="/src/assets/armor-symbol.png" alt="">
          <span style="font-size: 20px">{{ character.stats.armor.value }}</span>
        </div>
        
      </div>
      <Healthbar :health-bar="character.healthBar" :saving-grace="hasSavingGrace"></Healthbar>
      <Energybar  :energy-bar="character.energyBar"></Energybar>
      <Classbar v-if="character.classBar" :class-bar="character.classBar"></Classbar>
  </section>
  <div v-if="!isEnemy" class="char-spell-list">
    <div
      class="spell-item"
      v-for="skill in character.identity.skills"
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

.armor-wrapper {
  position: absolute;
  height: 16px;
  right: 0;
  bottom: 16px;
}

.char-wrapper .image-wrapper {
  width: 220px;
  height: 220px;
  display: flex;
  justify-content: center;
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

.spell-item:not(.selected):hover {
  background: lightblue;
  cursor: pointer;
}

.spell-item.selected {
  background: #A4ECFE;
}

.damage-floats {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 10px
}

.cross-image {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.5;
  
  width: 100%;
  height: 100%;
}

.char-wrapper:not(.casting-character):hover {
  border: 1px solid gray;
}

.sprite-dead {
  opacity: 0.4;
  filter: alpha(opacity=40); /* msie */
}
</style>