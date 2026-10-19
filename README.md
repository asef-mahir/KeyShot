# KeyShot

KeyShot is a Windows desktop sound-effects app that plays a selected sound whenever a key is pressed. It can keep running from the system tray while you use other apps.

## Download and install

Download the latest Windows installer from the [GitHub Releases page](https://github.com/asef-mahir/KeyShot/releases/latest). For most users, choose the **NSIS setup `.exe`**:

1. Download `KeyShot_*_x64-setup.exe` from the release assets.
2. Double-click the downloaded file and follow the installer prompts.
3. Launch KeyShot from the Windows Start menu.

The MSI installer is an alternative for users or organizations that prefer Windows Installer packages.

To uninstall KeyShot, open **Settings → Apps → Installed apps**, find **KeyShot**, and select **Uninstall**.

## Using KeyShot

- Choose a sound effect from the selector, or choose **Arcade Shuffle** to randomly play one of five game-style effects. Shuffle avoids repeating the same effect twice in a row.
- Set the output volume and enable or pause keyboard-triggered sounds.
- Press **TEST SOUND** to hear the selected effect. Test Sound still works while keyboard sounds are paused.
- Press any key to trigger the selected effect. Global keyboard input also works while KeyShot is unfocused or hidden in the tray.
- Clicking the window's **X** hides KeyShot in the system tray; it does not exit the app. Choose **Quit KeyShot** from the tray menu to exit.

KeyShot handles key presses locally to trigger audio. It does not save or transmit the keys you press. Sound selection, volume, and enabled state are stored locally on the computer.

## Sound effects

KeyShot bundles its sound files, so sound playback does not require a network connection. The available choices include firearms, sword slash, mechanical keyboard, and arcade-style effects.

The original game-style WAV effects can be regenerated with Python's standard library:

```powershell
python scripts/generate_sound_effects.py
```

Generated WAV files are written to `src/assets/sounds/`. Other sound files are bundled assets; retain any attribution or license terms provided by their original sources when redistributing them.

## Run from source

For development, install the project dependencies and start the Tauri app:

```powershell
npm install
npm run tauri dev
```

Building Windows installers requires Rust with the MSVC toolchain, Visual Studio C++ build tools, and the Windows SDK. To build the MSI and NSIS installers:

```powershell
npm run tauri build
```

Build output is created under `src-tauri/target/release/bundle/`.

## Font

KeyShot bundles the Orbitron font for offline use. Its SIL Open Font License is included at `src/assets/fonts/OFL.txt`.
