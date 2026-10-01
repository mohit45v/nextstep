#!/usr/bin/env bash
#
# Pulls the language images the local Docker runner uses.
#
#   npm run runner:pull            # everything
#   npm run runner:pull python js  # just the small ones
#
# Sizes are worth knowing before you start: Python and Node are tens of
# megabytes, the C++ and Java toolchains are a great deal more. Nothing is pulled
# on demand during a run — a student pressing Run should not trigger a 1.5 GB
# download, so a missing image is reported as a missing image.
set -euo pipefail

declare -a NAMES=(python js cpp java)
declare -a IMAGES=(
  "${CODE_RUNNER_IMAGE_PYTHON:-python:3.12-alpine}"
  "${CODE_RUNNER_IMAGE_NODE:-node:22-alpine}"
  "${CODE_RUNNER_IMAGE_CPP:-gcc:14}"
  "${CODE_RUNNER_IMAGE_JAVA:-eclipse-temurin:21-jdk-alpine}"
)
declare -a SIZES=("~50 MB" "~55 MB" "~1.5 GB" "~330 MB")

wanted=("$@")

for i in "${!NAMES[@]}"; do
  name="${NAMES[$i]}"
  image="${IMAGES[$i]}"

  if [ ${#wanted[@]} -gt 0 ] && [[ ! " ${wanted[*]} " =~ " ${name} " ]]; then
    continue
  fi

  if docker image inspect "$image" >/dev/null 2>&1; then
    echo "✓ $name  $image (already present)"
    continue
  fi

  echo "→ $name  $image  (${SIZES[$i]})"
  docker pull "$image"
done

echo
echo "Languages without an image are reported in the playground with the pull command."
