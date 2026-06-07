import { join } from "node:path";

declare const OffscreenCanvas: new (w: number, h: number) => {
  getContext(type: "2d"): any;
};
declare const Path2D: new (d: string) => any;

const CATALOG_ROOT: string = (process.env as any).CATALOG_ROOT;
const ICON_SVG_PATH = join(CATALOG_ROOT, "lib/icons/extension-logos/macros-repeater/icon.svg");

const SIZES = [16, 48, 128];
const BG = "#012292";
const FG = "#ffffff";

const ICON_PATHS = [
  "m9 9 5 12 1.8-5.2L21 14Z",
  "M7.2 2.2 8 5.1",
  "m5.1 8-2.9-.8",
  "M14 4.1 12 6",
];

function renderIcon(size: number): { size: number; data: Buffer } {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const scale = size / 24;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.scale(scale, scale);
  ctx.strokeStyle = FG;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const d of ICON_PATHS) {
    ctx.stroke(new Path2D(d));
  }

  ctx.restore();

  const imageData = ctx.getImageData(0, 0, size, size);
  return { size, data: Buffer.from(imageData.data.buffer) };
}

export function getInactiveManifestRasters() {
  return SIZES.map(renderIcon);
}

export const manifestIconOutputs = [
  {
    prefix: "icon",
    getRasters: getInactiveManifestRasters,
    svgPath: ICON_SVG_PATH,
  },
];
