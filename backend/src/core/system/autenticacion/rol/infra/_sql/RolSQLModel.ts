import { Modulo } from "../../RolEntity";

export type RolSQLModelData = {
  nombre: string;
  tipo: string;
  permisos: string;
  modulos: Modulo[];
};

export class RolSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("rol", {
      id: { type: Sequelize.UUID, primaryKey: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      tipo: { type: Sequelize.STRING(80), allowNull: false },
      permisos: { type: Sequelize.TEXT, allowNull: false },
      modulos: { type: Sequelize.JSON, defaultValue: [] },
    });
  }
}
