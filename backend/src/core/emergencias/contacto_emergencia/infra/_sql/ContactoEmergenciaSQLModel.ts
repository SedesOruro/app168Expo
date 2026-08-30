export class ContactoEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "contacto_emergencia",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        usuario_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        nombre_completo: { type: Sequelize.STRING(180), allowNull: false },
        parentesco: { type: Sequelize.STRING(80), allowNull: false, defaultValue: "CONTACTO" },
        telefono: { type: Sequelize.STRING(30), allowNull: false },
        telefono_alternativo: { type: Sequelize.STRING(30), allowNull: true },
        es_principal: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      {
        tableName: "contactos_emergencia",
        freezeTableName: true,
        paranoid: false,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );
  }
}
