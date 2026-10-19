const { listen } = window.__TAURI__.event;

const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const testFireButton = document.getElementById("test-fire");
const weaponSelector = document.getElementById("weapon");
const weaponTrigger = document.getElementById("weapon-trigger");
const weaponOptionsList = document.getElementById("weapon-options");
const selectedWeaponLabel = document.getElementById("selected-weapon");
const soundPicker = document.getElementById("sound-picker");
const enabledCheckbox = document.getElementById("enabled");
const statusIndicator = document.getElementById("status");
const statusText = document.getElementById("status-text");
const settingsStorageKey = "keyshot-settings";
const arcadeShuffleKey = "arcadeShuffle";
const arcadeSounds = ["laser", "coin", "powerup", "boing", "jump"];

//Mapping sound path for each weapon
const weapons = {
    machinegun : "assets/sounds/machine_gun1.mp3",
    shotgun1 : "assets/sounds/shotgun_1.wav",
    shotgun2 : "assets/sounds/shotgun_2.mp3",
    suppressed : "assets/sounds/suppressed_shot.wav",
    knife : "assets/sounds/sword-slash.mp3",
    laser : "assets/sounds/laser_blast.wav",
    coin : "assets/sounds/coin_pickup.wav",
    powerup : "assets/sounds/power_up.wav",
    boing : "assets/sounds/cartoon_boing.wav",
    keyboard : "assets/sounds/mechanical_key.mp3",
    jump : "assets/sounds/arcade_jump.wav"
}

function createAudioVoice(soundpath){
    const audio = new Audio(soundpath);
    audio.preload = "auto";
    audio.load();
    return { audio, busy: false };
}

// Start loading each local sound before the first key press.
const audioVoices = Object.fromEntries(
    Object.entries(weapons).map(([weaponKey, soundpath]) => [
        weaponKey,
        [createAudioVoice(soundpath)]
    ])
);

// Build the visible list from the native select so there is still one source of sound IDs.
const weaponOptionElements = Array.from(weaponSelector.options, (nativeOption, index) => {
    const option = document.createElement("div");
    option.id = `sound-option-${index}`;
    option.className = "sound-option";
    option.dataset.value = nativeOption.value;
    option.textContent = nativeOption.textContent;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.addEventListener("click", () => chooseWeapon(nativeOption.value));
    weaponOptionsList.append(option);
    return option;
});

let activeWeaponOptionIndex = 0;

function syncWeaponPicker(){
    selectedWeaponLabel.textContent = weaponSelector.selectedOptions[0]?.textContent ?? "";
    weaponOptionElements.forEach(option => {
        option.setAttribute("aria-selected", String(option.dataset.value === weaponSelector.value));
    });
}

function setActiveWeaponOption(index){
    activeWeaponOptionIndex = (index + weaponOptionElements.length) % weaponOptionElements.length;
    const activeOption = weaponOptionElements[activeWeaponOptionIndex];

    weaponOptionElements.forEach((option, optionIndex) => {
        option.classList.toggle("is-active", optionIndex === activeWeaponOptionIndex);
    });
    weaponTrigger.setAttribute("aria-activedescendant", activeOption.id);
    activeOption.scrollIntoView({ block: "nearest" });
}

function openWeaponPicker(){
    if (!weaponOptionsList.hidden) return;

    weaponOptionsList.hidden = false;
    weaponTrigger.setAttribute("aria-expanded", "true");
    const selectedIndex = weaponOptionElements.findIndex(
        option => option.dataset.value === weaponSelector.value
    );
    setActiveWeaponOption(Math.max(0, selectedIndex));
}

function closeWeaponPicker(){
    weaponOptionsList.hidden = true;
    weaponTrigger.setAttribute("aria-expanded", "false");
    weaponTrigger.removeAttribute("aria-activedescendant");
    weaponOptionElements.forEach(option => option.classList.remove("is-active"));
}

function chooseWeapon(weaponKey){
    weaponSelector.value = weaponKey;
    weaponSelector.dispatchEvent(new Event("change", { bubbles: true }));
    closeWeaponPicker();
    weaponTrigger.focus();
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
            weapon: [...Object.keys(weapons), arcadeShuffleKey].includes(savedSettings.weapon)
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
syncWeaponPicker();
volumeSlider.value = String(settings.volume);
volumeValue.textContent = `${settings.volume}%`;
enabledCheckbox.checked = settings.enabled;

let selectedWeapon = settings.weapon;
let isEnabled = settings.enabled;
let lastArcadeSound = null;

function updateStatus(){
    statusText.textContent = isEnabled ? "ACTIVE" : "PAUSED";
    statusIndicator.classList.toggle("is-paused", !isEnabled);
}

updateStatus();

weaponTrigger.addEventListener("click", function(){
    if (weaponOptionsList.hidden) {
        openWeaponPicker();
    } else {
        closeWeaponPicker();
    }
});

weaponTrigger.addEventListener("keydown", function(event){
    const isOpen = !weaponOptionsList.hidden;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen) {
            openWeaponPicker();
        } else {
            setActiveWeaponOption(activeWeaponOptionIndex + (event.key === "ArrowDown" ? 1 : -1));
        }
    } else if (event.key === "Home" && isOpen) {
        event.preventDefault();
        setActiveWeaponOption(0);
    } else if (event.key === "End" && isOpen) {
        event.preventDefault();
        setActiveWeaponOption(weaponOptionElements.length - 1);
    } else if ((event.key === "Enter" || event.key === " ") && isOpen) {
        event.preventDefault();
        chooseWeapon(weaponOptionElements[activeWeaponOptionIndex].dataset.value);
    } else if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closeWeaponPicker();
    } else if (event.key === "Tab" && isOpen) {
        closeWeaponPicker();
    }
});

document.addEventListener("pointerdown", function(event){
    if (!soundPicker.contains(event.target)) {
        closeWeaponPicker();
    }
});

function playGunShot(weaponKey){
    const voices = audioVoices[weaponKey];

    if(!voices){
        console.error(`Sound file for weapon ${weaponKey} not found.`);
        return;
    }

    // Reuse a loaded player when possible; add another voice if sounds overlap.
    const voice = voices.find(candidate => !candidate.busy)
        ?? createAudioVoice(weapons[weaponKey]);
    if (!voices.includes(voice)) {
        voices.push(voice);
    }

    voice.busy = true;
    voice.audio.currentTime = 0;
    voice.audio.volume = volumeSlider.value / 100;

    const releaseVoice = () => {
        voice.busy = false;
        voice.audio.removeEventListener("ended", releaseVoice);
    };
    voice.audio.addEventListener("ended", releaseVoice, { once: true });
    voice.audio.play().catch(error => {
        releaseVoice();
        console.error("Could not play sound:", error);
    });
}     

function triggerSound(){
    if (selectedWeapon !== arcadeShuffleKey) {
        playGunShot(selectedWeapon);
        return;
    }

    // Choose uniformly from the arcade set, avoiding the last effect if possible.
    const availableSounds = lastArcadeSound === null
        ? arcadeSounds
        : arcadeSounds.filter(sound => sound !== lastArcadeSound);
    const randomIndex = Math.floor(Math.random() * availableSounds.length);
    lastArcadeSound = availableSounds[randomIndex];
    playGunShot(lastArcadeSound);
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
    syncWeaponPicker();
    saveSettings();
});
