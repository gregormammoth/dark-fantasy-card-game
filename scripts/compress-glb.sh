#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -lt 2 ]; then
  echo 'Usage: pnpm compress:glb <input.glb> <output.glb>' >&2
  exit 1
fi
volta run --node 24.18.1 gltf-transform optimize "$1" "$2" --compress meshopt --texture-compress webp
