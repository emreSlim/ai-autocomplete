const serverURL = "http://localhost:3000/suggest";

console.log("Autocomplete extension loaded 🚀");

let abortController = null;

const fetchSuggestion = async (inputValue) => {
  abortController = new AbortController();
  const signal = abortController.signal;
  const res = await fetch(serverURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: inputValue }),
    signal: signal,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.suggestion;
};

const DEBOUNCE_DELAY = 1000; // milliseconds
let timeout = null;

const cleanup = () => {
  if (abortController) {
    abortController.abort(); // Cancel the previous request
    abortController = null;
  }

  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

let currentInputElement = null;

function setupKeydownListener() {
  // accept next word and leave the rest selected only if some text is selected
  const handleArrowRight = (target) => {
    const currentValue = target.value;

    if (target.selectionStart !== target.selectionEnd) {
      // If some text is selected, accept the next word and leave the rest selected

      const selectedText = currentValue.substring(target.selectionStart);
      const nextWord = selectedText.split(" ")[0];

      target.selectionStart += nextWord.length + 1; // Move the cursor to the end of the next word
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.target === currentInputElement) {
      if (event.key === "ArrowRight") {
        event.preventDefault(); // Prevent the default behavior of ArrowRight

        handleArrowRight(event.target); // Accept the next word and leave the rest selected
      }
    }
  });
}

function setupInputListener() {
  const handleInput = async (target) => {
    const currentValue = target.value;
    if (currentValue.length < 5 || !/\s$/.test(currentValue)) return; // Minimum length for suggestion

    const suggestion = await fetchSuggestion(currentValue);

    if (document.activeElement !== target) return;
    if (!suggestion) return;

    target.value += suggestion;

    target.setSelectionRange(currentValue.length, target.value.length);
  };

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (
      target.tagName === "TEXTAREA" ||
      (target.tagName === "INPUT" &&
        (target.type == "text" || target.type == "search"))
    ) {
      currentInputElement = target; // Store the current input element
      // cleanup
      cleanup();

      //set a new timeout
      timeout = setTimeout(() => {
        handleInput(target).catch(console.error);
      }, DEBOUNCE_DELAY);

      // Add a blur event listener to clean up when the input loses focus
      target.addEventListener("blur", cleanup, { once: true });
    }
  });
}

setupInputListener();
setupKeydownListener();