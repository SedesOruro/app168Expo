export class ContactoEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define("contactoEmergencia", {}, { tableName: "contactos_emergencia", freezeTableName: true });
  }
}
