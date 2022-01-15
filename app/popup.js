// Initialize button with user's preferred color
let page = document.getElementById("body");
let selectedClassName = "current";
const presetButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];

// When the button is clicked, inject setPageBackgroundColor into current page
async function setBgColor() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setPageBackgroundColor,
    });
}

function handleButtonClick(event) {
    // Remove styling from the previously selected color
    let current = event.target.parentElement.querySelector(
        `.${selectedClassName}`
    );
    if (current && current !== event.target) {
        current.classList.remove(selectedClassName);
    }

    // Mark the button as selected
    let color = event.target.id === "html5colorpicker" ? event.target.value : event.target.dataset.color;
    event.target.classList.add(selectedClassName);
    chrome.storage.sync.set({ color });
    setBgColor()
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
    chrome.storage.sync.get("color", (data) => {
        let currentColor = data.color;
        // For each color we were provided…
        for (let buttonColor of buttonColors) {
            // …create a button with that color…
            let button = document.createElement("button");
            button.dataset.color = buttonColor;
            button.style.backgroundColor = buttonColor;

            // …mark the currently selected color…
            if (buttonColor === currentColor) {
                button.classList.add(selectedClassName);
            }

            // …and register a listener for when that button is clicked
            button.addEventListener("click", handleButtonClick);
            page.appendChild(button);
        }
    });
    let colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.id = "html5colorpicker";
    colorPicker.onchange = "";
    colorPicker.value = "#ff0000";
    colorPicker.addEventListener("change", handleButtonClick);
    page.appendChild(colorPicker);
}

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
}

// Initialize the page by constructing the color options
constructOptions(presetButtonColors);