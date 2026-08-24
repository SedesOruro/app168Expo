export class EmergenciasSQLModels {
  static define(sequelize: any, Sequelize: any): Record<string, any> {
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

    const sesionRefresh = sequelize.define(
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
      { tableName: "sesiones_refresh", freezeTableName: true, paranoid: false, updatedAt: false, createdAt: "created_at" },
    );

    const perfil = sequelize.define(
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
      { tableName: "perfiles", freezeTableName: true, paranoid: false, createdAt: "created_at", updatedAt: "updated_at" },
    );

    const contactoEmergencia = sequelize.define(
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
      { tableName: "contactos_emergencia", freezeTableName: true, paranoid: false, createdAt: "created_at", updatedAt: "updated_at" },
    );

    const centroSalud = sequelize.define(
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
      { tableName: "centros_salud", freezeTableName: true, paranoid: false, createdAt: "created_at", updatedAt: "updated_at" },
    );

    const tipoEmergencia = sequelize.define(
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

    const estadoEmergencia = sequelize.define(
      "estado_emergencia",
      {
        id: { type: Sequelize.SMALLINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        codigo: { type: Sequelize.STRING(40), allowNull: false, unique: true },
        nombre: { type: Sequelize.STRING(100), allowNull: false },
        es_final: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        orden: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { tableName: "estados_emergencia", freezeTableName: true, timestamps: false },
    );

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
      { tableName: "emergencias", freezeTableName: true, paranoid: false, createdAt: "created_at", updatedAt: "updated_at" },
    );

    const respuestaTriage = sequelize.define(
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
      { tableName: "respuestas_triage", freezeTableName: true, paranoid: false, updatedAt: false, createdAt: "created_at" },
    );

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
      { tableName: "historial_emergencia", freezeTableName: true, paranoid: false, updatedAt: false, createdAt: "created_at" },
    );

    const evidenciaEmergencia = sequelize.define(
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
      { tableName: "evidencias_emergencia", freezeTableName: true, paranoid: false, updatedAt: false, createdAt: "created_at" },
    );

    ciudadano.hasOne(perfil, { as: "perfil", foreignKey: "usuario_id" });
    ciudadano.hasMany(contactoEmergencia, { as: "contactos", foreignKey: "usuario_id" });
    ciudadano.hasMany(emergencia, { as: "emergencias", foreignKey: "usuario_id" });
    emergencia.belongsTo(ciudadano, { as: "ciudadano", foreignKey: "usuario_id" });
    emergencia.belongsTo(tipoEmergencia, { as: "tipo", foreignKey: "tipo_emergencia_id" });
    emergencia.belongsTo(estadoEmergencia, { as: "estado", foreignKey: "estado_id" });
    emergencia.belongsTo(centroSalud, { as: "centro", foreignKey: "centro_salud_sugerido_id" });
    emergencia.hasMany(respuestaTriage, { as: "triage", foreignKey: "emergencia_id" });
    emergencia.hasMany(historialEmergencia, { as: "historial", foreignKey: "emergencia_id" });
    emergencia.hasMany(evidenciaEmergencia, { as: "evidencias", foreignKey: "emergencia_id" });
    historialEmergencia.belongsTo(estadoEmergencia, { as: "estadoNuevo", foreignKey: "estado_nuevo_id" });

    return {
      ciudadano,
      sesionRefresh,
      perfil,
      contactoEmergencia,
      centroSalud,
      tipoEmergencia,
      estadoEmergencia,
      emergencia,
      respuestaTriage,
      historialEmergencia,
      evidenciaEmergencia,
    };
  }
}


