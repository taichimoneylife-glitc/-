#!/usr/bin/env bash
# スマホで撮った動画を、Remotion で使いやすい形（縦1080x1920・30fps・H.264・SDR）にそろえる。
#  使い方: bash scripts/prep_video.sh 元の動画.mov   → public/talk.mp4 ができる
#  iPhone の HDR（HLG/10bit）は色が白っぽくなるので、ふつうの色（SDR）に直す。
#  ffmpeg が必要（Mac: brew install ffmpeg）。
set -e
SRC="$1"; OUT="${2:-public/talk.mp4}"
[ -z "$SRC" ] && { echo "使い方: bash scripts/prep_video.sh 元の動画.mov"; exit 1; }
if ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of csv=p=0 "$SRC" | grep -qiE "arib-std-b67|smpte2084"; then
  VF="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,"
else
  VF=""
fi
ffmpeg -y -i "$SRC" -vf "${VF}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$OUT"
echo "→ $OUT"
