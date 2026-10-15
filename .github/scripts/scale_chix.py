"""Scale chix/ images into scaled_chix/ as webp.

A chick is scaled when scaled_chix/ has no file with its name, so new chix get
scaled and deleted copies get regenerated. Existing copies are left alone.

Needs pyvips: `pip install -r .github/scripts/requirements.txt`
"""

import os
import sys
from pathlib import Path

import pyvips

SRC_DIR = Path("chix")
DEST_DIR = Path("scaled_chix")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}

# Longest edge in px; smaller images keep their size, never upscaled
MAX_SIZE = int(os.environ.get("MAX_SIZE", 1200))
WEBP_QUALITY = int(os.environ.get("WEBP_QUALITY", 80))


def scale(src: Path, dest: Path) -> None:
    # thumbnail applies EXIF rotation, so phone photos come out upright.
    # size="down" only shrinks; keep="none" drops metadata (EXIF/GPS).
    image = pyvips.Image.thumbnail(str(src), MAX_SIZE, height=MAX_SIZE, size="down")
    image.write_to_file(str(dest), Q=WEBP_QUALITY, keep="none")


def main() -> int:
    DEST_DIR.mkdir(exist_ok=True)

    sources = sorted(
        p for p in SRC_DIR.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS
    )
    missing = [
        (src, DEST_DIR / f"{src.stem}.webp")
        for src in sources
        if not (DEST_DIR / f"{src.stem}.webp").exists()
    ]

    for src, dest in missing:
        scale(src, dest)
        print(f"scaled {src} -> {dest}")

    print(f"scaled {len(missing)} of {len(sources)} chix")
    return 0


if __name__ == "__main__":
    sys.exit(main())
