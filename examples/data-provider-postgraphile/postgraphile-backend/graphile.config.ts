import { makePgService } from "postgraphile/@dataplan/pg/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";

const preset: GraphileConfig.Preset = {
  extends: [PostGraphileAmberPreset, PgSimplifyInflectionPreset, PostGraphileConnectionFilterPreset],
  pgServices: [
    makePgService({
      connectionString: process.env.DATABASE_URL || "postgres://postgres:test@localhost:5433/postgraphile_example",
      schemas: ["public"],
      pubsub: true,
    }),
  ],
  grafast: {
    explain: true,
  },
  grafserv: {
    websockets: true,
  },
  schema: {
    pgJwtSecret: "example-secret-key-change-in-production",
  },
};

export default preset;
