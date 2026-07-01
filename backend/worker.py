"""Standalone vtracer worker — called as a subprocess to avoid segfault in async context."""
import sys
import vtracer

if len(sys.argv) != 3:
    print("Usage: worker.py <input_path> <output_path>", file=sys.stderr)
    sys.exit(1)

# Keyword args cause a segfault with vtracer 0.6.15 on Python 3.14 (PyO3 ABI issue).
# Defaults produce color SVG output, which is what we want.
vtracer.convert_image_to_svg_py(sys.argv[1], sys.argv[2])
