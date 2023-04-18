import type Character from '../character'

export default interface EmpowerableSKill {
    empower(castBy: Character): void
    unempower(castBy: Character): void
}

const isEmpowerableSkil = (skill: any): skill is EmpowerableSKill  => {
    return (skill as any).empower != undefined
}

export { 
    isEmpowerableSkil
}