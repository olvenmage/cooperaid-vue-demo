<script setup lang="ts">
import { nextTick, ref, computed, onMounted, reactive } from 'vue';
import type Skill from '@/types/skill';
import type Character from '../types/character';
import BattlefieldCharacter from './BattlefieldCharacter.vue';
import { TargetType } from '@/types/skill';
import Game from '@/core/game';


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
let players = Game.players.value


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
    combatants.push(enemy)
  }

  for (const player of players) {
    combatants.push(player.combatCharacter)
  }


  skill.cast(
    character,
    () => combatants.filter((char) => !character.dead && character.isEnemyTo(char))
  )
}

function selectCharacter(selectedCharacter: Character) {
  if (!castingSkill.value || !castingCharacter.value) {
    // todo select
    return
  }

  // check if target is valid
  if (castingSkill.value.skillData.targetType == TargetType.TARGET_ENEMY && !castingCharacter.value.isEnemyTo(selectedCharacter)) {
    castingSkill.value = null
    castingCharacter.value = null
    return
  } else if (castingSkill.value.skillData.targetType == TargetType.TARGET_FRIENDLY && castingCharacter.value.isEnemyTo(selectedCharacter)) {
    castingSkill.value = null
    castingCharacter.value = null
    return
  }

   const castSuccesful = castingSkill.value.cast(
      castingCharacter.value,
      () => [selectedCharacter]
    )

    castingSkill.value = null
    castingCharacter.value = null
}
</script>

<template>
  <section class="battlefield">
    <img class="background" src="/src/assets/combat-background.png">
    <div class="enemy-box">
      <BattlefieldCharacter
        v-for="enemy in enemies"
        :key="enemy.id"
        :character="enemy"
        :casting-skill="castingSkill"
        :casting="enemy.id == castingCharacter?.id"
        @click.capture="() => selectCharacter(enemy)"
    >
    </BattlefieldCharacter>
    </div>
    <div class="player-box">
<BattlefieldCharacter
      v-for="player in players"
      :key="player.id"
      :character="player.combatCharacter"
      :casting-skill="castingSkill"
      :casting="player.id == castingCharacter?.id"
      @start-cast="(skill) => startCast(skill, player.combatCharacter)"
      @cast-at-all-enemies="(skill) => castAtAllEnemies(skill, player.combatCharacter)"
      @click.capture="() => selectCharacter(player.combatCharacter)"
    >
   </BattlefieldCharacter>
    </div>
   
   </section>
</template>

<style scoped>
.casting-character {
  border: 1px solid lightblue;
}

.battlefield {
  position: relative;
  width: 100vw;
  height: 100vh
}

.battlefield .background {
  object-fit: fill;
  pointer-events: none;
  position: absolute;
  z-index: -1;
  max-width: 100%;
  height: 100vh;
  width: 100vw; /* ie8 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.player-box {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  bottom: 230px;
}
.char-wrapper {
  width: 220px;
  height: 220px;
  margin-left: 15px;
}

.enemy-box {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  top: 30px;
}
</style>