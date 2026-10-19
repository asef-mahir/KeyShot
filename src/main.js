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
    shotgun2 : "assets/sounds/shotgun_2.mp3",
    pistol : "assets/sounds/pistol_shot.wav",
    suppressed : "assets/sounds/suppressed_shot.wav",
    knife : "assets/sounds/sword-slash.mp3",
    laser : "assets/sounds/laser_blast.wav",
    coin : "assets/sounds/coin_pickup.wav",
    powerup : "assets/sounds/power_up.wav",
    boing : "assets/sounds/cartoon_boing.wav",
    levelup : "assets/sounds/level_up.wav",
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
