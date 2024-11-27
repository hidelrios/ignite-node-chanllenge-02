import fastify from "fastify";
import { env } from "./env";
import { usersRoutes } from "./routes/users";

const app = fastify();

app.register(usersRoutes,{
  prefix: '/api/users',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Http server running !!! 🚀");
  });
