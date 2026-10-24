# KeyShot

KeyShot is a **lightweight Windows desktop sound-effects app** built with Tauri 2. It plays a selected effect for each keyboard press, including while the app is unfocused or hidden in the system tray. Tauri uses Windows' WebView2 to render the interface instead of bundling a separate browser engine. The project combines a small native Rust layer with a vanilla HTML, CSS, and JavaScript frontend—no React or Electron.

## Features

- Global keyboard triggers on Windows, including while KeyShot is in the background.
- Eleven selectable effects: Machine Gun, Shotgun 1, Shotgun 2, Suppressed Pistol, Sword Slash, Laser Blaster, Coin Pickup, Power-Up, Cartoon Boing, Mechanical Keyboard, and 8-Bit Jump.
- **Arcade Shuffle** selects among Laser Blaster, Coin Pickup, Power-Up, Cartoon Boing, and 8-Bit Jump. It does not repeat the same effect twice in a row.
- Adjustable volume and an enable/pause control for keyboard-triggered playback.
- Overlapping playback for fast or repeated key presses.
- Settings saved locally between launches.
- Local sound and font assets for offline playback and display.
- System-tray controls for showing or quitting the app.

## Technology stack

| Technology | Role in KeyShot |
| --- | --- |
| **Tauri 2** | Packages the desktop app, creates its window and system tray, and connects the frontend with native functionality. |
| **Rust** | Runs the native application and Windows global keyboard listener. |
| **`rdev`** | Receives global key-press events. KeyShot uses the event to trigger playback; it does not store or transmit the key value. |
| **HTML and CSS** | Define and style the user interface. |
| **Vanilla JavaScript (ES modules)** | Controls sound selection, volume, saved preferences, and local/global keyboard event handling. |
| **WebView2** | Renders the frontend in the Windows desktop window. |
| **Node.js and npm** | Install frontend development tools and run the Tauri CLI. |
| **Python standard library** | Optionally regenerates the original synthesized WAV effects. |

## Download and install

Download the latest Windows release from the [GitHub Releases page](https://github.com/asef-mahir/KeyShot/releases/latest). For most users, choose the **NSIS setup `.exe`**:

1. Download `KeyShot_*_x64-setup.exe` from the release assets.
2. Double-click it and follow the installer prompts.
3. Launch KeyShot from the Windows Start menu.

The MSI installer is an alternative for users or organizations that prefer Windows Installer packages. To uninstall KeyShot, open **Settings → Apps → Installed apps**, find **KeyShot**, and select **Uninstall**.

### Tray behavior

Clicking the window’s **X** hides KeyShot in the system tray; it does not exit the app. Choose **Show KeyShot** to reopen the window or **Quit KeyShot** to exit completely.

## Using KeyShot

1. Choose an individual sound or **Arcade Shuffle** from the sound-effect selector.
2. Adjust the output volume and enable keyboard sounds.
3. Press **TEST SOUND** to check the current selection. This button also works while keyboard sounds are paused.
4. Press any key to play the selected effect. Global keyboard triggers continue while KeyShot is unfocused or hidden in the tray.

Sound selection, volume, and enabled state are stored locally in the WebView. KeyShot does not save or transmit the keys you press.

## Run from source

### Development requirements

- Windows with the Microsoft WebView2 Runtime.
- Node.js and npm.
- Rust with the Windows MSVC target.
- Visual Studio C++ Build Tools and the Windows SDK.
- Python is optional and only needed to regenerate synthesized sounds.

From the project root, install the npm dependencies and run the development app:

```powershell
npm install
npm run tauri dev
```

Build Windows MSI and NSIS installers with:

```powershell
npm run tauri build
```

Build output is written under `src-tauri/target/release/bundle/`.

## Sound assets and font

Run the sound generator from the project root to regenerate the synthesized game-style WAV files:

```powershell
python scripts/generate_sound_effects.py
```

Generated WAV files are written to `src/assets/sounds/`. The downloaded audio files are also bundled locally; retain any attribution or license terms required by their original sources when redistributing them.

KeyShot bundles the Orbitron font for offline use. Its SIL Open Font License is included at `src/assets/fonts/OFL.txt`.
