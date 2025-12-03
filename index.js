let instructions = [];
let currentStep = 0;

document
  .getElementById("addInstructionButton")
  .addEventListener("click", () => {
    const input = document.getElementById("instructionInput");
    const instruction = input.value.trim();

    if (instruction) {
      document.getElementById("instructions").textContent += `${instruction}\n`;
      input.value = "";
    }

    instructions = document
      .getElementById("instructions")
      .textContent.trim()
      .split("\n");

    document.querySelectorAll(".pipeline-grid .cell").forEach((cell, index) => {
      cell.textContent = instructions[currentStep - index] || "";
    });
  });

document.getElementById("nextButton").addEventListener("click", () => {
  currentStep++;
  updatePipeline();
});

document.getElementById("prevButton").addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updatePipeline();
  }
});

document.getElementById("resetButton").addEventListener("click", () => {
  currentStep = 0;
  updatePipeline();
});

const updatePipeline = () => {
  document.querySelectorAll(".pipeline-grid .cell").forEach((cell, index) => {
    cell.textContent = instructions[currentStep - index] || "";
  });

  document.getElementById("currentStep").textContent = currentStep;
};

updatePipeline();
