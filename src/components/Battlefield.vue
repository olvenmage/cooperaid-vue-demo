<script setup lang="ts">
import { nextTick, ref, computed } from 'vue';
import type Skill from '@/types/skill';
import type Character from '../types/character';
import Player from '../types/player';
import Enemy from '../types/enemy';
import BattlefieldCharacter from './BattlefieldCharacter.vue';
import { TargetType } from '@/types/skill';
import Game from '@/core/game';
import PlayerCharacter from './PlayerCharacter.vue';


let castingSkill = ref<Skill|null>(null);
let castingCharacter = ref<Character|null>(null);

let reactiveGame = ref(Game)

let enemies = computed(() => {
  if (reactiveGame.value.currentBattle != null) {
    return reactiveGame.value.currentBattle.enemies
  }

  return []
})

let players = computed(() => {
  if (reactiveGame.value.currentBattle != null) {
    return reactiveGame.value.currentBattle.players
  }

  return []
})


function startCast(skill: Skill, character: Character) {
  if (castingSkill.value || castingCharacter.value) {
    return;
  }

  nextTick(() => {
    castingSkill.value = skill
    castingCharacter.value = character
  })

}

function selectCharacter(selectedCharacter: Character) {
  if (!castingSkill.value || !castingCharacter.value) {
    // todo select
    return
  }

  // check if target is valid
  if (castingSkill.value.targetType == TargetType.TARGET_ENEMY && !(selectedCharacter instanceof Enemy)) {
    castingSkill.value = null
    castingCharacter.value = null
    return
  } else if (castingSkill.value.targetType == TargetType.TARGET_FRIENDLY && !(selectCharacter instanceof Player)) {
    castingSkill.value = null
    castingCharacter.value = null
    return
  }

   const castSuccesful = castingSkill.value.cast(
      castingCharacter.value,
      [selectedCharacter]
    )

    castingSkill.value = null
    castingCharacter.value = null
}
</script>

<template>
  <section>
    <div style="display: flex;">
      <BattlefieldCharacter
        v-for="enemy in enemies"
        :key="enemy.id"
        :character="enemy"
        @click.capture="() => selectCharacter(enemy)"
        :class="{'casting-character': enemy.id == castingCharacter?.id }"
    >
    </BattlefieldCharacter>
    </div>
    <hr style="margin-top: 50px; margin-bottom: 50px;">
    <div style="display: flex">
    <PlayerCharacter
      v-for="player in players"
      :key="player.id"
      :player="player"
      @start-cast="(skill) => startCast(skill, player)"
      @click.capture="() => selectCharacter(player)"
      :class="{'casting-character': player.id == castingCharacter?.id }"
    >
   </PlayerCharacter>
    </div>
   
   </section>
</template>

<style scoped>
.casting-character {
  border: 1px solid lightblue;
}
</style>