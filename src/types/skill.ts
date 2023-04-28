import GameSettings from '@/core/settings';
import type Character from './character';
import type { CharacterSkill, CharacterSkillTargetType } from './state/character-state';
import DamageType from './damage-type';
import type OnDamageTrigger from './triggers/on-damage-trigger';
import type SkillData from './skill-data';
import type { SkillDataParams } from './skill-data';
import type SkillUpgrade from './skill-upgrade';
import type Battle from '@/core/battle';
import Game from '@/core/game';
import shuffleArray from '@/utils/shuffleArray';
import { CHARACTER_TRIGGERS } from './character-triggers';
import type SkillUpgradeGem from './skill-upgrade';

enum TargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_NONE,
    TARGET_SELF,
    TARGET_ANY,
    TARGET_ALL_ENEMIES,
    TARGET_ALL_FRIENDLIES
}

enum SkillTag {
    ATTACK,
    SPELL,
    HEAL,
    DEFENSIVE,
    SUPPORT,
}

// MELLEE includes TOUCH
enum SkillRange {
    MELEE,
    RANGED,
}

enum AiTargetting {
    HIGHEST_THREAT,
    RANDOM,
    MOST_HEALING,
}

export type CastSkillResponse = void | {
    triggerCooldown?: boolean
}

export default abstract class Skill {
    public abstract baseSkillData: SkillData
    castingTimer: number = 0
    casting = false

    public onCooldownTimer = 0
    public onCooldown = false;
    public casted = false

    private interupted = false
    public socketedUpgrade: SkillUpgrade|null = null

    description: string|null = null

    currentTargets: Character[] = []

    private castingSkillData: SkillData|undefined = undefined
    public id = "skill" + Math.random().toString(16).slice(2)

    interuptsOnDamageTakenCallback = this.onDamageTaken.bind(this)
    
    get skillData() {
        return this.castingSkillData ?? this.baseSkillData
    }

    get cooldown(): number {
        return this.skillData?.cooldown ?? 0 / GameSettings.speedFactor
    }

    get cooldownDisplay(): string {
        return ((this.cooldown - this.onCooldownTimer) / 1000).toFixed(2)
    }

    canCast(castBy: Character): boolean {
        if (castBy.castingSkill != null) {
            return false;
        }

        if (castBy.energyBar.current < (this.skillData?.energyCost ?? 0)) {
            return false;
        }

        if (!this.skillData?.canCastOnCooldown && this.onCooldown) {
            return false;
        }

        if (!castBy.actionable) {
            return false;
        }

        return true;
    }

    setGem(gem: SkillUpgrade|null): this {
        this.socketedUpgrade = gem
        return this
    }

    areTargetsValid(castBy: Character, targets: Character[]): boolean {
        if (this.skillData?.targetType == TargetType.TARGET_NONE) {
            return true
        }

        return targets.some((target) => {
           return this.isTargetValid(castBy, target)
        })
    }

    isTargetValid(castBy: Character|undefined, target: Character|undefined) {
        // todo: if can not target dead
        if (!target || !castBy || target.dead) {
            return false
        }

        if (this.skillData?.targetType == TargetType.TARGET_SELF) {
            return castBy.id == target.id
        }

        const isEnemy = castBy.isEnemyTo(target)

        if (this.skillData?.targetType == TargetType.TARGET_FRIENDLY && isEnemy) {
            return false
        } else if ((this.skillData?.targetType == TargetType.TARGET_ENEMY || this.skillData?.targetType == TargetType.TARGET_ALL_ENEMIES) && (!isEnemy)) {
            return false
        }

        if (this.skillData?.range === SkillRange.MELEE && target.stats.flying) {
            return false
        }

        return true
    }

    onCooldownFinished() {
        const onCooldownSkillData = this.onCooldownSkillData()
        
        if (onCooldownSkillData && this.skillData.isTransformed) {
            this.skillData.transformBack()
        }
    }

    onCooldownSkillData(): Partial<SkillData>|null {
        return null
    }

    incrementCooldown() {
        if (!this.onCooldown) return;

        if (this.onCooldownTimer >= this.cooldown) {
            this.finishCooldown()
            return
        }

        setTimeout(() => {
            this.onCooldownTimer += 1000
            this.incrementCooldown()
        }, 990)
    }

    hasGem(gemClass: typeof SkillUpgradeGem): boolean {
        return this.socketedUpgrade instanceof gemClass
    }

    finishCooldown() {
        this.onCooldownTimer = 0
        this.onCooldown = false
        this.onCooldownFinished()
    }

    revertCastingSkillData() {
        this.castingSkillData = undefined;
    }

