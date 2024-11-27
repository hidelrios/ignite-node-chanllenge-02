import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
export async function usersRoutes(app: FastifyInstance) {
  // Obtem a lista de usuarios
  app.get("/", async () => {
    const users = await knex("users").select("*");
    
    return {
      users,
    };
  });

  // Obtem um usuario
  app.get("/:id", async (req, res) => {
    const getUsersParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getUsersParamsSchema.parse(req.params);
    const user = await knex("users").where("id", id).first();

    return {
      user,
    };
  });

  // Cria um novo usuario
  app.post("/", async (req, res) => {
    const createUserBodySchema = z.object({
      username: z.string().min(3).max(30),
      password: z.string().min(8).max(20),
      email: z.string().email(),
    });

    const { username, password, email } = await createUserBodySchema.parse(
      req.body
    );

    const user = await knex("users")
      .insert({
        id: randomUUID(),
        username,
        password,
        email,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");

    return res.status(201).send(user);
  });
}
