import Processor from "./core.js";

const processor = new Processor();

const updatePipeline = () => {
  const step = processor.getStep();
  const pipeline = processor.getPipeline();
  const stages = ["if", "id", "ex", "mem", "wb"];

  stages.forEach((stage, index) => {
    const cell = document.querySelector(`.pipeline-grid .cell.${stage}`);

    if (cell) {
      const instr = pipeline[index];
      cell.textContent = instr
        ? `${instr.operation} ${instr.rd}, ${instr.rs1}, ${instr.rs2}`
        : "";
    }
  });

  document.getElementById("currentStep").textContent = step;
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

    const instruction =
      `${operation.value} ${rd.value}, ${rs1.value}, ${rs2.value}`.trim();

    document.getElementById("instructions").textContent += `${instruction}\n`;

    processor.addInstruction(operation.value, rd.value, rs1.value, rs2.value);

    operation.value = "";
    rd.value = "";
    rs1.value = "";
    rs2.value = "";

    processor.resetProgramCounter();
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

updatePipeline();
