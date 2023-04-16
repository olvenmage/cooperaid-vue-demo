<script setup lang="ts">
import { nextTick, ref, computed, onMounted, reactive } from 'vue';
import { TargetType } from '@/types/skill';
import Game from '@/core/game';
import Barbarian from '@/types/classes/barbarian';
import Rogue from '@/types/classes/rogue';
import Juggernaut from '@/types/classes/juggernaut';
import Mage from '@/types/classes/mage';
import Paladin from '@/types/classes/paladin';
import presenterSocket from '@/client-socket/presenter-socket';
import { playerJoinMessage } from '@/client-socket/IncomingMessages';
import type Identity from '@/types/identity';
import type IdentityState from '@/types/state/identity-state';
import type LobbyState from '@/types/state/lobby-state';
import { pubUpdateLobbyState } from '@/client-socket/OutgoingMessages';
import { subChangePlayerClass } from '@/client-socket/IncomingMessages';
import type PlayerIdentity from '@/types/player-identity';
import PlayerSelect from './PlayerSelect.vue';
import type Player from '@/types/player';
import { CombatEncounter } from '@/core/encounter';
import Enemy from '@/types/enemy';
import DragonBoss from '@/types/enemies/dragon-boss';
import GameSettings from '@/core/settings';

const players = Game.players.value

const classes = [
  new Barbarian(),
  new Rogue(),
  new Juggernaut(),
  new Paladin()
]

const availableClasses = computed<PlayerIdentity[]>(() => {
  return classes.filter((c) => players.findIndex((plr) => plr.playerClass?.name == c.name) === -1)
})

const availableClassStates = computed(() => {
  return availableClasses.value.map((cls) => cls.getState())
})

const playerAmount = 1

function addCPU() {
  Game.addCPU()
}

function setClass(playerId: string, playerClassName: string) {
      const player = players.find((plr) => plr.id == playerId)
      const playerClass = availableClasses.value.find((cls) => cls.name == playerClassName)

      console.log(`class change: ${playerClassName} `)

      if (player && playerClass) {
          player.playerClass = playerClass
      }
}

function start() {
  GameSettings.speedFactor = 0.5
  Game.startGame({
    players: Game.players.value as Player[],
    route: [
      new CombatEncounter(
        [new Enemy(new Rogue())]
      )
    ]
  })
}

onMounted(() => {
  presenterSocket.subscribe(subChangePlayerClass , (event) => {
    setClass(event.body.playerId, event.body.playerClass)
  })

  setInterval(() => {
    const state: LobbyState = {
      availableClasses: availableClassStates.value,
      players: players.map((plr) => plr.getState())
    }

    players.forEach((plr) => {
      const avClasses = [...state.availableClasses]

      if (plr.playerClass) {
        avClasses.push(plr.playerClass.getState())
      }

      presenterSocket.publish(pubUpdateLobbyState({
        playerId: plr.id,
        state: {
          availableClasses: avClasses,
          players: state.players,
        }
      }))
    })
  }, 500)
})

</script>
<template>
  <div class="container">
    <div style="width: 100%; height: 80vh">
      <template v-for="player in players">
        <PlayerSelect class="player-select" :player="player">
          <select v-if="!player.controledExternally" v-model="player.playerClass" class="form-control">
                <option v-for="playerClass in availableClasses" :value="playerClass" :style="{color: playerClass.color}">
                    {{ playerClass.name }}
                </option>
            </select>
          </PlayerSelect>
       
      </template>
      

      <div v-if="players.length != playerAmount" class="player-select">
      <button class="btn btn-lg btn-primary btn-block game-font" @click="addCPU">
        ADD CPU
    </button>
    </div>
   
    </div>
    <button class="btn btn-lg btn-primary btn-block game-font" :disabled="players.length != playerAmount" @click="start">
        START GAME
    </button>
  </div>
</template>

<style scoped> 
.player-select {
  float: left;
  width: 24%;
  height: 100%;
  margin-right: 3px;
}
</style>