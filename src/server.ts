import fastify from "fastify";
import { env } from "./env";
import { usersRoutes } from "./routes/users";
import cookie from "@fastify/cookie";
import { mealsRoutes } from "./routes/meals";

const app = fastify();

app.register(cookie);
app.register(usersRoutes, {
  prefix: "/api/users",
});
app.register(mealsRoutes, {
  prefix: "/api/meals",
});
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Http server running !!! 🚀");
  });
