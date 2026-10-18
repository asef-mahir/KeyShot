const { listen } = window.__TAURI__.event;

const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const testFireButton = document.getElementById("test-fire");
const weaponSelector = document.getElementById("weapon");
const enabledCheckbox = document.getElementById("enabled");
const statusIndicator = document.getElementById("status");
const statusText = document.getElementById("status-text");
const settingsStorageKey = "keyshot-settings";

//Mapping sound path for each weapon
const weapons = {
    machinegun : "assets/sounds/machine_gun1.mp3",
    shotgun1 : "assets/sounds/shotgun_1.wav",
    shotgun2 : "assets/sounds/shotgun_2.mp3"
}

function loadSettings(){
    const defaults = {
        weapon: weaponSelector.value,
        volume: Number(volumeSlider.value),
        enabled: enabledCheckbox.checked
    };

    try {
        const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) ?? "{}") ?? {};

        return {
            weapon: Object.keys(weapons).includes(savedSettings.weapon)
                ? savedSettings.weapon
                : defaults.weapon,
            volume: Number.isFinite(savedSettings.volume)
                ? Math.min(100, Math.max(0, savedSettings.volume))
                : defaults.volume,
            enabled: typeof savedSettings.enabled === "boolean"
                ? savedSettings.enabled
                : defaults.enabled
        };
    } catch (error) {
        console.warn("Could not load saved settings; using defaults.", error);
        return defaults;
    }
}

function saveSettings(){
    const settings = {
        weapon: selectedWeapon,
        volume: Number(volumeSlider.value),
        enabled: isEnabled
    };

    try {
        localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    } catch (error) {
        console.warn("Could not save settings.", error);
    }
}

// Restore saved values, falling back to the HTML defaults on first launch.
const settings = loadSettings();
weaponSelector.value = settings.weapon;
volumeSlider.value = String(settings.volume);
volumeValue.textContent = `${settings.volume}%`;
enabledCheckbox.checked = settings.enabled;

let selectedWeapon = settings.weapon;
let isEnabled = settings.enabled;

function updateStatus(){
    statusText.textContent = isEnabled ? "ACTIVE" : "PAUSED";
    statusIndicator.classList.toggle("is-paused", !isEnabled);
}

updateStatus();

function playGunShot(weaponKey){
    const soundpath = weapons[weaponKey];

    if(!soundpath){
        console.error(`Sound file for weapon ${weaponKey} not found.`);
        return;
    }
    const gunshot = new Audio(soundpath);
    gunshot.volume = volumeSlider.value / 100;
    gunshot.play();
}     

function triggerSound(){
    playGunShot(selectedWeapon);
}

// Both keyboard sources use the same enabled-state check.
function triggerKeyboardSound(){
    if (isEnabled) {
        triggerSound();
    }
}

enabledCheckbox.addEventListener("change", function(){
    isEnabled = enabledCheckbox.checked;
    updateStatus();
    saveSettings();
});

// Handle keys while the KeyShot page has keyboard focus.
document.addEventListener("keydown", triggerKeyboardSound);

// Handle global keys only while the KeyShot page is unfocused.
await listen("keyshot-keypress", () => {
    if (!document.hasFocus()) {
        triggerKeyboardSound();
    }
});

volumeSlider.addEventListener("input", function(){
    volumeValue.textContent = `${volumeSlider.value}%`;
});

// Persist once the user commits the slider value, rather than on each drag update.
volumeSlider.addEventListener("change", saveSettings);

testFireButton.addEventListener("click", triggerSound)

weaponSelector.addEventListener("change", function(event){
    selectedWeapon = event.target.value;
    saveSettings();
});