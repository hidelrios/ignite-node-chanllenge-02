// eslint-disable-next-line
import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      username: string;
      password: string;
      email: string;
      created_at: Date;
      updated_at: Date;
    };
    meals: {
      id: string;
      name: string;
      description: string;
      date_time: Date;
      this_on_diet: boolean;
    };
  }
}
