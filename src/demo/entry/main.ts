
//classses 
import GameSettings from "@/core/settings";
import Barbarian, { Shout } from "@/types/classes/barbarian";
import Juggernaut from "@/types/classes/juggernaut";
import Mage from "@/types/classes/mage";
import Paladin, { OverwhelmingLight, Smite } from "@/types/classes/paladin";
import Rogue, { Dismantle } from "@/types/classes/rogue";
import Player from "@/types/player";

// skills
import Bandage from "@/types/skills/bandage";

import { BladeFlurry } from "@/types/classes/rogue"

// setups
import dragonBossSetup from "../setups/dragon-boss-setup";
import pvpSetup from "../setups/pvp";
import testClassSetup from "../setups/test-class"
import Enemy from "@/types/enemy";
import { WhelpBite } from "@/types/enemies/dragon-egg";
import Taunt from "@/types/skills/taunt";

export default function main() {
    GameSettings.speedFactor = 0.5
    dragonBossSetup(
        new Player(new Paladin()).addSkill(new OverwhelmingLight()),
        new Player(new Rogue()).enableAI(),
        new Player(new Juggernaut()).enableAI(),
        new Player(new Barbarian()).enableAI()
    )
}