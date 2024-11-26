import fastify from "fastify";
import { knex } from "./database";
import { env } from "./env";

const app = fastify();

app.get("/ping", async () => {
  const tables = await knex("sqlite_schema").select("*");
  return tables;
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Http server running !!! 🚀");
  });
