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
    direction: number
}>('RequestClassChange')

const subRequestBasicSkillChange = createSubscribeDefinition<{
    playerId: string,
    direction: number
}>('RequestBasicSkillChange')

const subChooseUpgradeGem =createSubscribeDefinition<{
    playerId: string,
    gemName: string
}>('ChooseUpgradeGem')

const subChooseNewSkill =createSubscribeDefinition<{
    playerId: string,
    skillId: string
}>('ChooseNewSkill')

const subChooseReward = createSubscribeDefinition<{
    playerId: string,
    rewardName: string
}>('ChooseReward')

const subStartSocketing = createSubscribeDefinition<{
    playerId: string,
}>('StartSocketing')

const subStopSocketing = createSubscribeDefinition<{
    playerId: string,
}>('StopSocketing')

const subStopShopping = createSubscribeDefinition<{
    playerId: string,
}>('StopShopping')

const subStartUpdatingStats = createSubscribeDefinition<{
    playerId: string,
}>('StartUpdatingStats')

const subStopUpdatingStats = createSubscribeDefinition<{
    playerId: string,
}>('StopUpdatingStats')

const subAckExpGained = createSubscribeDefinition<{
    playerId: string,
}>('AckExpGained')

const subSocketGemIntoSkill = createSubscribeDefinition<{
    playerId: string,
    skillId: string,
    gemId: string
}>('SocketGemIntoSkill')

const subBuyItemFromShop = createSubscribeDefinition<{
    playerId: string,
    itemId: string,
}>('BuyItemFromShop')

const subSellItemToShop = createSubscribeDefinition<{
    playerId: string,
    itemId: string,
}>('SellItemToShop')

const subAssignSkillPoint = createSubscribeDefinition<{
    playerId: string,
    stat: 'dexterity'|'strength'|'constitution'|'intelligence',
}>('AssignSkillPoint')

export {
    playerJoinMessage,
    subCastSkill,
    subChangePlayerClass,
    subRequestClassChange,
    subRequestBasicSkillChange,
    subChooseUpgradeGem,
    subChooseNewSkill,
    subStartSocketing,
    subStopSocketing,
    subChooseReward,
    subSocketGemIntoSkill,
    subAckExpGained,
    subStartUpdatingStats,
    subStopUpdatingStats,
    subAssignSkillPoint,
    subBuyItemFromShop,
    subSellItemToShop,
    subStopShopping
}