    incrementCastTime(castBy: Character, getTargets: () => Character[]) {
        if (castBy.dead || this.casted) {
            this.castingTimer = 0
            this.casting = false
            this.currentTargets = []
            castBy.castingSkill = null
           
            return
        }

        if (!castBy.actionable) {
            setTimeout(() => {
                this.incrementCastTime(castBy, getTargets)
            }, 200)
            return
        }

        if (this.interupted) {
            this.interupted = false;
            this.onCooldownTimer = Math.round(this.cooldown / 2)
            this.castingTimer = 0
            this.removeDamageTakenCallback(castBy)
            this.startCooldown(castBy)
            return;
        }

        this.casting = true

        if (this.castingTimer >= (this.skillData?.castTime ?? 0)) {
            this.casted = true
            this.castingTimer = 0
            this.casting = false

            if (this.areTargetsValid(castBy, this.currentTargets)) {
                this.doCast(castBy, this.currentTargets)
            } else {
                const battle = Game.currentBattle

                if (!battle) {
                    return false;
                }

                const newValidTargets = shuffleArray(battle.combatants.filter((cb) => this.isTargetValid(castBy, cb)))
                this.currentTargets = this.currentTargets.map((target) => {
                    const newTarget = newValidTargets[0] ?? null

                    if (newTarget != null) {
                        newValidTargets.splice(0, 1)
                    }

                    return newTarget
                }).filter((v) => v != null)

                this.doCast(castBy, this.currentTargets)
            }
            this.removeDamageTakenCallback(castBy)
            this.currentTargets = []
            return
        }

        this.currentTargets = getTargets()

        setTimeout(() => {
            this.castingTimer += Math.min((this.skillData.castingIncrementer) * (1 + (castBy.stats.derived.castSpeed.value / 100)) * GameSettings.speedFactor, 0)
            this.incrementCastTime(castBy, getTargets)
        }, this.skillData.castingIncrementer)
    }

    cast(castBy: Character, getTargets: () => Character[]) {
        if (!this.canCast(castBy)) {
            return false;
        }

        if (!this.areTargetsValid(castBy, getTargets())) {
            return false;
        }

        this.casted = false
        this.castingSkillData = this.baseSkillData.clone()
        this.currentTargets = getTargets()
        this.beforeCast(castBy)
        castBy.energyBar.current -= this.skillData.energyCost

        if (this.castingSkillData.interuptsOnDamageTaken) {
            castBy.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.interuptsOnDamageTakenCallback)
        }

        castBy.castingSkill = this

        castBy.triggers.publish(CHARACTER_TRIGGERS.BEFORE_SKILL_START_CAST, this.castingSkillData)
        
        setTimeout(() => {
            this.incrementCastTime(castBy, getTargets)
        }, 50)
    }

    beforeCast(castBy: Character) {

    }

    doCast(castBy: Character, targets: Character[]) {
        if (this.castingSkillData?.damageType == DamageType.PHYSICAL) {
            this.castingSkillData.damage += castBy.stats.derived.attackDamage.value
        }

        if (this.castingSkillData) {
            castBy.triggers.publish(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.castingSkillData)
        }

        const res = this.castSkill(castBy, targets);

        if (res?.triggerCooldown ?? true) {
            this.startCooldown(castBy)
        } else {
            castBy.castingSkill = null
        }
    }

    startCooldown(castBy: Character) {
        this.onCooldown = true
        castBy.castingSkill = null
        this.incrementCooldown()

        const onCooldownSkillData = this.onCooldownSkillData()
        
        if (onCooldownSkillData) {
            this.skillData?.transform(Object.assign({}, onCooldownSkillData, { canCastOnCooldown: true }) as SkillDataParams)
        }
    }

    delayCastingTime(miliseconds: number) {
        this.castingTimer = Math.min(this.castingTimer - miliseconds, 0)
    }

    removeDamageTakenCallback(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.interuptsOnDamageTakenCallback)
    }

    onDamageTaken(trigger: OnDamageTrigger) {
        if (trigger.actualDamage > 0 && trigger.damageType != DamageType.POISON) {
            this.interupt()
        }
    }

    interupt() {
        this.interupted = true
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 0
    }

    getState(castBy: Character|null, battle: Battle|null): CharacterSkill {
        return {
            id: this.id,
            name: this.skillData?.name,
            canCast: castBy ? this.canCast(castBy) : true,
            energyCost: this.skillData?.energyCost,
            validTargets: battle && castBy ? battle.combatants.filter((cb) => this.isTargetValid(castBy, cb)).map((c) => c.id) : [],
            description: this.description,
            imagePath: this.skillData?.imagePath ?? null,
            targetType: this.skillData?.targetType as unknown as CharacterSkillTargetType,
            cooldown: this.cooldownDisplay,
            cooldownRemaining: this.onCooldownTimer,
            buffDuration: this.skillData?.buffDuration / GameSettings.speedFactor,
            castTime: this.skillData?.castTime / GameSettings.speedFactor,
            socketedGem: this.socketedUpgrade?.getState(castBy?.identity ?? null, []) ?? null
        }
    }

    abstract castSkill(castBy: Character, targets: Character[]): CastSkillResponse
}

export { TargetType, AiTargetting, SkillTag, SkillRange }