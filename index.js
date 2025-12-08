import Processor from "./core.js";

const processor = new Processor();

const updatePipeline = () => {
  const step = processor.getStep();
  const pipeline = processor.getPipeline();
  const stages = ["IF", "ID", "EX", "MEM", "WB"];

  stages.forEach((stage) => {
    const cell = document.querySelector(
      `.pipeline-grid .cell.${stage.toLowerCase()}`,
    );

    if (cell) {
      const stageObj = pipeline[stage];
      const instr = stageObj ? stageObj.getInstruction() : null;

      if (instr) {
        cell.innerHTML = `<span class="op">${instr.operation}</span> <span class="rd">${instr.rd}</span>, <span class="rs1">${instr.rs1}</span>, <span class="rs2">${instr.rs2}</span>`;
      } else {
        cell.innerHTML = "";
      }
    }
  });

  document.getElementById("currentStep").textContent = step;

  // ハザードのハイライト処理
  const hazardDetails = processor.getPipeline().ID.getHazardDetails();
  if (hazardDetails.detected) {
    hazardDetails.causes.forEach((cause) => {
      const cell = document.querySelector(
        `.pipeline-grid .cell.${cause.stage.toLowerCase()}`,
      );
      if (cell) {
        const span = cell.querySelector(`.${cause.regType}`);
        if (span) {
          span.classList.add("hazard");
        }
      }
    });
  }
};

document
  .getElementById("addInstructionButton")
  .addEventListener("click", () => {
    const operation = document.getElementById("operationInput");
    const rd = document.getElementById("operandInput_1");
    const rs1 = document.getElementById("operandInput_2");
    const rs2 = document.getElementById("operandInput_3");

    if (!operation.value || !rd.value || !rs1.value || !rs2.value) {
      return;
    }

    processor.addInstruction(operation.value, rd.value, rs1.value, rs2.value);

    document.getElementById("instructions").textContent = processor
      .getAllInstructions()
      .map(
        (instr, l) =>
          `${l}: ${instr.operation} ${instr.rd}, ${instr.rs1}, ${instr.rs2}`,
      )
      .join("\n");

    operation.value = "";
    rd.value = "";
    rs1.value = "";
    rs2.value = "";

    processor.resetProgramCounter();
    updatePipeline();
  });

document
  .getElementById("loadHazardExampleButton")
  .addEventListener("click", () => {
    processor.clearInstructions();
    processor.addInstruction("ADD", "R1", "R2", "R3");
    processor.addInstruction("SUB", "R4", "R1", "R5");

    document.getElementById("instructions").textContent = processor
      .getAllInstructions()
      .map(
        (instr, l) =>
          `${l}: ${instr.operation} ${instr.rd}, ${instr.rs1}, ${instr.rs2}`,
      )
      .join("\n");

    updatePipeline();
  });

document.getElementById("nextButton").addEventListener("click", () => {
  processor.incrementStep();
  updatePipeline();
});

document.getElementById("prevButton").addEventListener("click", () => {
  processor.decrementStep();
  updatePipeline();
});

document.getElementById("resetButton").addEventListener("click", () => {
  processor.resetProgramCounter();
  updatePipeline();
});

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowRight":
      processor.incrementStep();
      updatePipeline();
      break;
    case "ArrowLeft":
      processor.decrementStep();
      updatePipeline();
      break;
    case " ":
      event.preventDefault();
      processor.resetProgramCounter();
      updatePipeline();
      break;
  }
});

updatePipeline();
