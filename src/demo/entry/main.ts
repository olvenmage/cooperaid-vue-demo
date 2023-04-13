
//classses 
import GameSettings from "@/core/settings";
import Barbarian from "@/types/classes/barbarian";
import Juggernaut from "@/types/classes/juggernaut";
import Mage from "@/types/classes/mage";
import Paladin from "@/types/classes/paladin";
import Rogue from "@/types/classes/rogue";
import Player from "@/types/player";

// skills
import Bandage from "@/types/skills/bandage";

import { BladeFlurry } from "@/types/classes/rogue"

// setups
import dragonBossSetup from "../setups/dragon-boss-setup";
import pvpSetup from "../setups/pvp";
import testClassSetup from "../setups/test-class"

export default function main() {
    GameSettings.speedFactor = 0.5
    dragonBossSetup(
        new Player(new Rogue()).removeSkill(BladeFlurry).addSkill(new Bandage()),
        new Player(new Paladin()),
        new Player(new Juggernaut())
    )
}