export type EmergenciaSQLModelData = {
  id: number;
  uuid: string;
  codigo_publico: string;
  idempotency_key: string;
  usuario_id: number;
  tipo_emergencia_id: number;
  estado_id: number;
  centro_salud_sugerido_id?: number | null;
  operador_id?: string | null;
  gravedad?: string | null;
  puntaje_triage: number;
  descripcion?: string | null;
  cantidad_afectados: number;
  latitud: number;
  longitud: number;
  precision_metros?: number | null;
  direccion_referencia?: string | null;
  ubicacion_confirmada: boolean;
  puede_hablar: boolean;
  metadata?: Record<string, unknown> | null;
  reportada_at: Date;
  finalizada_at?: Date | null;
};

export class EmergenciaSQLModel {
  static define(sequelize: any, Sequelize: any) {
    const emergencia = sequelize.define(
      "emergencia",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        uuid: { type: Sequelize.UUID, allowNull: false, unique: true },
        codigo_publico: { type: Sequelize.STRING(40), allowNull: false, unique: true },
        idempotency_key: { type: Sequelize.UUID, allowNull: false },
        usuario_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        tipo_emergencia_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false },
        estado_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false },
        centro_salud_sugerido_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        operador_id: { type: Sequelize.UUID, allowNull: true },
        gravedad: { type: Sequelize.STRING(30), allowNull: true },
        puntaje_triage: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        descripcion: { type: Sequelize.TEXT, allowNull: true },
        cantidad_afectados: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
        latitud: { type: Sequelize.DECIMAL(21, 18), allowNull: false },
        longitud: { type: Sequelize.DECIMAL(21, 18), allowNull: false },
        precision_metros: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        direccion_referencia: { type: Sequelize.STRING(700), allowNull: true },
        ubicacion_confirmada: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        puede_hablar: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        metadata: { type: Sequelize.JSON, allowNull: true },
        reportada_at: { type: Sequelize.DATE, allowNull: false },
        finalizada_at: { type: Sequelize.DATE, allowNull: true },
      },
      {
        tableName: "emergencias",
        freezeTableName: true,
        paranoid: false,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );

    emergencia.associate = (models: Record<string, any>) => {
      emergencia.belongsTo(models.ciudadano, { as: "ciudadano", foreignKey: "usuario_id" });
      emergencia.belongsTo(models.tipoEmergencia, { as: "tipo", foreignKey: "tipo_emergencia_id" });
      emergencia.belongsTo(models.estadoEmergencia, { as: "estado", foreignKey: "estado_id" });
      emergencia.belongsTo(models.centroSalud, { as: "centro", foreignKey: "centro_salud_sugerido_id" });
      emergencia.hasMany(models.respuestaTriage, { as: "triage", foreignKey: "emergencia_id" });
      emergencia.hasMany(models.historialEmergencia, { as: "historial", foreignKey: "emergencia_id" });
      emergencia.hasMany(models.evidenciaEmergencia, { as: "evidencias", foreignKey: "emergencia_id" });
      // El operador es personal administrativo (tabla `usuario`), de otro modulo:
      // sin constraint para no acoplar el esquema de emergencias al de seguridad.
      emergencia.belongsTo(models.usuario, {
        as: "operador",
        foreignKey: "operador_id",
        constraints: false,
      });
    };

    return emergencia;
  }
}
