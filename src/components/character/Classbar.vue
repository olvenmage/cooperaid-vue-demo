<script setup lang="ts">
import type Classbar from '@/types/class-bar';
import { ref, computed } from 'vue';
const props = defineProps<{
    classBar: Classbar
}>()

const barWidth = computed(() => {
  let perc = (props.classBar.current / props.classBar.max) * 100;

  if (perc < 0) {
        perc = 0;
    }

    return perc
})
   

</script>

<template>
    <div class="class-bar">
        <div class="bar" :style="{ width: barWidth + '%', background: classBar.color }"></div>
        <span style="color: black; position: absolute; bottom: 0px; right: 80px; text-align: center">{{ classBar.current }}/{{ classBar.max }}</span>
    </div>
</template>

<style scoped>
.class-bar {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  width: 200px;
  height: 20px;
  padding: 5px;
  background: #ddd;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  position: relative;
}
.bar {
  width: 100%;
  height: 10px;
  position: relative;
  
  transition: width .5s linear;
}

.hit {
  background: rgba(255,255,255,0.6);
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 0px;
  
  transition: width .5s linear;
}
</style>