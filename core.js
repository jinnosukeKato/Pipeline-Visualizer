class Processor {
  constructor(instructions) {
    this.instructions = instructions || [];
    this.resetProgramCounter();
    this.pipeline = [];
  }

  getStep() {
    return this.step;
  }

  getPipeline() {
    return this.pipeline;
  }

  incrementStep() {
    this.step++;

    for (let i = 0; i < 5; i++) {
      const instrIdx = this.step - 1 - i;
      if (0 <= instrIdx && instrIdx < this.instructions.length) {
        this.pipeline[i] = this.instructions[instrIdx];
      } else {
        this.pipeline[i] = null;
      }
    }
  }

  decrementStep() {
    if (this.step > 0) {
      this.step--;

      for (let i = 0; i < 5; i++) {
        const instrIdx = this.step - 1 - i;
        if (0 <= instrIdx && instrIdx < this.instructions.length) {
          this.pipeline[i] = this.instructions[instrIdx];
        } else {
          this.pipeline[i] = null;
        }
      }
    }
  }

  resetProgramCounter() {
    this.step = 0;
  }

  addInstruction(operation, rd, rs1, rs2) {
    this.instructions.push({ operation, rd, rs1, rs2 });
  }

  getInstruction(index) {
    return this.instructions[index];
  }

  getAllInstructions() {
    return this.instructions;
  }
}

export default Processor;
