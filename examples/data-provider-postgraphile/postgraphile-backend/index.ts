import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { grafserv } from "postgraphile/grafserv/express/v4";
import { pgl } from "./pgl.ts";

const serv = pgl.createServ(grafserv);

const app = express();
app.use(cors());
const server = createServer(app);

server.once("listening", () => {
  server.on("error", (e) => void console.error(e));
});

serv.addTo(app, server).catch((e) => {
  console.error(e);
  process.exit(1);
});

server.listen(5000, "0.0.0.0");

console.log("🚀 PostGraphile server running on http://localhost:5000");
console.log("📊 GraphiQL available at http://localhost:5000");
console.log("🔧 GraphQL endpoint at http://localhost:5000/graphql");
