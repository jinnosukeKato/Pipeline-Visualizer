class Stage {
  constructor(name) {
    this.name = name;
    this.instruction = null;
  }

  setInstruction(operation, rd, rs1, rs2) {
    this.instruction = operation
      ? {
          operation,
          rd,
          rs1,
          rs2,
        }
      : null;
  }

  setInstructionDirect(instruction) {
    this.instruction = instruction;
  }

  getInstruction() {
    return this.instruction;
  }

  clear() {
    this.instruction = null;
  }
}

class HazardUnit {
  detect(pipeline, forwardingEnabled) {
    const details = {
      hazardDetected: false,
      shouldStall: false,
      causes: [],
    };

    this.checkDataHazard(pipeline, forwardingEnabled, details);

    return details;
  }

  checkDataHazard(pipeline, forwardingEnabled, details) {
    const idInstr = pipeline.ID.instruction;
    if (!idInstr) {
      return;
    }

    // 依存する先行命令が存在するかチェックするステージ
    const dependStages = [pipeline.EX, pipeline.MEM];

    for (const dependStage of dependStages) {
      const dependInstr = dependStage.instruction;
      if (!dependInstr || !dependInstr.rd) {
        continue;
      }

      // フォワーディング有効時、チェック対象のステージがMEMの場合は
      // フォワーディングによって解決可能なのでスキップ
      if (forwardingEnabled && dependStage === pipeline.MEM) {
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
  constructor(instructions) {
    this.instructions = instructions || [];
    this.hazardUnit = new HazardUnit();
    this.forwardingEnabled = false;

    this.pipeline = {
      IF: new Stage("IF"),
      ID: new Stage("ID"),
      EX: new Stage("EX"),
      MEM: new Stage("MEM"),
      WB: new Stage("WB"),
    };

    this.resetProgramCounter();
  }

  setForwarding(enabled) {
    this.forwardingEnabled = enabled;
  }

  getCycle() {
    return this.cycle;
  }

  getPipeline() {
    return this.pipeline;
  }

  getHazardDetails() {
    return this.hazardUnit.detect(this.pipeline, this.forwardingEnabled);
  }

  incrementCycle() {
    this.saveHistory(); // 巻き戻しのための履歴保存
    this.cycle++; // 先にサイクルを進める

    // ハザード検出
    const hazardDetails = this.hazardUnit.detect(
      this.pipeline,
      this.forwardingEnabled,
    );

    // 後ろからパイプラインを更新していく
    this.pipeline.WB.setInstructionDirect(this.pipeline.MEM.getInstruction());
    this.pipeline.MEM.setInstructionDirect(this.pipeline.EX.getInstruction());
    if (hazardDetails.shouldStall) {
      this.pipeline.EX.clear();
    } else {
      this.pipeline.EX.setInstructionDirect(this.pipeline.ID.getInstruction());
      this.pipeline.ID.setInstructionDirect(this.pipeline.IF.getInstruction());

      // IFステージの命令フェッチ
      if (this.pc < this.instructions.length) {
        const nextInstr = this.instructions[this.pc];
        this.pipeline.IF.setInstruction(
          nextInstr.operation,
          nextInstr.rd,
          nextInstr.rs1,
          nextInstr.rs2,
        );
        this.pc++;
      } else {
        this.pipeline.IF.clear();
      }
    }
  }

  decrementCycle() {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      this.cycle = prevState.cycle;
      this.pc = prevState.pc;

      Object.keys(this.pipeline).forEach((stageName) => {
        this.pipeline[stageName].setInstructionDirect(
          prevState.pipeline[stageName].instruction,
        );
      });
    }
  }

  saveHistory() {
    const pipelineSnapshot = {};
    Object.keys(this.pipeline).forEach((stageName) => {
      pipelineSnapshot[stageName] = {
        instruction: this.pipeline[stageName].getInstruction(),
      };
    });

    this.history.push({
      cycle: this.cycle,
      pc: this.pc,
      pipeline: pipelineSnapshot,
    });
  }

  resetProgramCounter() {
    this.cycle = 0;
    this.pc = 0;
    this.history = [];
    if (this.pipeline) {
      Object.values(this.pipeline).forEach((stage) => {
        stage.clear();
      });
    }
  }

  addInstruction(operation, rd, rs1, rs2) {
    this.instructions.push({ operation, rd, rs1, rs2 });
  }

  clearInstructions() {
    this.instructions = [];
    this.resetProgramCounter();
  }

  getAllInstructions() {
    return this.instructions;
  }
}

export default Processor;
