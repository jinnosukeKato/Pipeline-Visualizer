class Processor {
  constructor(instructions) {
    this.pc = 0;
    this.instructions = instructions || [];
  }

  getProgramCounter() {
    return this.pc;
  }

  incrimentProgramCounter() {
    this.pc += 1;
  }

  decrimentProgramCounter() {
    if (this.pc > 0) {
      this.pc -= 1;
    }
  }

  resetProgramCounter() {
    this.pc = 0;
  }

  addInstruction(operation, rd, rs1, rs2) {
    this.instructions.push({ operation, rd, rs1, rs2 });
  }

  getInstruction(index) {
    return this.instructions[index];
  }
}

export default Processor;
