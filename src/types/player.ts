import pickRandom from '@/utils/pickRandom';
import Character from './character';
import CharacterAI from './character-ai';
import CharacterSkills from './character-skills';
import Faction from './faction';
import type Identity from './identity';
import type PlayerIdentity from './player-identity';
import type Skill from './skill';
import type PlayerState from './state/player-state';
import { reactive } from 'vue'
import Healthbar from './health-bar';
import PlayerInventory from './player-inventory';
import Game from '@/core/game';
import { subSocketGemIntoSkill, subStartSocketing, subStopSocketing } from '@/client-socket/IncomingMessages';
import { pubSetWaitingState, pubUpdateGemSocketingState } from '@/client-socket/OutgoingMessages';

abstract class PlayerNumberRegistry {
    static currentPlayerIndex = 0
    static playerColors = [
        '#F52E2e',
        '#5463FF',
        '#FFC717',
        '#1F9E40',
        '#24D4C4',
        '#D41CE5',
        '#4A4559',
        '#FFBF00'
    ]

    static getColor(num: number): string {
        return this.playerColors[num - 1]
    }

    static getNumber(): number {
        const num = this.currentPlayerIndex + 1
        this.currentPlayerIndex += 1

        return num 
    }
}

class PlayerWorkflowState {
    choosingReward: boolean
    socketing: boolean

    constructor() {
        this.choosingReward = false
        this.socketing = false;
    }
}

class Player {
    public playerColor: string
    public playerNumber: number

    private aiEnabled = false

    public combatCharacter: Character|null = null
    public skills: Skill[] = []
    public basicSkill: Skill|null = null
    public healthBar: Healthbar = new Healthbar(20)
    public inventory = new PlayerInventory()

    public state = new PlayerWorkflowState()

    private innerPlayerClass: PlayerIdentity|null = null

    get playerClass() {
        return this.innerPlayerClass
    }

    get allSkills(): Skill[] {
        const allSkills = [...this.skills]

        if (this.basicSkill) {
            allSkills.push(this.basicSkill)
        }

        return allSkills
    }

    set playerClass(newVal: PlayerIdentity|null) {
        this.innerPlayerClass = newVal
        if (newVal) {
            this.skills = [
                ...newVal.skills
            ]
            this.basicSkill = pickRandom(newVal.basicSkills) as Skill|null
            this.healthBar = new Healthbar(newVal.baseStats.maxHealth.value)
        } else {
            this.skills = [];
        }
      
    }

    constructor(public readonly id: string, public readonly name: string, public controledExternally: boolean, playerClass: PlayerIdentity|null) {
        this.playerNumber = PlayerNumberRegistry.getNumber()
        this.playerColor = PlayerNumberRegistry.getColor(this.playerNumber)

        if (playerClass) {
            this.setClass(playerClass)
        }


        Game.webSocket.subscribe(subStartSocketing, (event) => {
            if (event.body.playerId != this.id) return

            this.state.socketing = true;

            const socketingInterval = setInterval(() => {
                const allSkills = [
                    this.basicSkill!,
                    ...this.skills
                ]

                Game.webSocket.publish(pubUpdateGemSocketingState({
                    playerId: this.id,
                    state: {
                        skills: allSkills?.map((skill) => skill.getState(this.combatCharacter, null)) ?? [],
                        inventory: this.inventory.getState(this)
                    }
                }))
            }, 1000)

            const socketIntoSkillSubscription = Game.webSocket.subscribe(subSocketGemIntoSkill, (event) => {
                if (event.body.playerId != this.id) return

                const skill = this.allSkills.find((sk) => sk.id == event.body.skillId)

                if (!skill) {
                    return
                }

                const gemIndex = this.inventory.skillGems.findIndex((gem) => gem.id == event.body.gemId)

                if (gemIndex == -1) {
                    return
                }

                const gem = this.inventory.skillGems[gemIndex]

                if (!gem.applies(skill)) {
                    return
                }

                if (skill.socketedUpgrade) {
                    this.inventory.addGem(skill.socketedUpgrade)
                }

                skill.socketedUpgrade = gem
                this.inventory.skillGems.splice(gemIndex, 1)
            })

            const stopSubscription = Game.webSocket.subscribe(subStopSocketing, (event) => {
                if (event.body.playerId != this.id) return
                clearInterval(socketingInterval)
                socketIntoSkillSubscription.unsubscribe()
                stopSubscription.unsubscribe()
                this.state.socketing = false

                Game.webSocket.publish(pubSetWaitingState({
                    playerId: this.id
                }))
            })

            
        })
    }

    setClass(playerClass: PlayerIdentity) {
        this.playerClass = playerClass
        this.skills = playerClass.skills
    }
    
    enableAI(): this {
        this.aiEnabled = true
        return this
    }

    createCharacter(): Character {
        if (!this.playerClass) {
            throw Error("Can't create character without player identity")
        }

        const charSkills = new CharacterSkills(this.skills, this.basicSkill)

        charSkills.resetCooldowns()
        const character = reactive(new Character(this.playerClass, true, charSkills)) as Character

        character.healthBar = this.healthBar
        character.id = this.id

        character.player = this


        this.combatCharacter = character
        
        if (this.aiEnabled) {
            character.enableAI()
        }

        character.identity.onCreated(character)
        character.classBar?.decrease(100)

        return character
    }

    getState(): PlayerState {
        return {
            id: this.id,
            name: this.name,
            playerClass: this.playerClass?.getPlayerIdentityState() || null,
            basicSkill: this.basicSkill?.getState(null, null) || null
        }
    }

    removeCharacter() {
        this.combatCharacter = null 
    }
}

export default Player;