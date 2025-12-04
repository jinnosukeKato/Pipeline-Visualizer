class Processor {
  constructor(instructions) {
    this.instructions = instructions || [];
    this.resetProgramCounter();
  }

  getStep() {
    return this.step;
  }

  getPipeline() {
    const pipeline = [];
    for (let i = 0; i < 5; i++) {
      const instrIdx = this.step - 1 - i;
      if (0 <= instrIdx && instrIdx < this.instructions.length) {
        pipeline[i] = this.instructions[instrIdx];
      } else {
        pipeline[i] = null;
      }
    }
    return pipeline;
  }

  incrementStep() {
    this.step++;
  }

  decrementStep() {
    if (this.step > 0) {
      this.step--;
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
}

export default Processor;
