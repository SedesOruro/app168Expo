export class CiudadanoSQLModel {
  static define(sequelize: any, Sequelize: any) {
    const ciudadano = sequelize.define(
      "ciudadano",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        uuid: { type: Sequelize.UUID, allowNull: false, unique: true },
        email: { type: Sequelize.STRING(190), allowNull: false, unique: true },
        telefono: { type: Sequelize.STRING(30), allowNull: true, unique: true },
        password_hash: { type: Sequelize.STRING(255), allowNull: false },
        rol: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "CIUDADANO" },
        estado: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "ACTIVO" },
        ultimo_acceso_at: { type: Sequelize.DATE, allowNull: true },
      },
      {
        tableName: "ciudadanos",
        freezeTableName: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
      },
    );

    ciudadano.associate = (models: Record<string, any>) => {
      ciudadano.hasOne(models.perfil, { as: "perfil", foreignKey: "usuario_id" });
      ciudadano.hasMany(models.contactoEmergencia, { as: "contactos", foreignKey: "usuario_id" });
      ciudadano.hasMany(models.emergencia, { as: "emergencias", foreignKey: "usuario_id" });
    };

    return ciudadano;
  }
}
