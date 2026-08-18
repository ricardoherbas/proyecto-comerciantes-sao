import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "TU_URL_DE_SUPABASE";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);