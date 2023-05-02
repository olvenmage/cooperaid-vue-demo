<script setup lang="ts">
import type { GoldStage } from '@/core/battle';
import PlayerGold from '../player/PlayerGold.vue'
import { ref, watchEffect } from 'vue';
const props = defineProps<{ stage: GoldStage }>()

let barWidth = ref("100%");


watchEffect(() => {
 // damage = 100;
    // calculate the percentage of the total width
    let perc = 100 - (props.stage.counter / props.stage.totalTime) * 100;

    if (perc < 0) {
        perc = 0;
    }

    barWidth.value = perc + "%";
})
   

</script>

<template>
   <div class="panel gold-stage">
     
      <div class="panel-body">
        <div class="gold-title-wrapper">
        <h4 class="game-font gold-title">GOLD</h4>
      </div>
      <div style="clear: both;">
        <PlayerGold class="gold-amount" :gold="stage.goldAmount">
          <div v-if="stage.value < 100" class="gold-value">&nbsp; ({{ stage.value }}%)</div>
        </PlayerGold>
      
      </div>
      
    <div class="gold-stage-bar" v-if="!stage.complete">
        <div class="bar" :style="{ width: barWidth }">
        
        </div>
        <div
          class="gold-counter"
          >
          {{ ((stage.totalTime - stage.counter) / 1000) }}s
    </div>
    </div>
      </div>
   </div>
</template>

<style scoped>
.gold-stage-bar {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 24px;
  padding: 5px;
  background: #ddd;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  position: relative;
}

.gold-stage {
  width: 10vw;
  background-color: rgba(255, 255, 255, 0.65) !important;
}

.gold-counter {
  position: absolute;
  bottom: 2px;
  text-align: center;
  width: 100%;
}

.gold-value {
  color :rgb(227, 69, 69);
}

.float-left {
  float: left;
}


.gold-amount {
  font-size: 20px;
}

.bar {
  width: 100%;
  height: 14px;
  position: relative;
  background: rgb(255, 222, 35);
  transition: width .5s linear;
}

.gold-title {
  color: rgb(221, 189, 9);
  background: transparent;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: black;
  font-size: 3rem;
  font-weight: 1000;
}

.gold-title-wrapper {
  width: 100%;
  text-align: center;
}

</style>