import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scorePatient, type Patient } from "./model";

// Patient shape is validated loosely (object) — scorePatient tolerates missing
// fields by falling back to defaults in the engine; we cap payload size instead.
const patientSchema = z.record(z.string(), z.union([z.string().max(60), z.number(), z.boolean()]));

/** Public: scores a patient on the server (no data stored). Swap body for the Python model later. */
export const predictServer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => patientSchema.parse(d))
  .handler(async ({ data }) => scorePatient(data as unknown as Patient));

/** Auth required: scores on the server and saves the encounter to the signed-in user's record. */
export const saveAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ patient: patientSchema, label: z.string().max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const prediction = scorePatient(data.patient as unknown as Patient);
    const { error } = await context.supabase.from("assessments").insert({
      user_id: context.userId,
      label: data.label,
      patient: data.patient,
      probability: prediction.probability,
      tier: prediction.tier,
      readiness: prediction.readiness,
      priority: prediction.priority,
      prediction: prediction as never,
    });
    if (error) throw new Error(error.message);
    return prediction;
  });

export const listAssessments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assessments")
      .select("id,label,probability,tier,readiness,priority,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data;
  });

export const deleteAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("assessments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
