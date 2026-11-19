// 作業を始める前に実行：Gitに無い個人の素材（声・画像・完成動画）が手元にあるか確認する
// 使い方: node scripts/check-assets.mjs        → 足りない物を一覧（Google Drive の id つき）
//         node scripts/check-assets.mjs --add <path> <driveId>  → 表に追加（sha256 も記録）
import fs from "fs";
import crypto from "crypto";
const P = new URL("./private-assets.json", import.meta.url);
const m = JSON.parse(fs.readFileSync(P, "utf8"));
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
if (process.argv[2] === "--add") {
  const [, , , path, driveId] = process.argv;
  m.files = m.files.filter((x) => x.path !== path);
  m.files.push({ path, driveId, sha256: sha(path), bytes: fs.statSync(path).size });
  fs.writeFileSync(P, JSON.stringify(m, null, 2) + "\n");
  console.log("added", path);
} else {
  const miss = m.files.filter((x) => !fs.existsSync(x.path) || sha(x.path) !== x.sha256);
  if (!miss.length) console.log("✓ 個人の素材はすべて手元にあります（" + m.files.length + "件）");
  else {
    console.log("⚠ 手元に無い素材：" + miss.length + "件（Google Drive から取り戻す）");
    for (const x of miss) console.log(x.parts ? `  ${x.path}  分割 ${x.parts.length}個（順につなぐ）: ${x.parts.join(" ")}` : `  ${x.path}  driveId=${x.driveId}`);
  }
  if (!fs.existsSync("node_modules")) console.log("⚠ node_modules がありません → npm ci");
}
