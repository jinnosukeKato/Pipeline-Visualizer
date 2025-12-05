class Processor {
  constructor(instructions) {
    this.instructions = instructions || [];
    this.resetProgramCounter();
  }

  getStep() {
    return this.step;
  }

  getPipeline() {
    return this.pipeline;
  }

  incrementStep() {
    this.history.push({
      step: this.step,
      pc: this.pc,
      pipeline: [...this.pipeline],
    });

    this.step++;

    const nextPipeline = [...this.pipeline];

    // WBステージへ移動 (常に進む)
    nextPipeline[4] = this.pipeline[3];

    // ハザード検知 (EXステージとMEMステージの競合)
    const exInstr = this.pipeline[2];
    const memInstr = this.pipeline[3];
    let stall = false;

    if (exInstr && memInstr) {
      stall =
        memInstr.rd &&
        (memInstr.rd === exInstr.rs1 || memInstr.rd === exInstr.rs2);
    }

    if (stall) {
      // ストール発生: MEMステージにバブルを挿入し、後続(EX, ID, IF)は進めない
      nextPipeline[3] = null;
      nextPipeline[2] = this.pipeline[2];
      nextPipeline[1] = this.pipeline[1];
      nextPipeline[0] = this.pipeline[0];
      // PCは進まない
    } else {
      // 通常動作: 各ステージを進める
      nextPipeline[3] = this.pipeline[2];
      nextPipeline[2] = this.pipeline[1];
      nextPipeline[1] = this.pipeline[0];

      // IFステージに新しい命令をフェッチ
      if (this.pc < this.instructions.length) {
        nextPipeline[0] = this.instructions[this.pc];
        this.pc++;
      } else {
        nextPipeline[0] = null;
      }
    }

    this.pipeline = nextPipeline;
  }

  decrementStep() {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      this.step = prevState.step;
      this.pc = prevState.pc;
      this.pipeline = prevState.pipeline;
    }
  }

  resetProgramCounter() {
    this.step = 0;
    this.pc = 0;
    this.pipeline = [null, null, null, null, null];
    this.history = [];
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

  getHazardDetails() {
    const exInstr = this.pipeline[2];
    const memInstr = this.pipeline[3];
    const details = {
      detected: false,
      causes: [], // { stage: 'mem'|'ex', regType: 'rd'|'rs1'|'rs2' }
    };

    if (exInstr && memInstr && memInstr.rd) {
      if (memInstr.rd === exInstr.rs1) {
        details.detected = true;
        details.causes.push({ stage: "mem", regType: "rd" });
        details.causes.push({ stage: "ex", regType: "rs1" });
      }
      if (memInstr.rd === exInstr.rs2) {
        details.detected = true;
        details.causes.push({ stage: "mem", regType: "rd" });
        details.causes.push({ stage: "ex", regType: "rs2" });
      }
    }
    return details;
  }

  checkHazard() {
    return this.getHazardDetails().detected;
  }
}

export default Processor;
