class Stage {
  constructor(name, nextStage = null, dependStages = null) {
    this.name = name;
    this.instruction = null;
    this.nextStage = nextStage;
    this.dependStages = dependStages || [];
  }

  setInstruction(operation, rd, rs1, rs2) {
    this.instruction = {
      operation,
      rd,
      rs1,
      rs2,
    };
  }

  getInstruction() {
    return this.instruction;
  }

  clear() {
    this.instruction = null;
  }

  advance() {
    if (this.checkDataHazard() === true) {
      return;
    }

    if (this.nextStage && this.instruction) {
      this.nextStage.setInstruction(
        this.instruction.operation,
        this.instruction.rd,
        this.instruction.rs1,
        this.instruction.rs2,
      );
    }
    this.clear();
  }

  checkDataHazard() {
    return this.getHazardDetails().detected;
  }

  getHazardDetails() {
    const details = {
      detected: false,
      causes: [],
    };

    if (!this.instruction) {
      return details;
    }

    for (const dependStage of this.dependStages) {
      const dependInstr = dependStage.instruction;
      if (dependInstr?.rd) {
        if (dependInstr.rd === this.instruction.rs1) {
          details.detected = true;
          details.causes.push({ stage: dependStage.name, regType: "rd" });
          details.causes.push({ stage: this.name, regType: "rs1" });
        }
        if (dependInstr.rd === this.instruction.rs2) {
          details.detected = true;
          details.causes.push({ stage: dependStage.name, regType: "rd" });
          details.causes.push({ stage: this.name, regType: "rs2" });
        }
      }
    }
    return details;
  }
}

class Processor {
  constructor(instructions) {
    this.instructions = instructions || [];
    this.resetProgramCounter();

    this.pipeline = {
      IF: new Stage("IF"),
      ID: new Stage("ID"),
      EX: new Stage("EX"),
      MEM: new Stage("MEM"),
      WB: new Stage("WB"),
    };

    this.pipeline.IF.nextStage = this.pipeline.ID;
    this.pipeline.ID.nextStage = this.pipeline.EX;
    this.pipeline.EX.nextStage = this.pipeline.MEM;
    this.pipeline.MEM.nextStage = this.pipeline.WB;

    this.pipeline.ID.dependStages = [
      this.pipeline.EX,
      this.pipeline.MEM,
      this.pipeline.WB,
    ];
  }

  getStep() {
    return this.step;
  }

  getPipeline() {
    return this.pipeline;
  }

  incrementStep() {
    // 現在のパイプラインの状態をディープコピーして保存
    const pipelineSnapshot = {};
    Object.keys(this.pipeline).forEach((key) => {
      pipelineSnapshot[key] = {
        instruction: this.pipeline[key].instruction
          ? { ...this.pipeline[key].instruction }
          : null,
      };
    });

    this.history.push({
      step: this.step,
      pc: this.pc,
      pipeline: pipelineSnapshot,
    });

    this.step++;

    // パイプラインを後ろから更新する (WB <- MEM <- EX <- ID <- IF)
    const stages = [
      this.pipeline.WB,
      this.pipeline.MEM,
      this.pipeline.EX,
      this.pipeline.ID,
      this.pipeline.IF,
    ];

    for (const stage of stages) {
      stage?.advance();
    }

    // IFステージに新しい命令をフェッチ
    if (this.pc < this.instructions.length) {
      this.pipeline.IF.setInstruction(
        this.instructions[this.pc].operation,
        this.instructions[this.pc].rd,
        this.instructions[this.pc].rs1,
        this.instructions[this.pc].rs2,
      );
      this.pc++;
    } else {
      this.pipeline.IF.clear();
    }
  }

  decrementStep() {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      this.step = prevState.step;
      this.pc = prevState.pc;

      Object.keys(this.pipeline).forEach((stageName) => {
        const savedStage = prevState.pipeline[stageName];
        this.pipeline[stageName].instruction = savedStage.instruction;
      });
    }
  }

  resetProgramCounter() {
    this.step = 0;
    this.pc = 0;
    if (this.pipeline) {
      Object.values(this.pipeline).forEach((stage) => {
        stage.clear();
      });
    }
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
}

export default Processor;
