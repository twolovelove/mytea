"use client";

import { useState, type FormEvent } from "react";
import {
  CATEGORY_IDS,
  CATEGORY_LABELS,
  FORM_IDS,
  FORM_LABELS,
  UNIT_LABELS,
  type AmountUnit,
  type CategoryId,
  type FormId,
  type TeaDraft,
} from "@/lib/types";

interface FormState {
  name: string;
  brand: string;
  category: CategoryId;
  form: FormId;
  tempC: string;
  timeMin: string;
  grams: string;
  waterMl: string;
  expiry: string;
  amountValue: string;
  amountUnit: AmountUnit;
  notes: string;
}

const str = (n: number | null) => (n === null ? "" : String(n));

function num(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toForm(d: TeaDraft): FormState {
  return {
    name: d.name,
    brand: d.brand,
    category: d.category,
    form: d.form,
    tempC: str(d.brew.tempC),
    timeMin: d.brew.timeSec === null ? "" : String(d.brew.timeSec / 60),
    grams: str(d.brew.grams),
    waterMl: str(d.brew.waterMl),
    expiry: d.expiry ?? "",
    amountValue: str(d.amount.value),
    amountUnit: d.amount.unit,
    notes: d.notes,
  };
}

function fromForm(f: FormState, photos: Blob[]): TeaDraft {
  const minutes = num(f.timeMin);
  return {
    name: f.name.trim(),
    brand: f.brand.trim(),
    category: f.category,
    form: f.form,
    brew: {
      tempC: num(f.tempC),
      timeSec: minutes === null ? null : Math.round(minutes * 60),
      grams: num(f.grams),
      waterMl: num(f.waterMl),
    },
    expiry: f.expiry || null,
    amount: { value: num(f.amountValue), unit: f.amountUnit },
    notes: f.notes.trim(),
    photos,
  };
}

export function TeaForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: TeaDraft;
  submitLabel: string;
  onSubmit: (draft: TeaDraft) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [f, setF] = useState<FormState>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setF((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) {
      setNameError(true);
      document.getElementById("tea-name")?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(fromForm(f, initial.photos));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>이름 (필수)</span>
        <input
          id="tea-name"
          className="input"
          value={f.name}
          onChange={(e) => {
            set("name", e.target.value);
            setNameError(false);
          }}
          aria-invalid={nameError}
          aria-describedby={nameError ? "tea-name-error" : undefined}
          autoComplete="off"
        />
        {nameError && (
          <span id="tea-name-error" className="error">
            차 이름을 입력해 주세요.
          </span>
        )}
      </label>

      <label className="field">
        <span>브랜드</span>
        <input className="input" value={f.brand} onChange={(e) => set("brand", e.target.value)} autoComplete="off" />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>종류</span>
          <select className="input" value={f.category} onChange={(e) => set("category", e.target.value as CategoryId)}>
            {CATEGORY_IDS.map((id) => (
              <option key={id} value={id}>
                {CATEGORY_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>형태</span>
          <select className="input" value={f.form} onChange={(e) => set("form", e.target.value as FormId)}>
            {FORM_IDS.map((id) => (
              <option key={id} value={id}>
                {FORM_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="fieldset">
        <legend>우리는 방법</legend>
        <div className="grid-2">
          <label className="field">
            <span>물 온도 (°C)</span>
            <input className="input" type="number" inputMode="numeric" min={0} max={100} value={f.tempC} onChange={(e) => set("tempC", e.target.value)} />
          </label>
          <label className="field">
            <span>시간 (분)</span>
            <input className="input" type="number" inputMode="decimal" min={0} step={0.5} value={f.timeMin} onChange={(e) => set("timeMin", e.target.value)} />
          </label>
          <label className="field">
            <span>찻잎 (g)</span>
            <input className="input" type="number" inputMode="decimal" min={0} step={0.5} value={f.grams} onChange={(e) => set("grams", e.target.value)} />
          </label>
          <label className="field">
            <span>물 (ml)</span>
            <input className="input" type="number" inputMode="numeric" min={0} step={10} value={f.waterMl} onChange={(e) => set("waterMl", e.target.value)} />
          </label>
        </div>
      </fieldset>

      <label className="field">
        <span>유통기한</span>
        <input className="input" type="date" value={f.expiry} onChange={(e) => set("expiry", e.target.value)} />
      </label>

      <fieldset className="fieldset">
        <legend>남은 양</legend>
        <div className="grid-2">
          <label className="field">
            <span className="sr-only">양</span>
            <input className="input" type="number" inputMode="decimal" min={0} value={f.amountValue} onChange={(e) => set("amountValue", e.target.value)} />
          </label>
          <label className="field">
            <span className="sr-only">단위</span>
            <select className="input" value={f.amountUnit} onChange={(e) => set("amountUnit", e.target.value as AmountUnit)}>
              {(Object.keys(UNIT_LABELS) as AmountUnit[]).map((u) => (
                <option key={u} value={u}>
                  {u === "g" ? "g (무게)" : "개 (티백 등)"}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <label className="field">
        <span>메모</span>
        <textarea className="input" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>

      <div className="stack">
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? "저장 중…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-block" onClick={onCancel}>
            취소
          </button>
        )}
      </div>
    </form>
  );
}
