export class TipoEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "tipo_emergencia",
      {
        id: { type: Sequelize.SMALLINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        codigo: { type: Sequelize.STRING(40), allowNull: false, unique: true },
        nombre: { type: Sequelize.STRING(100), allowNull: false },
        descripcion: { type: Sequelize.STRING(255), allowNull: true },
        icono: { type: Sequelize.STRING(100), allowNull: true },
        color_hex: { type: Sequelize.STRING(7), allowNull: true },
        orden: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { tableName: "tipos_emergencia", freezeTableName: true, timestamps: false },
    );
  }
}
