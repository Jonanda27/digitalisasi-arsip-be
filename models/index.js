import { Sequelize } from "sequelize";
import userModel from "./user.js";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

const User = userModel(sequelize);

export { sequelize, User };
