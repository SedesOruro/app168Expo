export class EvidenciaEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("evidenciaEmergencia", {}, { tableName: "evidencias_emergencia", freezeTableName: true });
  }
}
