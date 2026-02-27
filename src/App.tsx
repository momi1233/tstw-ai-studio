import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Image as ImageIcon, Type, LayoutGrid, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";

// TSTW Social Post Builder
// - Upload an image
// - Add top question + bottom CTA
// - Choose template + font size
// - Export as PNG (HD)

const presets = [
  {
    id: "classic",
    name: "Classic (Top + Bottom)",
    top: "The future won’t fix itself.\nWill you help build it?",
    bottom: "Join the mission → @t.s.t.w.7",
  },
  {
    id: "chapter1",
    name: "Chapter 1 (Book Page)",
    top: "What do you feel when the world is asking for help?",
    bottom: "The Earth was covered in smoke.\nThe sky grew darker.\nBut then… a light arrived.",
  },
  {
    id: "question",
    name: "Question Only",
    top: "What would you change first to help Earth?",
    bottom: "",
  },
];

const sizeOptions = [
  { id: "story", label: "Instagram Story (1080×1920)", w: 1080, h: 1920 },
  { id: "reel", label: "Reels/TikTok (1080×1920)", w: 1080, h: 1920 },
  { id: "square", label: "Feed Square (1080×1080)", w: 1080, h: 1080 },
  { id: "portrait", label: "Feed Portrait (1080×1350)", w: 1080, h: 1350 },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function readableFileSize(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number } | null>(null);

  const [presetId, setPresetId] = useState(presets[0].id);
  const activePreset = useMemo(() => presets.find((p) => p.id === presetId)!, [presetId]);

  const [topText, setTopText] = useState(activePreset.top);
  const [bottomText, setBottomText] = useState(activePreset.bottom);

  const [sizeId, setSizeId] = useState(sizeOptions[0].id);
  const activeSize = useMemo(() => sizeOptions.find((s) => s.id === sizeId)!, [sizeId]);

  const [topSize, setTopSize] = useState(72);
  const [bottomSize, setBottomSize] = useState(56);

  const [topAlign, setTopAlign] = useState<"left" | "center" | "right">("center");
  const [bottomAlign, setBottomAlign] = useState<"left" | "center" | "right">("center");

  const [shadow, setShadow] = useState(true);
  const [panel, setPanel] = useState<"none" | "soft" | "box">("soft");

  const [bgFit, setBgFit] = useState<"cover" | "contain">("cover");
  const [dim, setDim] = useState(0.25);

  const [exportScale, setExportScale] = useState(2); // 2x = very crisp
  const [exporting, setExporting] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);

  // Update text when preset changes (without destroying user's edits if they already typed)
  useEffect(() => {
    setTopText(activePreset.top);
    setBottomText(activePreset.bottom);
  }, [activePreset.id]);

  function onPickFile(file: File) {
    setImageMeta({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = () => setImageSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function exportPng() {
    if (!stageRef.current) return;
    setExporting(true);
    try {
      // Ensure fonts/layout settle
      await new Promise((r) => setTimeout(r, 50));
      const dataUrl = await toPng(stageRef.current, {
        cacheBust: true,
        pixelRatio: exportScale,
      });
      const a = document.createElement("a");
      const safeName = (imageMeta?.name || "post")
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "_");
      a.download = `TSTW_${safeName}_${activeSize.w}x${activeSize.h}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  function clearAll() {
    setImageSrc(null);
    setImageMeta(null);
    setPresetId(presets[0].id);
    setSizeId(sizeOptions[0].id);
    setTopAlign("center");
    setBottomAlign("center");
    setShadow(true);
    setPanel("soft");
    setBgFit("cover");
    setDim(0.25);
    setExportScale(2);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">TSTW Social Post Builder</div>
              <div className="text-xs text-zinc-400">Upload → Add text → Export HD PNG</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              title="Reset"
            >
              <Trash2 className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={exportPng}
              disabled={!imageSrc || exporting}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting…" : "Export PNG"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[420px_1fr]">
        {/* Controls */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <h2 className="text-base font-semibold">Inputs</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-300">Upload image</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPickFile(f);
                    }}
                  />
                </label>
                <div className="min-w-0">
                  <div className="truncate text-sm text-zinc-200">{imageMeta?.name || "No file selected"}</div>
                  <div className="text-xs text-zinc-400">{imageMeta ? readableFileSize(imageMeta.size) : ""}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300">Canvas size</label>
              <select
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm"
                value={sizeId}
                onChange={(e) => setSizeId(e.target.value)}
              >
                {sizeOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-300">Text preset</label>
              <select
                className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm"
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Type className="h-4 w-4" /> Top text
              </div>
              <textarea
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm"
              />
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  className={`rounded-2xl border border-white/10 px-3 py-2 text-xs ${
                    topAlign === "left" ? "bg-white text-zinc-900" : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setTopAlign("left")}
                >
                  Left
                </button>
                <button
                  className={`rounded-2xl border border-white/10 px-3 py-2 text-xs ${
                    topAlign === "center" ? "bg-white text-zinc-900" : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setTopAlign("center")}
                >
                  Center
                </button>
                <button
                  className={`rounded-2xl border border-white/10 px-3 py-2 text-xs ${
                    topAlign === "right" ? "bg-white text-zinc-900" : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setTopAlign("right")}
                >
                  Right
                </button>
              </div>
              <div className="mt-3">
                <label className="text-xs text-zinc-300">Font size</label>
                <input
                  type="range"
                  min={36}
                  max={96}
                  value={topSize}
                  onChange={(e) => setTopSize(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Type className="h-4 w-4" /> Bottom text
              </div>
              <textarea
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm"
              />
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  className={`rounded-2xl border border-white/10 px-3 py-2 text-xs ${
                    bottomAlign === "left" ? "bg-white text-zinc-900" : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setBottomAlign("left")}
                >
                  Left
                </button>
                <button
                  className={`rounded-2xl border border-white/10 px-3 py-2 text-xs ${
                    bottomAlign === "center" ? "bg-white text-zinc-900" : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setBottomAlign("center")}
                >
                  Center
                </button>
                <button
                  className={`rounded-2xl border border-white/10 px-3 py-2 text-xs ${
                    bottomAlign === "right" ? "bg-white text-zinc-900" : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setBottomAlign("right")}
                >
                  Right
                </button>
              </div>
              <div className="mt-3">
                <label className="text-xs text-zinc-300">Font size</label>
                <input
                  type="range"
                  min={28}
                  max={84}
                  value={bottomSize}
                  onChange={(e) => setBottomSize(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-sm font-semibold">Style</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm">
                  <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                  Text shadow
                </label>
                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm">
                  <span className="text-zinc-300">Panel</span>
                  <select
                    className="ml-auto rounded-xl border border-white/10 bg-zinc-950 px-2 py-1 text-sm"
                    value={panel}
                    onChange={(e) => setPanel(e.target.value as any)}
                  >
                    <option value="none">None</option>
                    <option value="soft">Soft</option>
                    <option value="box">Box</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm">
                  <span className="text-zinc-300">Image fit</span>
                  <select
                    className="ml-auto rounded-xl border border-white/10 bg-zinc-950 px-2 py-1 text-sm"
                    value={bgFit}
                    onChange={(e) => setBgFit(e.target.value as any)}
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                  </select>
                </label>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Dim overlay</span>
                    <span className="text-xs text-zinc-400">{Math.round(dim * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.6}
                    step={0.01}
                    value={dim}
                    onChange={(e) => setDim(clamp(Number(e.target.value), 0, 0.6))}
                    className="mt-2 w-full"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Export quality</span>
                    <span className="text-xs text-zinc-400">{exportScale}×</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={1}
                    value={exportScale}
                    onChange={(e) => setExportScale(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                  <div className="mt-1 text-xs text-zinc-400">2× is best for crisp text.</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-400">
              Tip: use short top questions, and a simple CTA at the bottom. Keep text inside the safe margins.
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Preview</div>
              <div className="text-xs text-zinc-400">This is exactly what exports as PNG</div>
            </div>
            <div className="text-xs text-zinc-400">
              {activeSize.w}×{activeSize.h}px
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
              style={{
                width: 360,
                aspectRatio: `${activeSize.w} / ${activeSize.h}`,
              }}
            >
              <div
                ref={stageRef}
                className="relative h-full w-full"
                style={{
                  width: activeSize.w,
                  height: activeSize.h,
                  transform: `scale(${360 / activeSize.w})`,
                  transformOrigin: "top left",
                }}
              >
                {/* Background */}
                <div className="absolute inset-0">
                  {imageSrc ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${imageSrc})`,
                        backgroundSize: bgFit,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-zinc-900 to-black">
                      <div className="text-center">
                        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <div className="text-sm font-semibold">Upload an image to start</div>
                        <div className="mt-1 text-xs text-zinc-400">JPG/PNG/WebP</div>
                      </div>
                    </div>
                  )}

                  {/* Dim overlay for readability */}
                  <div
                    className="absolute inset-0"
                    style={{ background: `rgba(0,0,0,${dim})` }}
                  />

                  {/* Subtle vignette */}
                  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,0.65)" }} />
                </div>

                {/* Safe margins */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-[70px] right-[70px] top-[90px] bottom-[110px] rounded-3xl border border-white/10" />
                </div>

                {/* Top text */}
                {topText.trim() ? (
                  <TextBlock
                    position="top"
                    align={topAlign}
                    fontSize={topSize}
                    shadow={shadow}
                    panel={panel}
                    text={topText}
                  />
                ) : null}

                {/* Bottom text */}
                {bottomText.trim() ? (
                  <TextBlock
                    position="bottom"
                    align={bottomAlign}
                    fontSize={bottomSize}
                    shadow={shadow}
                    panel={panel}
                    text={bottomText}
                  />
                ) : null}

                {/* Brand mark (optional small) */}
                <div className="absolute bottom-[42px] right-[56px] text-[28px] font-semibold tracking-wider text-white/70">
                  T.S.T.W
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950 p-3 text-xs text-zinc-300">
            <div className="font-semibold text-white">How to use</div>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Upload your image.</li>
              <li>Edit the top question and bottom CTA.</li>
              <li>Choose Story/Reels/Square size.</li>
              <li>Click <span className="font-semibold">Export PNG</span> (2× recommended).</li>
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-4 text-xs text-zinc-400">
          Built for TSTW workflow: one image → consistent top question + bottom CTA → export HD.
        </div>
      </footer>
    </div>
  );
}

function TextBlock({
  position,
  align,
  fontSize,
  shadow,
  panel,
  text,
}: {
  position: "top" | "bottom";
  align: "left" | "center" | "right";
  fontSize: number;
  shadow: boolean;
  panel: "none" | "soft" | "box";
  text: string;
}) {
  const baseTop = position === "top" ? 86 : undefined;
  const baseBottom = position === "bottom" ? 86 : undefined;

  const panelStyle =
    panel === "none"
      ? {}
      : panel === "soft"
      ? {
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
        }
      : {
          background: "rgba(0,0,0,0.6)",
          border: "2px solid rgba(255,255,255,0.18)",
        };

  const textShadow = shadow
    ? "0 3px 14px rgba(0,0,0,0.55), 0 2px 2px rgba(0,0,0,0.45)"
    : "none";

  return (
    <div
      className="absolute left-[70px] right-[70px]"
      style={{
        top: baseTop,
        bottom: baseBottom,
      }}
    >
      <div
        className="rounded-3xl px-10 py-8"
        style={{
          ...panelStyle,
        }}
      >
        <div
          style={{
            fontSize,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textAlign: align,
            color: "rgba(255,255,255,0.96)",
            textShadow,
            fontWeight: 700,
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
