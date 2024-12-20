import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
export async function mealsRoutes(app: FastifyInstance) {
  // Obtem a lista de refeições cadastradas
  app.get(
    "/",
    async () => {
      const meals = await knex("meals").select("*");

      return {
        meals,
      };
    }
  );

  // Obtem a lista de refeições do usuario
  app.get(
    "/user",
    {
      preHandler: [checkSessionIdExists],
    },
    async () => {
      const meals = await knex("meals").select("*");

      return {
        meals,
      };
    }
  );

  // Obtem uma refeição
  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getMealParamsSchema.parse(req.params);
      const meal = await knex("meals").where("id", id).first();

      return {
        meal,
      };
    }
  );

  // Cria uma nova refeição
  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      });

      const { name, description, date, isOnDiet } =
        await createMealBodySchema.parse(req.body);

      // Verifica se a descrição já existe em outra refeição
      const existingDescription = await knex("meals")
        .where("description", description)
        .first();

      if (existingDescription) {
        return res
          .status(400)
          .send({ message: "Descrição já está em uso por outra refeição." });
      }

      const meal = await knex("meals")
        .insert({
          id: randomUUID(),
          name,
          description,
          date: date.getTime(),
          is_on_diet: isOnDiet,
          user_id: req.user?.id,
        })
        .returning("*");

      return res.status(201).send(meal);
    }
  );

  // Edita uma nova refeição
  app.put(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(req.params);
      const meal = await knex("meals").where({ id }).first();

      if (!meal) {
        return res.status(404).send({ message: "Refeição não encontrada" });
      }

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      });

      const { name, description, date, isOnDiet } =
        await updateMealBodySchema.parse(req.body);

      // Verifica se a descrição já existe em outra refeição
      const existingMeal = await knex("meals")
        .where("description", description)
        .whereNot("id", id) // Garante que a refeição atual não será comparada com ela mesma
        .first();

      if (existingMeal) {
        return res
          .status(400)
          .send({ message: "Descrição já está em uso por outra refeição." });
      }

      // Atualiza a refeição
      const mealUpdated = await knex("meals")
        .update({
          name,
          description,
          date: date.getTime(),
          is_on_diet: isOnDiet,
        })
        .where({ id })
        .returning("*");

      return res.status(200).send(mealUpdated);
    }
  );

  // Deleta uma refeição
  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getMealParamsSchema.parse(req.params);
      const meal = await knex("meals").where("id", id).first();

      if (!meal) {
        return res.status(404).send({ error: "Refeição não encontrada" });
      }

      await knex("meals").where("id", id).delete();

      return res.status(200).send({ message: "Refeição deletada" });
    }
  );
  // Obtem metricas do usuario
  app.get(
    "/metrics",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const totalMeals = await knex("meals")
        .where({ user_id: request.user?.id })
        .orderBy("date", "desc");

      const totalMealsOnDiet = await knex("meals")
        .where({ user_id: request.user?.id, is_on_diet: true })
        .count("id", { as: "total" })
        .first();

      const totalMealsOffDiet = await knex("meals")
        .where({ user_id: request.user?.id, is_on_diet: false })
        .count("id", { as: "total" })
        .first();

      const { bestOnDietSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.currentSequence += 1;
          } else {
            acc.currentSequence = 0;
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence;
          }

          return acc;
        },
        { bestOnDietSequence: 0, currentSequence: 0 }
      );

      return reply.send({
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
        bestOnDietSequence,
      });
    }
  );
}
