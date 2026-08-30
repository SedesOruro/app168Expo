export class SesionRefreshSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "sesion_refresh",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        usuario_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        jti: { type: Sequelize.UUID, allowNull: false, unique: true },
        token_hash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
        dispositivo: { type: Sequelize.STRING(255), allowNull: true },
        ip_origen: { type: Sequelize.STRING(45), allowNull: true },
        expira_at: { type: Sequelize.DATE, allowNull: false },
        revocado_at: { type: Sequelize.DATE, allowNull: true },
        reemplazado_por_jti: { type: Sequelize.UUID, allowNull: true },
      },
      {
        tableName: "sesiones_refresh",
        freezeTableName: true,
        paranoid: false,
        updatedAt: false,
        createdAt: "created_at",
      },
    );
  }
}
