import { createServerFn } from "@tanstack/react-start";

export type ObjectFact = {
  id: string;
  glyph: string;
  name: string;
  text: string;
  readingLevel: number;
};

/** Public read of the learning content library (fun facts + vocabulary words). */
export const getLearningContent = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase
    .from("object_facts")
    .select("id, glyph, name, text, reading_level")
    .order("name", { ascending: true });

  if (error) return { facts: [] as ObjectFact[], error: "Learning content unavailable" };

  const facts: ObjectFact[] = (data ?? []).map((r) => ({
    id: r.id as string,
    glyph: r.glyph as string,
    name: r.name as string,
    text: r.text as string,
    readingLevel: (r.reading_level as number) ?? 2,
  }));
  return { facts, error: null as string | null };
});
