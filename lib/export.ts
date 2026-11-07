import { strToU8, zipSync, type Zippable } from "fflate";
import { CATEGORY_LABELS, FORM_LABELS, UNIT_LABELS, formatMinutes, type Tea } from "./types";

// A phone can't open a bare .json file, so the export is a ZIP that opens
// anywhere: a CSV table for people, the photos as JPEGs, and JSON for a
// future import.

function csvCell(value: string | number | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function photoPath(teaIndex: number, photoIndex: number): string {
  return `photos/tea-${String(teaIndex + 1).padStart(3, "0")}-${photoIndex + 1}.jpg`;
}

export async function buildExportZip(teas: Tea[]): Promise<Blob> {
  const files: Zippable = {};

  const header = ["이름", "브랜드", "종류", "형태", "물 온도(°C)", "시간", "찻잎(g)", "물(ml)", "유통기한", "남은 양", "단위", "메모", "사진", "추가한 날"];
  const rows = teas.map((t, i) =>
    [
      t.name,
      t.brand,
      CATEGORY_LABELS[t.category],
      FORM_LABELS[t.form],
      t.brew.tempC,
      t.brew.timeSec === null ? null : formatMinutes(t.brew.timeSec),
      t.brew.grams,
      t.brew.waterMl,
      t.expiry,
      t.amount.value,
      UNIT_LABELS[t.amount.unit],
      t.notes,
      t.photos.map((_, j) => photoPath(i, j)).join(" "),
      new Date(t.createdAt).toLocaleDateString("ko-KR"),
    ]
      .map(csvCell)
      .join(","),
  );
  // BOM so Excel reads the Korean text as UTF-8.
  files["my-tea.csv"] = strToU8("﻿" + [header.join(","), ...rows].join("\r\n"));

  for (const [i, tea] of teas.entries()) {
    for (const [j, photo] of tea.photos.entries()) {
      // JPEGs are already compressed; storing them avoids wasted work.
      files[photoPath(i, j)] = [new Uint8Array(await photo.arrayBuffer()), { level: 0 }];
    }
  }

  const json = {
    app: "my tea",
    version: 1,
    exportedAt: new Date().toISOString(),
    teas: teas.map(({ photos, ...rest }, i) => ({ ...rest, photos: photos.map((_, j) => photoPath(i, j)) })),
  };
  files["my-tea.json"] = strToU8(JSON.stringify(json, null, 2));

  return new Blob([zipSync(files) as Uint8Array<ArrayBuffer>], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
