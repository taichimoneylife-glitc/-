// public/gen にある画像の一覧を src/genManifest.ts に書き出す。
// 画像を置いたらこれを実行 → GenSlot が自動で画像に切り替わる（無い枠は名前入りの点線枠）。
// 使い方: node scripts/gen-manifest.mjs
import { readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const names = readdirSync(join(root, "public/gen"))
  .filter((f) => f.endsWith(".png"))
  .map((f) => f.replace(/\.png$/, ""))
  .sort();
writeFileSync(
  join(root, "src/genManifest.ts"),
  `// 自動生成（scripts/gen-manifest.mjs）。手で編集しない。\nexport const GEN_AVAILABLE = new Set<string>(${JSON.stringify(names)});\n`,
);
console.log(`genManifest: ${names.length} images`);
