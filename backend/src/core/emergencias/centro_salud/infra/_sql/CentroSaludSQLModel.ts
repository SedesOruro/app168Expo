export type CentroSaludSQLModelData = {
  id: number;
  uuid: string;
  codigo_rues: string;
  departamento: string;
  red_salud: string;
  municipio: string;
  nombre: string;
  latitud?: number | null;
  longitud?: number | null;
  activo: boolean;
};

export class CentroSaludSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "centro_salud",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        uuid: { type: Sequelize.UUID, allowNull: false, unique: true },
        numero_reporte: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
        codigo_rues: { type: Sequelize.STRING(40), allowNull: false, unique: true },
        departamento: { type: Sequelize.STRING(100), allowNull: false },
        red_salud: { type: Sequelize.STRING(160), allowNull: false },
        municipio: { type: Sequelize.STRING(160), allowNull: false },
        nombre: { type: Sequelize.STRING(255), allowNull: false },
        subsector: { type: Sequelize.STRING(120), allowNull: true },
        institucion: { type: Sequelize.STRING(160), allowNull: true },
        nivel: { type: Sequelize.STRING(100), allowNull: true },
        tipo: { type: Sequelize.STRING(160), allowNull: true },
        ambito: { type: Sequelize.STRING(80), allowNull: true },
        localidad: { type: Sequelize.STRING(180), allowNull: true },
        direccion: { type: Sequelize.STRING(700), allowNull: true },
        latitud: { type: Sequelize.DECIMAL(21, 18), allowNull: true },
        longitud: { type: Sequelize.DECIMAL(21, 18), allowNull: true },
        cerca_frontera: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        distancia_frontera_km: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        estado_fuente: { type: Sequelize.STRING(80), allowNull: true },
        fecha_registro_fuente: { type: Sequelize.DATEONLY, allowNull: true },
        fecha_modificacion_fuente: { type: Sequelize.DATEONLY, allowNull: true },
        fuente_archivo: { type: Sequelize.STRING(255), allowNull: false, defaultValue: "ADMIN_168" },
        gestion_fuente: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      {
        tableName: "centros_salud",
        freezeTableName: true,
        paranoid: false,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );
  }
}
