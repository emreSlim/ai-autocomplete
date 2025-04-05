const serverURL = "http://localhost:3000/suggest";

console.log("Autocomplete extension loaded 🚀");

let abortController = null;

async function fetchSuggestion(inputValue) {
  if (abortController) {
    abortController.abort(); // Cancel the previous request
  }
  abortController = new AbortController();
  const signal = abortController.signal;  
  const res = await fetch(serverURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input: inputValue }),
    signal: signal
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.suggestion;
}


const DEBOUNCE_DELAY = 700; // milliseconds
let timeout = null;


const clearTimeoutCustom = () => {
  if(timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
}

async function handleInput(target){
  const currentValue = target.value;
  if (currentValue.length < 5 || 
    !currentValue.endsWith(" ")
  ) return; // Minimum length for suggestion

  const suggestion = await fetchSuggestion(currentValue);

  if (document.activeElement !== target) return;
  if (!suggestion) return;

  target.value += suggestion;
  target.setSelectionRange(currentValue.length, target.value.length); 
}

document.addEventListener(
  "input",
  (event) => {
    const target = event.target;
    if (target.tagName === "TEXTAREA" || (target.tagName === "INPUT" && (target.type == "text" || target.type == "search"))) {
      
      //remove blur event listener if it exists
      target.removeEventListener("blur", clearTimeoutCustom);
      clearTimeoutCustom();

      timeout = setTimeout(() => {
        timeout = null;
        handleInput(target).catch(console.error);
        //remove  blur event listener
        target.removeEventListener("blur", clearTimeoutCustom);
      }, DEBOUNCE_DELAY); 

      target.addEventListener("blur", clearTimeoutCustom, { once: true });
    }
  }
);

