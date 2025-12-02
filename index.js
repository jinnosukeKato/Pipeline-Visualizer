document
  .getElementById("addInstructionButton")
  .addEventListener("click", () => {
    const input = document.getElementById("instructionInput");
    const instruction = input.value.trim();

    if (instruction) {
      document.getElementById("instructions").textContent += `${instruction}\n`;
      input.value = "";
    }
  });
