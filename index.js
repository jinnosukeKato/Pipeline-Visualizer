import Processor from "./core.js";

const processor = new Processor();

const updatePipeline = () => {
  const cycle = processor.cycle;
  const pipeline = processor.pipeline;
  const stages = ["IF", "ID", "EX", "MEM", "WB"];

  stages.forEach((stage) => {
    const cell = document.getElementById(`stage-${stage.toLowerCase()}`);

    if (cell) {
      cell.classList.remove("hazard-cell");
      const stageObj = pipeline[stage];
      const instr = stageObj ? stageObj.instruction : null;

      if (instr) {
        if (instr.operation === "NOP") {
          cell.innerHTML = `<span class="op">NOP</span>`;
        } else {
          cell.innerHTML = `<span class="op">${instr.operation}</span> <span class="rd">${instr.rd}</span>, <span class="rs1">${instr.rs1}</span>, <span class="rs2">${instr.rs2}</span>`;
        }
      } else {
        cell.innerHTML = "";
      }
    }
  });

  document.getElementById("currentCycle").textContent = cycle;

  // ハザードのハイライト処理
  const hazardDetails = processor.hazardDetails;
  if (hazardDetails.hazardDetected) {
    hazardDetails.causes.forEach((cause) => {
      const cell = document.getElementById(
        `stage-${cause.stage.toLowerCase()}`,
      );
      if (cell) {
        cell.classList.add("hazard-cell");
        const span = cell.querySelector(`.${cause.regType}`);
        if (span) {
          span.classList.add("hazard");
        }
      }
    });
  }
};

// NOP命令選択時にオペランド入力を無効化
document.getElementById("operationInput").addEventListener("change", (e) => {
  const isNOP = e.target.value === "NOP";
  document.getElementById("operandInput_1").disabled = isNOP;
  document.getElementById("operandInput_2").disabled = isNOP;
  document.getElementById("operandInput_3").disabled = isNOP;
});

document
  .getElementById("addInstructionButton")
  .addEventListener("click", () => {
    const op_input = document.getElementById("operationInput");
    const rd_input = document.getElementById("operandInput_1");
    const rs1_input = document.getElementById("operandInput_2");
    const rs2_input = document.getElementById("operandInput_3");

    // NOP以外の命令でオペランドが未指定の場合は追加しない
    if (
      op_input.value !== "NOP" &&
      (!rd_input.value || !rs1_input.value || !rs2_input.value)
    ) {
      return;
    }

    if (op_input.value === "NOP") {
      processor.addInstruction({
        operation: "NOP",
        rd: null,
        rs1: null,
        rs2: null,
      });
    } else {
      processor.addInstruction({
        operation: op_input.value,
        rd: rd_input.value,
        rs1: rs1_input.value,
        rs2: rs2_input.value,
      });
    }

    document.getElementById("instructions").textContent = processor.instructions
      .map((instr, l) => {
        if (instr.operation === "NOP") {
          return `${l}: NOP`;
        }

        return `${l}: ${instr.operation} ${instr.rd}, ${instr.rs1}, ${instr.rs2}`;
      })
      .join("\n");

    op_input.value = "";
    rd_input.value = "";
    rs1_input.value = "";
    rs2_input.value = "";

    rd_input.disabled = false;
    rs1_input.disabled = false;
    rs2_input.disabled = false;

    processor.reset();
    updatePipeline();
  });

document
  .getElementById("clearInstructionsButton")
  .addEventListener("click", () => {
    processor.clearInstructions();
    document.getElementById("instructions").textContent = "";
    updatePipeline();
  });

document
  .getElementById("loadHazardExampleButton")
  .addEventListener("click", () => {
    processor.clearInstructions();
    processor.addInstruction({
      operation: "ADD",
      rd: "R1",
      rs1: "R2",
      rs2: "R3",
    });
    processor.addInstruction({
      operation: "SUB",
      rd: "R4",
      rs1: "R1",
      rs2: "R5",
    });

    document.getElementById("instructions").textContent = processor.instructions
      .map(
        (instr, l) =>
          `${l}: ${instr.operation} ${instr.rd}, ${instr.rs1}, ${instr.rs2}`,
      )
      .join("\n");

    updatePipeline();
  });

document.getElementById("nextButton").addEventListener("click", () => {
  processor.incrementCycle();
  updatePipeline();
});

document.getElementById("prevButton").addEventListener("click", () => {
  processor.decrementCycle();
  updatePipeline();
});

document.getElementById("resetButton").addEventListener("click", () => {
  processor.reset();
  updatePipeline();
});

document.getElementById("forwardingToggle").addEventListener("change", (e) => {
  processor.forwardingEnabled = e.target.checked;
  updatePipeline();
});

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowRight":
      processor.incrementCycle();
      updatePipeline();
      break;
    case "ArrowLeft":
      processor.decrementCycle();
      updatePipeline();
      break;
    case " ":
      event.preventDefault();
      processor.reset();
      updatePipeline();
      break;
  }
});

updatePipeline();
