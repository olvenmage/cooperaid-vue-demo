<script setup lang="ts">
import { nextTick, ref, computed, onMounted, reactive } from 'vue';
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

onMounted(() => {
  window.addEventListener('contextmenu', (ev) => {
      if (castingSkill.value != null) {
        ev.preventDefault()
        castingSkill.value = null
        castingCharacter.value = null
      }
  })
})

let enemies = Game.currentBattle?.enemies ?? []
let players = Game.players


function startCast(skill: Skill, character: Character) {
  if (castingSkill.value || castingCharacter.value) {
    return;
  }

  nextTick(() => {
    castingSkill.value = skill
    castingCharacter.value = character
  })

}

function castAtAllEnemies(skill: Skill, character: Character) {
  const combatants: Character[] = []

  for (const enemy of enemies) {
    combatants.push(enemy.value)
  }

  for (const player of players) {
    combatants.push(player.value)
  }


  skill.cast(
    character,
    combatants.filter((char) => character.isEnemyTo(char))
  )
}

function selectCharacter(selectedCharacter: Character) {
  if (!castingSkill.value || !castingCharacter.value) {
    // todo select
    return
  }

  // check if target is valid
  if (castingSkill.value.targetType == TargetType.TARGET_ENEMY && !castingCharacter.value.isEnemyTo(selectedCharacter)) {
    castingSkill.value = null
    castingCharacter.value = null
    return
  } else if (castingSkill.value.targetType == TargetType.TARGET_FRIENDLY && castingCharacter.value.isEnemyTo(selectedCharacter)) {
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
  <section class="battlefield">
    <img class="background" src="/src/assets/background.png">
    <div class="enemy-box">
      <BattlefieldCharacter
        v-for="enemy in enemies"
        :key="enemy.id"
        :character="enemy"
        @click.capture="() => selectCharacter(enemy)"
        :class="{'casting-character': enemy.id == castingCharacter?.id }"
        :casting-skill="castingSkill"
    >
    </BattlefieldCharacter>
    </div>
    <div class="player-box">
<PlayerCharacter
      v-for="player in players"
      :key="player.id"
      :player="player"
      @start-cast="(skill) => startCast(skill, player)"
      @cast-at-all-enemies="(skill) => castAtAllEnemies(skill, player)"
      @click.capture="() => selectCharacter(player)"
      :class="{'casting-character': player.id == castingCharacter?.id }"
      :casting-skill="castingSkill"
    >
   </PlayerCharacter>
    </div>
   
   </section>
</template>

<style scoped>
.casting-character {
  border: 1px solid lightblue;
}

.battlefield {
  position: relative;
  width: 4000px;
  height: 1200px
}

.battlefield .background {
  object-fit: scale-down;
  pointer-events: none;
  position: absolute;
  z-index: -1;
  max-width: 100%;
  height: auto;
  width: auto; /* ie8 */
}

.player-box {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: start;
  left: 10px;
  top: 520px;
}

.enemy-box {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: start;
  left: 940px;
  top: 440px;
}
</style>