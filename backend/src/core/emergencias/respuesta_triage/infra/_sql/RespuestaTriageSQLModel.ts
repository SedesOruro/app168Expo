export class RespuestaTriageSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "respuesta_triage",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        emergencia_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        pregunta_codigo: { type: Sequelize.STRING(60), allowNull: false },
        pregunta_texto: { type: Sequelize.STRING(500), allowNull: false },
        opcion_codigo: { type: Sequelize.STRING(60), allowNull: true },
        respuesta_texto: { type: Sequelize.STRING(1000), allowNull: true },
        peso_aplicado: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
      },
      {
        tableName: "respuestas_triage",
        freezeTableName: true,
        paranoid: false,
        updatedAt: false,
        createdAt: "created_at",
      },
    );
  }
}
