<script setup lang="ts">
import type Character from '@/types/character';
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
  if (props.character.castingSkill != null) {
    target.value = props.character.castingSkill.currentTargets[0] ?? null

    targetColor.value = target.value?.identity?.color ?? "black"

    barWidth.value = ((1 - (props.character.castingSkill.castingTimer / props.character.castingSkill.skillData.castTime)) * 100) + "%"
  } else {
    barWidth.value = "0%"
  }
})
   

</script>

<template>
    <div class="cast-bar">
        <div class="bar" :style="{ width: barWidth}"></div>
        <span class="skill-name" :style="{ color: targetColor }">{{ props.character.castingSkill?.skillData?.name }}</span>
    </div>
</template>

<style scoped>
.cast-bar {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 30px;
  padding: 5px;
  background: #ddd;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  position: relative;
}
.bar {
  background: #cdcdcd;
  width: 100%;
  height: 20px;
  position: relative;
  
  transition: width .05s linear;
}

.skill-name {
  position: absolute;
  text-shadow: 0.5px 0 0 #000, 0 -0.5px 0 #000, 0 0.5px 0 #000, -0.5px 0 0 #000;
  bottom: 0px;
  width: 100%;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  bottom: 2px;
}
</style>