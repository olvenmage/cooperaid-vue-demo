<script setup lang="ts">
import { nextTick, computed, onMounted, reactive, watch } from 'vue';
import Game from '@/core/game';

import PlayerSelect from './setup/PlayerSelect.vue';
import { pubUpdatePickRewardState } from '../client-socket/OutgoingMessages'
import { subChooseReward } from '../client-socket/IncomingMessages'
import HealingReward from '@/types/reward/healing-reward';
import SkillReward from '@/types/reward/skill-reward';
import GemReward from '@/types/reward/gem-reward';
import GameTitle from './GameTitle.vue';

const players = computed(() => Game.players.value)

const canContinue = true
const interval = setInterval(() => updateRewardsInterval(), 2000)

onMounted(() => updateRewardsInterval())

function nextEncounter(): void {
    clearInterval(interval)
    Game.nextEncounter()
}


function updateRewardsInterval() {

    for (const player of players.value) {
        if (player.state.choosingReward) {
            const validRewards = [
              new HealingReward(),
              new GemReward(),
            ]

            if (player.skills.length < 4) {
                validRewards.push(new SkillReward())
            }

            Game.webSocket.publish(pubUpdatePickRewardState({
                playerId: player.id,
                state: validRewards.map((r) => r.getState())
            }))

            const chooseRewardSubscription = Game.webSocket.subscribe(subChooseReward, async (event) => {
                if (event.body.playerId != player.id) return
                const chosenReward = validRewards.find((reward) => reward.name == event.body.rewardName)

                if (!chosenReward || !player.state.choosingReward) {
                  return
                }


                player.state.choosingReward = false
                chooseRewardSubscription.unsubscribe()

                await chosenReward.onChosen(player)
            })
        }
    }
}

</script>
<template>
  <img src="src/assets/menu-background.png" class="menu-background">
  <div class="">
    <div class="title-wrapper">
      <GameTitle style="width: 80vw; max-width: 1000px; height: 12vh"></GameTitle>
    </div>
    <div class="title-wrapper">
      <h3 class="game-font" style="color: white;">
        Selecting Rewards...
      </h3>
    </div>
    <div class="player-container" style="height: 70vh">
      <template v-for="player of players">
        <div style="height: 100%">
          <PlayerSelect class="player-select" :show-health="true" :player="player" :key="`player-select-${player?.id}`">
          </PlayerSelect>
          
        </div>
       
       
      </template>
   
    </div>
    <button class="btn btn-lg btn-primary btn-block game-font" :disabled="!canContinue" @click="nextEncounter">
        CONTINUE
    </button>
  </div>
</template>

<style scoped> 

.menu-background {
  position: absolute;
  width: 100vw;
  height: 100vh;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-select {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 247, 0.2)
}

.player-container {
  display: flex;
  flex-basis: 0;
  gap: 5%;
  margin-bottom: 5px;
  margin: 15px;
}
</style>