export class HistorialEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    const historialEmergencia = sequelize.define(
      "historial_emergencia",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        emergencia_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        estado_anterior_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
        estado_nuevo_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false },
        actor_usuario_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        actor_admin_id: { type: Sequelize.UUID, allowNull: true },
        observacion: { type: Sequelize.STRING(1000), allowNull: true },
        latitud: { type: Sequelize.DECIMAL(21, 18), allowNull: true },
        longitud: { type: Sequelize.DECIMAL(21, 18), allowNull: true },
        metadata: { type: Sequelize.JSON, allowNull: true },
      },
      {
        tableName: "historial_emergencia",
        freezeTableName: true,
        paranoid: false,
        updatedAt: false,
        createdAt: "created_at",
      },
    );

    historialEmergencia.associate = (models: Record<string, any>) => {
      historialEmergencia.belongsTo(models.estadoEmergencia, {
        as: "estadoNuevo",
        foreignKey: "estado_nuevo_id",
      });
    };

    return historialEmergencia;
  }
}
