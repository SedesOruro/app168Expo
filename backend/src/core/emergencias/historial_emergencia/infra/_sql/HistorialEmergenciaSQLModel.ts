export class HistorialEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("historialEmergencia", {}, { tableName: "historial_emergencia", freezeTableName: true });
  }
}
