import { Sequelize } from "sequelize";
import { env } from "./env";
import { RolSQLModel } from "../core/system/autenticacion/rol/infra/_sql/RolSQLModel";
import { UsuarioSQLModel } from "../core/system/autenticacion/usuario/infra/_sql/UsuarioSQLModel";
import { EmergenciasSQLModels } from "../core/emergencias/infra/_sql/EmergenciasSQLModels";

export class Database {
  private static instance: Database;
  private readonly sequelizeInstance: Sequelize;
  public readonly models: Record<string, any>;

  private constructor() {
    console.log("[database] preparando base de datos...");
    this.sequelizeInstance = new Sequelize(
      env.database.name,
      env.database.user,
      env.database.password,
      {
        dialect: env.database.dialect as "mysql",
        host: env.database.host,
        port: env.database.port,
        logging: env.database.logging ? console.log : false,
        dialectOptions: {
          decimalNumbers: true,
          supportBigNumbers: true,
          connectTimeout: 10_000,
        },
        timezone: "-04:00",
        define: {
          underscored: true,
          freezeTableName: true,
          timestamps: true,
          paranoid: true,
          createdAt: "fecha_creacion",
          updatedAt: "fecha_modificacion",
          deletedAt: "fecha_eliminacion",
        },
        pool: {
          max: 10,
          min: 0,
          idle: 55_000,
          acquire: 20_000,
          evict: 10_000,
        },
      },
    );

    console.log("[database] cargando modelos...");
    this.models = {
      rol: RolSQLModel.define(this.sequelizeInstance, Sequelize),
      usuario: UsuarioSQLModel.define(this.sequelizeInstance, Sequelize),
      ...EmergenciasSQLModels.define(this.sequelizeInstance, Sequelize),
    };

    this.models.emergencia.belongsTo(this.models.usuario, {
      as: "operador",
      foreignKey: "operador_id",
      constraints: false,
    });

    console.log("[database] asociando modelos...");
    Object.keys(this.models).forEach((key) => {
      if (typeof this.models[key].associate === "function")
        this.models[key].associate(this.models);
    });

    console.log(
      "\x1b[92m[database] Base de datos configurada exitosamente. :)\x1b[0m",
    );
  }

  static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }

  get sequelize(): Sequelize {
    return this.sequelizeInstance;
  }

  async authenticate(): Promise<void> {
    await this.sequelizeInstance.authenticate();
  }

  async sync(force = false): Promise<void> {
    await this.sequelizeInstance.sync({ force });
  }
}
