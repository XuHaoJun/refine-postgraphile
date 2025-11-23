import { postgraphile } from "postgraphile";
import preset from "./graphile.config.ts";

export const pgl = postgraphile(preset);
