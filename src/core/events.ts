import type Character from "@/types/character";
import type Player from "@/types/player";
import { createEventDefinition } from "ts-bus";

export const characterDiedEvent = createEventDefinition<{ character: Character}>()("COOPERAID_CHARACTER_DIED")
export const globalThreatEvent = createEventDefinition<{ healer: Character, amount: number}>()("COOPERAID_GLOBAL_THREAT")