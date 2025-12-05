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
    for (const dependStage of this.dependStages) {
      if (
        this.instruction &&
        dependStage.instruction &&
        dependStage.instruction.rd
      ) {
        if (
          dependStage.instruction.rd === this.instruction.rs1 ||
          dependStage.instruction.rd === this.instruction.rs2
        ) {
          return true;
        }
      }
    }
    return false;
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

  getHazardDetails() {
    const idInstr = this.pipeline.ID.instruction;
    const details = {
      detected: false,
      causes: [], // { stage: 'mem'|'ex'|'wb'|'id', regType: 'rd'|'rs1'|'rs2' }
    };

    if (!idInstr) {
      return details;
    }

    const dependStages = [
      this.pipeline.EX,
      this.pipeline.MEM,
      this.pipeline.WB,
    ];

    for (const stage of dependStages) {
      const instr = stage.instruction;
      if (instr?.rd) {
        if (instr.rd === idInstr.rs1) {
          details.detected = true;
          details.causes.push({ stage: stage.name, regType: "rd" });
          details.causes.push({ stage: "ID", regType: "rs1" });
        }

        if (instr.rd === idInstr.rs2) {
          details.detected = true;
          details.causes.push({ stage: stage.name, regType: "rd" });
          details.causes.push({ stage: "ID", regType: "rs2" });
        }
      }
    }
    return details;
  }

  checkHazard() {
    if (this.pipeline.ID.checkDataHazard()) {
      alert("Data hazard detected!");
    }
    return this.getHazardDetails().detected;
  }
}

export default Processor;
