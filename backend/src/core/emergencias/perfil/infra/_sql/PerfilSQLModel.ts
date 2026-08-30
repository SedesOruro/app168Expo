export class PerfilSQLModel {
  static define(sequelize: any, Sequelize: any) {
    return sequelize.define(
      "perfil",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        usuario_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, unique: true },
        nombres: { type: Sequelize.STRING(120), allowNull: false },
        apellidos: { type: Sequelize.STRING(160), allowNull: false },
        cedula_identidad: { type: Sequelize.STRING(40), allowNull: false },
        complemento_ci: { type: Sequelize.STRING(10), allowNull: true },
        fecha_nacimiento: { type: Sequelize.DATEONLY, allowNull: false },
        sexo: { type: Sequelize.STRING(30), allowNull: true },
        tipo_sangre: { type: Sequelize.STRING(10), allowNull: true },
        direccion: { type: Sequelize.STRING(300), allowNull: true },
        departamento: { type: Sequelize.STRING(100), allowNull: true },
        municipio: { type: Sequelize.STRING(120), allowNull: true },
        alergias: { type: Sequelize.TEXT, allowNull: true },
        enfermedades_cronicas: { type: Sequelize.TEXT, allowNull: true },
        medicamentos_actuales: { type: Sequelize.TEXT, allowNull: true },
        condiciones_relevantes: { type: Sequelize.TEXT, allowNull: true },
        seguro_medico: { type: Sequelize.STRING(160), allowNull: true },
        numero_seguro: { type: Sequelize.STRING(100), allowNull: true },
        terminos_version: { type: Sequelize.STRING(30), allowNull: false },
        terminos_aceptados_at: { type: Sequelize.DATE, allowNull: false },
      },
      {
        tableName: "perfiles",
        freezeTableName: true,
        paranoid: false,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );
  }
}
