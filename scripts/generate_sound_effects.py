"""Generate short, original KeyShot game-style effects using only Python's standard library."""

import math
import random
import struct
import wave
from pathlib import Path


SAMPLE_RATE = 44_100
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "src" / "assets" / "sounds"


def write_effect(filename, duration, make_sample, seed):
    sample_count = int(SAMPLE_RATE * duration)
    random_source = random.Random(seed)
    samples = [make_sample(index / SAMPLE_RATE, duration, random_source) for index in range(sample_count)]

    # Normalize consistently while leaving headroom to avoid clipping.
    peak = max(abs(sample) for sample in samples) or 1.0
    gain = 0.88 / peak
    frames = bytearray(sample_count * 2)
    for index, sample in enumerate(samples):
        value = max(-1.0, min(1.0, sample * gain))
        struct.pack_into("<h", frames, index * 2, round(value * 32767))

    with wave.open(str(OUTPUT_DIR / filename), "wb") as audio_file:
        audio_file.setnchannels(1)
        audio_file.setsampwidth(2)
        audio_file.setframerate(SAMPLE_RATE)
        audio_file.writeframes(frames)


def suppressed_sample(time, duration, rng):
    pop = rng.uniform(-1.0, 1.0) * math.exp(-time * 75)
    phase = 2 * math.pi * (92 * time - 24 * time * time / duration)
    body = math.sin(phase) * math.exp(-time * 25)
    airy_tail = rng.uniform(-1.0, 1.0) * math.exp(-time * 18)
    return 0.30 * pop + 0.60 * body + 0.18 * airy_tail


def laser_sample(time, duration, rng):
    progress = time / duration
    start_frequency = 1050
    end_frequency = 170
    phase = 2 * math.pi * (
        start_frequency * time
        + 0.5 * (end_frequency - start_frequency) * time * time / duration
    )
    envelope = math.exp(-time * 8)
    zap = math.sin(phase) + 0.36 * math.sin(phase * 2.03)
    transient = rng.uniform(-1.0, 1.0) * math.exp(-time * 100)
    return 0.72 * envelope * zap + 0.18 * transient


def coin_sample(time, duration, rng):
    note = 880 if time < 0.075 else 1320
    envelope = math.exp(-time * 16)
    chime = math.sin(2 * math.pi * note * time)
    overtone = 0.28 * math.sin(2 * math.pi * note * 2 * time)
    click = rng.uniform(-1.0, 1.0) * math.exp(-time * 120)
    return 0.72 * envelope * (chime + overtone) + 0.12 * click


def power_up_sample(time, duration, rng):
    start_frequency = 240
    end_frequency = 1480
    phase = 2 * math.pi * (
        start_frequency * time
        + 0.5 * (end_frequency - start_frequency) * time * time / duration
    )
    attack = min(1.0, time / 0.025)
    envelope = attack * math.exp(-time * 2.8)
    rising_tone = math.sin(phase) + 0.32 * math.sin(phase * 1.5)
    shimmer = rng.uniform(-1.0, 1.0) * math.exp(-time * 16)
    return 0.78 * envelope * rising_tone + 0.08 * shimmer


def boing_sample(time, duration, rng):
    # A springy pitch drops, rebounds, and wobbles instead of sweeping down once.
    base_frequency = 360
    wobble_depth = 420
    decay = 9.5
    wobble_rate = 2 * math.pi * 7.5
    damped_wobble_cycles = (
        decay
        + math.exp(-decay * time)
        * (-decay * math.cos(wobble_rate * time) + wobble_rate * math.sin(wobble_rate * time))
    ) / (decay * decay + wobble_rate * wobble_rate)
    phase = 2 * math.pi * (base_frequency * time + wobble_depth * damped_wobble_cycles)
    envelope = math.exp(-time * 8)
    spring = math.sin(phase) + 0.48 * math.sin(phase * 2.15) + 0.16 * math.sin(phase * 3.1)
    pluck = rng.uniform(-1.0, 1.0) * math.exp(-time * 95)
    return 0.70 * envelope * spring + 0.12 * pluck


def arcade_jump_sample(time, duration, rng):
    start_frequency = 430
    end_frequency = 1380
    phase = 2 * math.pi * (
        start_frequency * time
        + 0.5 * (end_frequency - start_frequency) * time * time / duration
    )
    envelope = math.exp(-time * 18)
    pulse_wave = math.sin(phase) + 0.32 * math.sin(phase * 3)
    attack_click = rng.uniform(-1.0, 1.0) * math.exp(-time * 110)
    return 0.78 * envelope * pulse_wave + 0.10 * attack_click


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    write_effect("suppressed_shot.wav", 0.18, suppressed_sample, seed=22)
    write_effect("laser_blast.wav", 0.22, laser_sample, seed=44)
    write_effect("coin_pickup.wav", 0.18, coin_sample, seed=55)
    write_effect("power_up.wav", 0.30, power_up_sample, seed=66)
    write_effect("cartoon_boing.wav", 0.28, boing_sample, seed=77)
    write_effect("arcade_jump.wav", 0.15, arcade_jump_sample, seed=111)


if __name__ == "__main__":
    main()
