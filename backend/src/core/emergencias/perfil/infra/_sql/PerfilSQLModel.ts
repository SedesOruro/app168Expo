export class PerfilSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("perfil", {}, { tableName: "perfiles", freezeTableName: true });
  }
}
