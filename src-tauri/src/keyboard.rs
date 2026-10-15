use rdev::{listen, EventType};
use tauri::{AppHandle, Emitter};

pub fn start(app: AppHandle) {
    std::thread::spawn(move || {
        let result = listen(move |event| {
            if let EventType::KeyPress(_) = event.event_type {
                if let Err(error) = app.emit("keyshot-keypress", ()) {
                    eprintln!("Failed to emit key press: {}", error);
                }
            }
        });

        if let Err(error) = result {
            eprintln!("Keyboard listener failed: {:?}", error);
        }
    });
}