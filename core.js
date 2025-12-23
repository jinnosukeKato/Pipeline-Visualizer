class Stage {
  #instruction = null;
  #name = "";

  constructor(name) {
    this.#name = name;
    this.#instruction = null;
  }

  get name() {
    return this.#name;
  }

  set instruction(instr) {
    this.#instruction =
      instr?.operation !== undefined
        ? {
            operation: instr.operation,
            rd: instr.rd,
            rs1: instr.rs1,
            rs2: instr.rs2,
          }
        : null;
  }

  get instruction() {
    return this.#instruction;
  }

  passInstructionTo(stage) {
    stage.instruction = this.#instruction;
    this.clear();
  }

  clear() {
    this.#instruction = null;
  }
}

class HazardUnit {
  #pipeline = null;

  constructor(pipeline) {
    this.#pipeline = pipeline;
  }

  detect(forwardingEnabled) {
    const details = {
      hazardDetected: false,
      shouldStall: false,
      causes: [],
    };

    this.checkDataHazard(forwardingEnabled, details);

    return details;
  }

  checkDataHazard(forwardingEnabled, details) {
    const idInstr = this.#pipeline.ID.instruction;
    if (!idInstr) {
      return;
    }

    // 依存する先行命令が存在するかチェックするステージ
    const dependStages = [this.#pipeline.EX, this.#pipeline.MEM];

    for (const dependStage of dependStages) {
      const dependInstr = dependStage.instruction;
      if (!dependInstr || !dependInstr.rd) {
        continue;
      }

      // フォワーディング有効時、チェック対象のステージがMEMの場合は
      // フォワーディングによって解決可能なのでスキップ
      if (forwardingEnabled && dependStage === this.#pipeline.MEM) {
        continue;
      }

      let hazardFound = false;

      // RS1 との競合チェック
      if (dependInstr.rd === idInstr.rs1) {
        details.causes.push({ stage: dependStage.name, regType: "rd" });
        details.causes.push({ stage: "ID", regType: "rs1" });
        hazardFound = true;
      }

      // RS2 との競合チェック
      if (dependInstr.rd === idInstr.rs2) {
        details.causes.push({ stage: dependStage.name, regType: "rd" });
        details.causes.push({ stage: "ID", regType: "rs2" });
        hazardFound = true;
      }

      if (hazardFound) {
        details.hazardDetected = true;
        details.shouldStall = true;
      }
    }
  }
}

class Processor {
  #cycle = 0;
  #pc = 0;
  #history = [];
  #pipeline = {
    IF: new Stage("IF"),
    ID: new Stage("ID"),
    EX: new Stage("EX"),
    MEM: new Stage("MEM"),
    WB: new Stage("WB"),
  };
  #hazardUnit = new HazardUnit(this.#pipeline);
  #instructions = [];

  forwardingEnabled = false;

  get cycle() {
    return this.#cycle;
  }

  get hazardDetails() {
    return this.#hazardUnit.detect(this.forwardingEnabled);
  }

  get pipeline() {
    return this.#pipeline;
  }

  incrementCycle() {
    this.#saveHistory(); // 巻き戻しのための履歴保存
    this.#cycle++; // 先にサイクルを進める

    // ハザード検出
    const hazardDetails = this.#hazardUnit.detect(this.forwardingEnabled);

    // 後ろからパイプラインを更新していく
    this.#pipeline.MEM.passInstructionTo(this.#pipeline.WB);
    this.#pipeline.EX.passInstructionTo(this.#pipeline.MEM);

    if (!hazardDetails.shouldStall) {
      this.#pipeline.ID.passInstructionTo(this.#pipeline.EX);
      this.#pipeline.IF.passInstructionTo(this.#pipeline.ID);

      // IFステージの命令フェッチ
      if (this.#pc < this.#instructions?.length) {
        const nextInstr = this.#instructions[this.#pc];
        this.#pipeline.IF.instruction = nextInstr;
        this.#pc++;
      } else {
        this.#pipeline.IF.clear();
      }
    }
  }

  decrementCycle() {
    if (this.#history.length > 0) {
      const prevState = this.#history.pop();
      this.#cycle = prevState.cycle;
      this.#pc = prevState.pc;

      Object.values(this.#pipeline).forEach((stage) => {
        stage.instruction = prevState.pipeline[stage.name].instruction;
      });
    }
  }

  #saveHistory() {
    const pipelineSnapshot = {};
    Object.keys(this.#pipeline).forEach((stageName) => {
      pipelineSnapshot[stageName] = {
        instruction: this.#pipeline[stageName].instruction,
      };
    });

    this.#history.push({
      cycle: this.#cycle,
      pc: this.#pc,
      pipeline: pipelineSnapshot,
    });
  }

  reset() {
    this.#cycle = 0;
    this.#pc = 0;
    this.#history = [];
    if (this.#pipeline) {
      Object.values(this.#pipeline).forEach((stage) => {
        stage.clear();
      });
    }
  }

  addInstruction(instruction) {
    this.#instructions.push(instruction);
  }

  clearInstructions() {
    this.#instructions = [];
    this.reset();
  }

  get instructions() {
    return this.#instructions;
  }
}

export default Processor;
