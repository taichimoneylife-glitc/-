// ─────────────────────────────────────────────────────────────
//  図解リール用イラストを OpenAI 画像生成API(gpt-image-1)で自動生成
//  実行: OPENAI_API_KEY を環境に設定した上で
//        node scripts/gen-images.mjs
//  出力: public/gen/*.png（透過PNG・1024x1024）
//  画風を全ページ統一するため共通スタイルを末尾に付与。
// ─────────────────────────────────────────────────────────────
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = `${ROOT}/public/gen`;

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("✗ OPENAI_API_KEY が未設定です。環境のAPI credentialsに OPENAI_API_KEY を登録し、新しいセッションで実行してください。");
  process.exit(1);
}

// 全ページ共通のアートディレクション（毎回末尾に付ける）
const STYLE =
  "flat vector illustration, soft rounded shapes, thick clean navy outlines, " +
  "warm friendly color palette (navy #1B2A4A, red-orange #E5432B, gold #F6C544, cream), " +
  "minimal and modern, single centered subject, generous empty padding around subject, " +
  "absolutely no text, no letters, no numbers, transparent background, high quality, " +
  "Japanese finance explainer reel illustration";

// name＝出力ファイル名（public/gen/<name>.png）
const JOBS = [
  { name: "p1_car",     prompt: "a cute modern compact family car, front three-quarter view, clean and trustworthy" },
  { name: "p2_wallet",  prompt: "an open wallet next to a small bank building, money and loan concept, friendly" },
  { name: "p3_invest",  prompt: "a hand placing a gold coin into a small growing money plant in a pot, investment concept" },
  { name: "c4_stock",   prompt: "a jagged volatile stock chart line going sharply up and down, anxious risky feeling, red-orange" },
  { name: "c4_bond",    prompt: "a smooth steadily rising line chart on a small hill, calm stable safe feeling, green" },
  { name: "p5a_family", prompt: "a friendly young family, two parents and two small children, standing beside a red piggy bank, planning the future" },
  { name: "p5b_bond",   prompt: "a premium American treasury bond concept: US Capitol dome with a shining upward arrow and a gold circular seal badge, trustworthy and high-grade" },
];

async function gen(job) {
  const body = {
    model: "gpt-image-1",
    prompt: `${job.prompt}. ${STYLE}`,
    size: "1024x1024",
    background: "transparent",
    n: 1,
  };
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${job.name}: HTTP ${res.status} ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${job.name}: 画像データが空`);
  await writeFile(`${OUT}/${job.name}.png`, Buffer.from(b64, "base64"));
  console.log(`✓ ${job.name}.png`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`▶ ${JOBS.length}枚を生成します → ${OUT}`);
  for (const job of JOBS) {
    try {
      await gen(job);
    } catch (e) {
      console.error(`✗ ${e.message}`);
    }
  }
  console.log("完了。");
}

main();
