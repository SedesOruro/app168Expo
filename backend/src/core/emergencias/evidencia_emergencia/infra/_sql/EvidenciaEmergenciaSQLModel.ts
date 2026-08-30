export class EvidenciaEmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "evidencia_emergencia",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        uuid: { type: Sequelize.UUID, allowNull: false, unique: true },
        emergencia_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        tipo: { type: Sequelize.ENUM("NOTA", "FOTO", "AUDIO"), allowNull: false },
        contenido: { type: Sequelize.TEXT, allowNull: true },
        archivo_url: { type: Sequelize.STRING(700), allowNull: true },
        mime_type: { type: Sequelize.STRING(120), allowNull: true },
        duracion_segundos: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
      },
      {
        tableName: "evidencias_emergencia",
        freezeTableName: true,
        paranoid: false,
        updatedAt: false,
        createdAt: "created_at",
      },
    );
  }
}
