import Processor from "./core.js";

const processor = new Processor();

const updatePipeline = () => {
  const pc = processor.getProgramCounter();

  document.querySelectorAll(".pipeline-grid .cell").forEach((cell, index) => {
    cell.textContent = processor.getInstruction(pc - index) || "";
  });

  document.getElementById("currentStep").textContent = pc;
};

document
  .getElementById("addInstructionButton")
  .addEventListener("click", () => {
    const operation = document.getElementById("operationInput");
    const operand1 = document.getElementById("operandInput_1");
    const operand2 = document.getElementById("operandInput_2");
    const operand3 = document.getElementById("operandInput_3");

    const instruction = `${operation.value} ${operand1.value}, ${operand2.value}, ${operand3.value}`.trim();

    if (instruction) {
      operation.value = "";
      operand1.value = "";
      operand2.value = "";
      operand3.value = "";
      document.getElementById("instructions").textContent += `${instruction}\n`;
      processor.addInstruction(instruction);
    }

    processor.resetProgramCounter();
    updatePipeline();
  });

document.getElementById("nextButton").addEventListener("click", () => {
  processor.incrimentProgramCounter();
  updatePipeline();
});

document.getElementById("prevButton").addEventListener("click", () => {
  processor.decrimentProgramCounter();
  updatePipeline();
});

document.getElementById("resetButton").addEventListener("click", () => {
  processor.resetProgramCounter();
  updatePipeline();
});

updatePipeline();
