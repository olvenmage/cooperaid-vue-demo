import { createSubscribeDefinition } from "@/app-socket/lib/core/AppSocketMessageDefinition";

const playerJoinMessage = createSubscribeDefinition<{
    playerId: string,
    playerName: string
}>('PlayerJoin')

const subCastSkill = createSubscribeDefinition<{
    playerId: string,
    skill: string,
    targets: string[]
}>('CastSkill')

const subChangePlayerClass = createSubscribeDefinition<{
    playerId: string,
    playerClass: string,
}>('ChangePlayerClass')

const subRequestClassChange = createSubscribeDefinition<{
    playerId: string,
    selectIndex: number
}>('RequestClassChange')


export {
    playerJoinMessage,
    subCastSkill,
    subChangePlayerClass,
    subRequestClassChange
}