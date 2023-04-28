<script setup lang="ts">
import { nextTick, computed, onMounted, reactive, watch, onUnmounted } from 'vue';
import type Skill from '@/types/skill';
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
import { subChangePlayerClass, subRequestClassChange, subRequestBasicSkillChange } from '@/client-socket/IncomingMessages';
import type PlayerIdentity from '@/types/player-identity';
import PlayerSelect from './PlayerSelect.vue';
import type Player from '@/types/player';
import GameSettings from '@/core/settings';
import Druid from '@/types/classes/druid';
import mainRoute from '@/core/main-route'
import pickRandom from '@/utils/pickRandom';
import GameTitle from '../GameTitle.vue';


const players = Game.players.value

const classes = [
  new Barbarian(),
  new Rogue(),
  new Juggernaut(),
  new Paladin(),
  new Mage(),
  new Druid()
]

const playerAssignment: Record<number, Player|null> = reactive({
  0: null,
  // 1: null,
  // 2: null,
  // 3: null
})

const availableClasses = computed<PlayerIdentity[]>(() => {
  return classes.filter((c) => players.findIndex((plr) => plr.playerClass?.name == c.name) === -1)
})

const availableClassStates = computed(() => {
  return availableClasses.value.map((cls) => cls.getState())
})

watch(players, () => {
  for (const index in players) {
    const plr = players[index] as Player
    playerAssignment[index] = plr

    if (!plr.basicSkill) {
      plr.basicSkill = pickRandom(playerAssignment[index]?.playerClass?.basicSkills ?? []) as Skill|null
    }
  }
})

const playerAmount = computed(() => Object.keys(playerAssignment).length)

function setClass(playerId: string, playerClassName: string) {
      const player = players.find((plr) => plr.id == playerId)
      const playerClass = availableClasses.value.find((cls) => cls.name == playerClassName)

      if (player && playerClass) {
          player.basicSkill = playerClass.basicSkills[0]
          player.playerClass = playerClass
      }
}

function requestBasicSkillChange(playerId: string, direction: number) {
  const player = players.find((plr) => plr.id == playerId)

  if (!player || !player.playerClass) {
    return
  }

  if (!player.basicSkill) {
    player.basicSkill = player.playerClass.basicSkills[0]
    return
  }

  const currentBasicSkillIndex = player.playerClass.basicSkills.findIndex((s) => s.id == player.basicSkill?.id)

  if (currentBasicSkillIndex == -1) {
    return
  }

  let newIndex = currentBasicSkillIndex + direction

  if (!player.playerClass.basicSkills[newIndex]) {
    newIndex = direction == -1 ? player.playerClass.basicSkills.length - 1 : 0
  }

  player.basicSkill = player.playerClass.basicSkills[newIndex]
}

// carousel class change
function requestClassChange(playerId: string, selectIndex: number) {
    const player = players.find((plr) => plr.id == playerId)

    if (!player) {
      return
    }

    let currentClassIndex = classes.findIndex((cls) => cls.name == player.playerClass?.name)

    if (currentClassIndex == -1) {
      return
    }

    let newClassIndex = -1;
    let checkIndex = selectIndex

    while (newClassIndex == -1) {
        const potentialNewClass = classes[currentClassIndex + checkIndex]

        if (!potentialNewClass) {
            checkIndex = selectIndex
            if (selectIndex == 1) {
                currentClassIndex = -1
            } else {
              currentClassIndex = classes.length
            }
        } else {
          const availableNewClassIndex = availableClasses.value.findIndex((cls) => cls.name == potentialNewClass.name)

          if (availableNewClassIndex != -1) {
              newClassIndex = availableNewClassIndex;
              break;
          } else {
            checkIndex += selectIndex
          }
        }
   }

  setClass(playerId, availableClasses.value[newClassIndex]!.name)
}

function start() {
  Game.startGame({
    players: Game.players.value as Player[],
    route: mainRoute,
  })
}

onMounted(() => {
  presenterSocket.subscribe(subChangePlayerClass , (event) => {
    setClass(event.body.playerId, event.body.playerClass)
  })

  presenterSocket.subscribe(subRequestClassChange , (event) => {
    requestClassChange(event.body.playerId, event.body.direction)
  })

  presenterSocket.subscribe(subRequestBasicSkillChange , (event) => {
    requestBasicSkillChange(event.body.playerId, event.body.direction)
  })

  const updateLobbyStateInterval = setInterval(() => {
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

  onUnmounted(() => clearInterval(updateLobbyStateInterval))
})

const joinUrl = window.location.hostname + ':8000'

</script>
<template>
  <img src="src/assets/menu-background.png" class="menu-background">
  <div class="">
    <div class="title-wrapper">
      <GameTitle style="width: 80vw; max-width: 1000px; height: 12vh"></GameTitle>
    </div>
      <div class="title-wrapper">
        <h2 class="game-font join-text">
        JOIN @ <span class="join-url">{{ joinUrl }}</span>
        </h2>
    </div>
    <div class="player-container" style="height: 70vh">
      <template v-for="player of playerAssignment" :key="`player-select-${player?.id}`">
          <PlayerSelect :player="player">
            <template #default="{ player }">
              <select v-if="player && !player.controledExternally" v-model="player.playerClass" class="form-control">
                <option  :value="player.playerClass" v-if="player.playerClass" :style="{color: player.playerClass?.color}">
                  {{ player.playerClass.name }}
                </option>
                <option v-for="playerClass in availableClasses" :value="playerClass" :style="{color: playerClass.color}">
                    {{ playerClass.name }}
                </option>
              </select>
              <input class="form-control" v-else-if="player" type="text" :value="player.playerClass?.name" disabled>
            </template>
          </PlayerSelect>
      </template>
   
    </div>
    <button class="btn btn-lg btn-primary btn-block game-font" :disabled="players.length != playerAmount" @click="start">
        START GAME
    </button>
  </div>
</template>

<style scoped> 
.player-select {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 247, 0.2)
}

.menu-background {
  position: absolute;
  width: 100vw;
  height: 100vh;
}

.player-container {
  display: flex;
  flex-basis: 0;
  gap: 5%;
  margin-bottom: 5px;
  margin: 15px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.join-text {
  color: white;
  font-weight: 1000;
}
.join-url {
  text-decoration: underline;
}
</style>