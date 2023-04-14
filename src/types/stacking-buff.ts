


interface StackingBuff {
    addStack(amount: number): void
}

const isStackingBuff = (buff: any): buff is StackingBuff => {
    return (buff as any).addStack != undefined
} 

export default StackingBuff
export { isStackingBuff }