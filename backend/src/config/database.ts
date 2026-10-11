import { Sequelize } from "sequelize";
import { env } from "./env";
import { RolSQLModel } from "../core/system/autenticacion/rol/infra/_sql/RolSQLModel";
import { UsuarioSQLModel } from "../core/system/autenticacion/usuario/infra/_sql/UsuarioSQLModel";
import { CiudadanoSQLModel } from "../core/emergencias/ciudadano/infra/_sql/CiudadanoSQLModel";
import { SesionRefreshSQLModel } from "../core/emergencias/sesion_refresh/infra/_sql/SesionRefreshSQLModel";
import { PerfilSQLModel } from "../core/emergencias/perfil/infra/_sql/PerfilSQLModel";
import { ContactoEmergenciaSQLModel } from "../core/emergencias/contacto_emergencia/infra/_sql/ContactoEmergenciaSQLModel";
import { CentroSaludSQLModel } from "../core/emergencias/centro_salud/infra/_sql/CentroSaludSQLModel";
import { TipoEmergenciaSQLModel } from "../core/emergencias/tipo_emergencia/infra/_sql/TipoEmergenciaSQLModel";
import { EstadoEmergenciaSQLModel } from "../core/emergencias/estado_emergencia/infra/_sql/EstadoEmergenciaSQLModel";
import { EmergenciaSQLModel } from "../core/emergencias/emergencia/infra/_sql/EmergenciaSQLModel";
import { RespuestaTriageSQLModel } from "../core/emergencias/respuesta_triage/infra/_sql/RespuestaTriageSQLModel";
import { HistorialEmergenciaSQLModel } from "../core/emergencias/historial_emergencia/infra/_sql/HistorialEmergenciaSQLModel";
import { EvidenciaEmergenciaSQLModel } from "../core/emergencias/evidencia_emergencia/infra/_sql/EvidenciaEmergenciaSQLModel";

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
    // Cada agregado define su propio modelo en infra/_sql. Las relaciones
    // cruzadas no se declaran aqui: cada modelo expone `associate(models)` y
    // recibe el registro completo mas abajo, evitando importaciones circulares.
    this.models = {
      rol: RolSQLModel.define(this.sequelizeInstance, Sequelize),
      usuario: UsuarioSQLModel.define(this.sequelizeInstance, Sequelize),
      ciudadano: CiudadanoSQLModel.define(this.sequelizeInstance, Sequelize),
      sesionRefresh: SesionRefreshSQLModel.define(this.sequelizeInstance, Sequelize),
      perfil: PerfilSQLModel.define(this.sequelizeInstance, Sequelize),
      contactoEmergencia: ContactoEmergenciaSQLModel.define(this.sequelizeInstance, Sequelize),
      centroSalud: CentroSaludSQLModel.define(this.sequelizeInstance, Sequelize),
      tipoEmergencia: TipoEmergenciaSQLModel.define(this.sequelizeInstance, Sequelize),
      estadoEmergencia: EstadoEmergenciaSQLModel.define(this.sequelizeInstance, Sequelize),
      emergencia: EmergenciaSQLModel.define(this.sequelizeInstance, Sequelize),
      respuestaTriage: RespuestaTriageSQLModel.define(this.sequelizeInstance, Sequelize),
      historialEmergencia: HistorialEmergenciaSQLModel.define(this.sequelizeInstance, Sequelize),
      evidenciaEmergencia: EvidenciaEmergenciaSQLModel.define(this.sequelizeInstance, Sequelize),
    };

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
}
