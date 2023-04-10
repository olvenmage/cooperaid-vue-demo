<script setup lang="ts">
import type Character from '@/types/character';
import type Healthbar from '@/types/health-bar';
import Player from '@/types/player';
import type Skill from '@/types/skill'
import { ref, watchEffect } from 'vue';
const props = defineProps<{
    character: Character
}>()


let castingSkill = ref<Skill|null>(null)
let target = ref<Character|null>(null)
let targetColor = ref("black")
let barWidth = ref("100%");

watchEffect(() => {
  const characterSkillThatsCasting = props.character.identity.skills.find((sk) => sk.casting)

  if (characterSkillThatsCasting != null) {
    castingSkill.value = characterSkillThatsCasting
    target.value = characterSkillThatsCasting.castingTargets[0] ?? null

    if (target.value instanceof Player) {
      targetColor.value = target.value.playerColor
    } else {
      targetColor.value = "black"
    }

    barWidth.value = ((1 - (castingSkill.value.castingTimer / castingSkill.value.castTime)) * 100) + "%"
  } else {
    barWidth.value = "0%"
  }
})
   

</script>

<template>
    <div class="cast-bar">
        <div class="bar" :style="{ width: barWidth}"></div>
        <span class="skill-name" :style="{ color: targetColor }">{{ castingSkill?.name }}</span>
    </div>
</template>

<style scoped>
.cast-bar {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  width: 200px;
  height: 30px;
  padding: 5px;
  background: #ddd;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  position: relative;
}
.bar {
  background: gray;
  width: 100%;
  height: 20px;
  position: relative;
  
  transition: width .5s linear;
}

.skill-name {
  position: absolute;
  text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000;
  bottom: 0px;
  right: 80px;
  text-align: center;
  font-size: 18px;
  bottom: 2px;
}
</style>