#!/usr/bin/env bash
# Applies the 2026-11-28 rewrite (branch text, About pages, photo descriptions) with the SEO agent's CMS key.
# Deploy the frontend first (it holds the matching Vietnamese), then run:  bash seo-agent/content/2026-11-28/apply.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
P="$HERE/../../tools/payload.sh"
echo "PATCH /api/tenants/6a9f91ff9656d8b36ae1a3d7"; if out=$("$P" PATCH /api/tenants/6a9f91ff9656d8b36ae1a3d7 "$HERE/tenant-red-space.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/tenants/6a9f92009656d8b36ae1a422"; if out=$("$P" PATCH /api/tenants/6a9f92009656d8b36ae1a422 "$HERE/tenant-blue-bistro.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91f79656d8b36ae1a343"; if out=$("$P" PATCH /api/media/6a9f91f79656d8b36ae1a343 "$HERE/media-6a9f91f79656d8b36ae1a343.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91f89656d8b36ae1a34f"; if out=$("$P" PATCH /api/media/6a9f91f89656d8b36ae1a34f "$HERE/media-6a9f91f89656d8b36ae1a34f.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91f99656d8b36ae1a35b"; if out=$("$P" PATCH /api/media/6a9f91f99656d8b36ae1a35b "$HERE/media-6a9f91f99656d8b36ae1a35b.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91f99656d8b36ae1a367"; if out=$("$P" PATCH /api/media/6a9f91f99656d8b36ae1a367 "$HERE/media-6a9f91f99656d8b36ae1a367.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fa9656d8b36ae1a373"; if out=$("$P" PATCH /api/media/6a9f91fa9656d8b36ae1a373 "$HERE/media-6a9f91fa9656d8b36ae1a373.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fb9656d8b36ae1a37f"; if out=$("$P" PATCH /api/media/6a9f91fb9656d8b36ae1a37f "$HERE/media-6a9f91fb9656d8b36ae1a37f.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fb9656d8b36ae1a38b"; if out=$("$P" PATCH /api/media/6a9f91fb9656d8b36ae1a38b "$HERE/media-6a9f91fb9656d8b36ae1a38b.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fc9656d8b36ae1a397"; if out=$("$P" PATCH /api/media/6a9f91fc9656d8b36ae1a397 "$HERE/media-6a9f91fc9656d8b36ae1a397.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fd9656d8b36ae1a3a3"; if out=$("$P" PATCH /api/media/6a9f91fd9656d8b36ae1a3a3 "$HERE/media-6a9f91fd9656d8b36ae1a3a3.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fe9656d8b36ae1a3af"; if out=$("$P" PATCH /api/media/6a9f91fe9656d8b36ae1a3af "$HERE/media-6a9f91fe9656d8b36ae1a3af.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91f89656d8b36ae1a349"; if out=$("$P" PATCH /api/media/6a9f91f89656d8b36ae1a349 "$HERE/media-6a9f91f89656d8b36ae1a349.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91f89656d8b36ae1a355"; if out=$("$P" PATCH /api/media/6a9f91f89656d8b36ae1a355 "$HERE/media-6a9f91f89656d8b36ae1a355.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91f99656d8b36ae1a361"; if out=$("$P" PATCH /api/media/6a9f91f99656d8b36ae1a361 "$HERE/media-6a9f91f99656d8b36ae1a361.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fa9656d8b36ae1a36d"; if out=$("$P" PATCH /api/media/6a9f91fa9656d8b36ae1a36d "$HERE/media-6a9f91fa9656d8b36ae1a36d.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fb9656d8b36ae1a379"; if out=$("$P" PATCH /api/media/6a9f91fb9656d8b36ae1a379 "$HERE/media-6a9f91fb9656d8b36ae1a379.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fb9656d8b36ae1a385"; if out=$("$P" PATCH /api/media/6a9f91fb9656d8b36ae1a385 "$HERE/media-6a9f91fb9656d8b36ae1a385.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fc9656d8b36ae1a391"; if out=$("$P" PATCH /api/media/6a9f91fc9656d8b36ae1a391 "$HERE/media-6a9f91fc9656d8b36ae1a391.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fd9656d8b36ae1a39d"; if out=$("$P" PATCH /api/media/6a9f91fd9656d8b36ae1a39d "$HERE/media-6a9f91fd9656d8b36ae1a39d.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fe9656d8b36ae1a3a9"; if out=$("$P" PATCH /api/media/6a9f91fe9656d8b36ae1a3a9 "$HERE/media-6a9f91fe9656d8b36ae1a3a9.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
echo "PATCH /api/media/6a9f91fe9656d8b36ae1a3b5"; if out=$("$P" PATCH /api/media/6a9f91fe9656d8b36ae1a3b5 "$HERE/media-6a9f91fe9656d8b36ae1a3b5.json" 2>&1); then echo "  ok"; else echo "  FAILED: ${out:0:400}"; fi
