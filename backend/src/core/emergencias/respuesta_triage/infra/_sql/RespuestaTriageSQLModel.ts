export class RespuestaTriageSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("respuestaTriage", {}, { tableName: "respuestas_triage", freezeTableName: true });
  }
}
