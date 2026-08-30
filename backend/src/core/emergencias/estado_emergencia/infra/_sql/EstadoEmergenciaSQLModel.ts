export class EstadoEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "estado_emergencia",
      {
        id: { type: Sequelize.SMALLINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        codigo: { type: Sequelize.STRING(40), allowNull: false, unique: true },
        nombre: { type: Sequelize.STRING(100), allowNull: false },
        es_final: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        orden: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { tableName: "estados_emergencia", freezeTableName: true, timestamps: false },
    );
  }
}
