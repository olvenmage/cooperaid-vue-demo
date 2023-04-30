import Game from "@/core/game";
import type Player from "./player";
import { pubSetWaitingState, pubUpdateGemSocketingState, pubUpdateShoppingState } from "@/client-socket/OutgoingMessages";
import { subSellItemToShop, subBuyItemFromShop, subSocketGemIntoSkill, subStartSocketing, subStopSocketing, subStopShopping } from "@/client-socket/IncomingMessages";
import type { AppSocketSubscription } from "@/app-socket/lib/core/types";
import NewSkillLootProvider from "./new-skill-loot-provider";
import GemLootProvider from "./skill-upgrades/gem-loot-provider";
import Taunt from "./skills/taunt";
import Bandage from "./skills/bandage";
import SkillInventoryItem from "./skill-inventory-item";
import type Item from "./item";
import NeutralSkillProvider from "./neutral-skill-provider";

export default class PlayerShop {
    active = false

    buying = false;
    selling = false;

    buyItemSubscription: AppSocketSubscription|null = null
    sellItemSubscription: AppSocketSubscription|null = null
    shopInventory: Item[] = []

    constructor(private player: Player) {

    }

    createShopInventory() {
        this.shopInventory = [];

        const skills = NewSkillLootProvider.getNewSkillOptions(this.player, 3)
        const upgrades = GemLootProvider.getUpgradeGemOptions(this.player, 5)
        const neutralSkills = NeutralSkillProvider.getNeutralSkilloptions(this.player, 4)

        this.shopInventory.push(...skills.map((sk) => new SkillInventoryItem(sk)))
        this.shopInventory.push(...upgrades)
        this.shopInventory.push(...neutralSkills.map((sk) => new SkillInventoryItem(sk)))
    }


    publishShoppingState() {
        if (!this.active) {
            return
        }

        Game.webSocket.publish(pubUpdateShoppingState({
            playerId: this.player.id,
            state: {
                shopInventory: this.shopInventory.map((e) => e.getItemState(this.player.playerClass)),
                inventory: this.player.inventory.getState(this.player),
                waitState: this.player.getWaitState()
            }
        }))
    }

    startListening(): this {
        Game.webSocket.subscribe(subStopShopping, (event) => {
            if (event.body.playerId != this.player.id) return
            this.stopShopping()
        })

        return this
    }

    startShopping() {
        this.createShopInventory()

        this.active = true;

        this.buyItemSubscription = Game.webSocket.subscribe(subBuyItemFromShop, (event) => {
            if (event.body.playerId != this.player.id || !this.active) return

            const itemIndex = this.shopInventory.findIndex((it) => it.id == event.body.itemId)
            const item = this.shopInventory[itemIndex]

            if (!item || item.goldValue > this.player.resources.gold) {
                return
            }

            this.player.resources.gold -= item.goldValue

            this.shopInventory.splice(itemIndex, 1)

            this.player.inventory.addItem(item)

            if (this.player.skills.length < 4 && item instanceof SkillInventoryItem) {
                this.player.skills.push(item.skill)
            }
        })

        this.sellItemSubscription = Game.webSocket.subscribe(subSellItemToShop, (event) => {
            if (event.body.playerId != this.player.id || !this.active) return

            const item = this.player.inventory.getItemById(event.body.itemId)

            if (!item) {
                return
            }

            this.player.resources.gold += item.goldValue

            this.player.inventory.removeItem(item)
        })
    }

    stopShopping() {
        this.buyItemSubscription?.unsubscribe()
        this.buyItemSubscription = null

        this.sellItemSubscription?.unsubscribe()
        this.sellItemSubscription = null

        if (this.active) {
            Game.webSocket.publish(pubSetWaitingState({
                playerId: this.player.id,
                state: this.player.getWaitState()
            }))
        }

        this.active = false;
    }
}