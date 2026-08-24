export class TipoEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("tipoEmergencia", {}, { tableName: "tipos_emergencia", freezeTableName: true });
  }
}
