export class SesionRefreshSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("sesionRefresh", {}, { tableName: "sesiones_refresh", freezeTableName: true });
  }
}
