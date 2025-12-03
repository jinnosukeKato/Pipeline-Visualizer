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
    const input = document.getElementById("instructionInput");
    const instruction = input.value.trim();

    if (instruction) {
      document.getElementById("instructions").textContent += `${instruction}\n`;
      input.value = "";
    }

    const instructions = document
      .getElementById("instructions")
      .textContent.trim()
      .split("\n");

    processor.resetProgramCounter();
    processor.instructions = instructions;
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
