import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
export async function usersRoutes(app: FastifyInstance) {
  // Obtem a lista de usuarios
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async () => {
      const users = await knex("users").select("*");

      return {
        users,
      };
    }
  );

  // Obtem um usuario
  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getUsersParamsSchema.parse(req.params);
      const user = await knex("users").where("id", id).first();

      return {
        user,
      };
    }
  );

  // Cria um novo usuario
  app.post("/", async (req, res) => {
    const createUserBodySchema = z.object({
      username: z.string().min(3).max(30),
      email: z.string().email(),
    });

    const { username, email } = await createUserBodySchema.parse(req.body);

    const userEmailExists = await knex("users").where({ email: email}).first();

    if (userEmailExists) {
      return res.status(400).send({ message: 'User already exists' })
    }

    const sessionId = randomUUID();
    res.cookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const user = await knex("users")
      .insert({
        id: randomUUID(),
        username,
        email,
        session_id: sessionId,
      })
      .returning("*");

    return res.status(201).send(user);
  });
}
