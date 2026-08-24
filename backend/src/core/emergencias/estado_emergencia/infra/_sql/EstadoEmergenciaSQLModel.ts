export class EstadoEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("estadoEmergencia", {}, { tableName: "estados_emergencia", freezeTableName: true });
  }
}
