
//classses 
import GameSettings from "@/core/settings";
import Barbarian from "@/types/classes/barbarian";
import Juggernaut from "@/types/classes/juggernaut";
import Mage from "@/types/classes/mage";
import Paladin from "@/types/classes/paladin";
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

export default function main() {
    GameSettings.speedFactor = 1
    GameSettings.aiInteractDelay = 0.1
    testClassSetup(
        Rogue,
    )
}