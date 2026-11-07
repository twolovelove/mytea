import * as z from "zod/v4";
import { CATEGORY_IDS, FORM_IDS } from "./types";

export const IdentifyResult = z.object({
  is_tea: z.boolean(),
  name: z.string(),
  brand: z.string().nullable(),
  category: z.enum(CATEGORY_IDS),
  form: z.enum(FORM_IDS),
  brew: z.object({
    temp_c: z.number().nullable(),
    time_sec: z.number().nullable(),
    grams: z.number().nullable(),
    water_ml: z.number().nullable(),
    source: z.enum(["package", "typical"]),
  }),
  expiry_date: z.string().nullable(),
  net_amount: z.object({
    value: z.number().nullable(),
    unit: z.enum(["g", "ea"]),
  }),
  confidence: z.enum(["high", "medium", "low"]),
  note: z.string(),
});

export type IdentifyResult = z.infer<typeof IdentifyResult>;
