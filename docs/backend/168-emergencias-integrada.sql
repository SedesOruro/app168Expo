-- ============================================================================
-- 168 Emergencias - Esquema integrado movil + backend + administrador
-- Motor: MySQL 8.0+
-- 13 tablas operativas: personal, ciudadanos, emergencias y evidencias
-- Incluye 204 centros de salud RUES del archivo proporcionado
-- El registro RUES 400280 no trae coordenadas ni estado y se conserva con NULL.
--
-- Tablas de cuentas, para evitar confusiones entre nombres parecidos:
--   `usuario`    -> personal administrativo (administrador, operador). PK CHAR(36), se relaciona con `rol`.
--   `ciudadanos` -> cuentas de la aplicacion movil. PK BIGINT.
--   `usuarios`   -> OBSOLETA. Nombre anterior de `ciudadanos`. Este script ya no
--                   la crea y ninguna clave foranea la referencia. Se conserva
--                   en las bases existentes solo como respaldo del esquema
--                   antiguo: no escribir ni leer desde el backend.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '-04:00';

CREATE DATABASE IF NOT EXISTS `168-db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `168-db`;

-- Estructura administrativa incorporada desde el respaldo cra_nuevo.
-- Se excluyeron los JWT historicos almacenados en `devices` y la tabla legacy `role`.
CREATE TABLE IF NOT EXISTS rol (
  id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(80) NOT NULL,
  permisos TEXT NOT NULL,
  modulos JSON DEFAULT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fecha_eliminacion DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rol_tipo (tipo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
  id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  username VARCHAR(160) NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(220) DEFAULT '',
  nombre VARCHAR(120) NOT NULL,
  primer_apellido VARCHAR(120) DEFAULT '',
  segundo_apellido VARCHAR(120) DEFAULT '',
  ci VARCHAR(40) DEFAULT '',
  email VARCHAR(160) NOT NULL,
  direccion VARCHAR(220) DEFAULT '',
  celular VARCHAR(40) DEFAULT '',
  genero ENUM('MASCULINO','FEMENINO','NINGUNO') DEFAULT 'NINGUNO',
  is_jefe BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  estado ENUM('ACTIVO','INACTIVO','ELIMINADO') DEFAULT 'ACTIVO',
  avatar VARCHAR(220) DEFAULT 'avatar_default.png',
  fid_role CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  devices JSON DEFAULT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fecha_eliminacion DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_username (username),
  UNIQUE KEY uq_usuario_email (email),
  INDEX idx_usuario_rol (fid_role, activo),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (fid_role) REFERENCES rol(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO rol (id, nombre, tipo, permisos, modulos) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'Administrador',
    'administrador',
    '{"read":true,"create":true,"edit":true,"remove":true}',
    '[{"id":"emergencias","name":"emergencias","path":"/emergencias","title":"Emergencias"},{"id":"ciudadanos","name":"ciudadanos","path":"/ciudadanos","title":"Ciudadanos"},{"id":"centros-salud","name":"centros-salud","path":"/centros-salud","title":"Centros de salud"},{"id":"usuarios","name":"usuarios","path":"/usuarios","title":"Usuarios"},{"id":"roles","name":"roles","path":"/roles","title":"Roles"}]'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Operador 168',
    'operador',
    '{"read":true,"edit":true,"send":true}',
    '[{"id":"emergencias","name":"emergencias","path":"/emergencias","title":"Emergencias"},{"id":"ciudadanos","name":"ciudadanos","path":"/ciudadanos","title":"Ciudadanos"}]'
  )
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  permisos = VALUES(permisos),
  modulos = VALUES(modulos),
  fecha_eliminacion = NULL;

-- 1. Cuenta de ciudadano de la aplicacion movil: acceso, rol y estado.
-- El esquema original llamaba `usuarios` a esta tabla. El backend usa
-- `ciudadanos` para no confundirla con `usuario` (personal administrativo);
-- mas abajo hay un bloque idempotente que migra las bases creadas con el
-- nombre anterior.
-- La tabla `usuarios` queda obsoleta a partir de aqui: no se elimina para no
-- perder datos en entornos que aun no migraron, pero ninguna clave foranea la
-- referencia y ningun modelo del backend la mapea. Cualquier cuenta nueva de
-- ciudadano va exclusivamente en `ciudadanos`.
CREATE TABLE IF NOT EXISTS ciudadanos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  email VARCHAR(190) NOT NULL,
  telefono VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'CIUDADANO',
  estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
  ultimo_acceso_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_ciudadanos_uuid (uuid),
  UNIQUE KEY uq_ciudadanos_email (email),
  UNIQUE KEY uq_ciudadanos_telefono (telefono),
  INDEX idx_ciudadanos_estado (estado, rol)
) ENGINE=InnoDB;

-- Base creada con el nombre anterior: se copian las cuentas conservando el id
-- para que las claves foraneas de perfiles, contactos y emergencias sigan siendo validas.
SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'usuarios'
  ),
  'INSERT INTO ciudadanos (id, uuid, email, telefono, password_hash, rol, estado, ultimo_acceso_at, created_at, updated_at, deleted_at)
     SELECT id, uuid, email, telefono, password_hash, rol, estado, ultimo_acceso_at, created_at, updated_at, deleted_at
     FROM usuarios WHERE password_hash IS NOT NULL
     ON DUPLICATE KEY UPDATE email = VALUES(email)',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Refresh tokens JWT rotativos. Guardar solo el hash del token.
CREATE TABLE IF NOT EXISTS sesiones_refresh (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  jti CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  dispositivo VARCHAR(255) NULL,
  ip_origen VARCHAR(45) NULL,
  expira_at DATETIME NOT NULL,
  revocado_at DATETIME NULL,
  reemplazado_por_jti CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sesiones_refresh_jti (jti),
  UNIQUE KEY uq_sesiones_refresh_hash (token_hash),
  INDEX idx_sesiones_refresh_usuario (usuario_id, revocado_at, expira_at),
  CONSTRAINT fk_sesiones_refresh_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Datos personales, médicos y aceptación de términos del registro multipaso.
CREATE TABLE IF NOT EXISTS perfiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(160) NOT NULL,
  cedula_identidad VARCHAR(40) NOT NULL,
  complemento_ci VARCHAR(10) NULL,
  fecha_nacimiento DATE NOT NULL,
  sexo VARCHAR(30) NULL,
  tipo_sangre VARCHAR(10) NULL,
  direccion VARCHAR(300) NULL,
  departamento VARCHAR(100) NULL,
  municipio VARCHAR(120) NULL,
  alergias TEXT NULL,
  enfermedades_cronicas TEXT NULL,
  medicamentos_actuales TEXT NULL,
  condiciones_relevantes TEXT NULL,
  seguro_medico VARCHAR(160) NULL,
  numero_seguro VARCHAR(100) NULL,
  terminos_version VARCHAR(30) NOT NULL,
  terminos_aceptados_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_perfiles_usuario (usuario_id),
  UNIQUE KEY uq_perfiles_ci (cedula_identidad, complemento_ci),
  CONSTRAINT fk_perfiles_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Contactos a avisar durante una emergencia.
CREATE TABLE IF NOT EXISTS contactos_emergencia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  nombre_completo VARCHAR(180) NOT NULL,
  parentesco VARCHAR(80) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  telefono_alternativo VARCHAR(30) NULL,
  es_principal BOOLEAN NOT NULL DEFAULT FALSE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contactos_usuario (usuario_id, activo, es_principal),
  CONSTRAINT fk_contactos_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Catálogo RUES completo utilizado para búsquedas por cercanía.
CREATE TABLE IF NOT EXISTS centros_salud (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL,
  numero_reporte INT UNSIGNED NULL,
  codigo_rues VARCHAR(40) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  red_salud VARCHAR(160) NOT NULL,
  municipio VARCHAR(160) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  subsector VARCHAR(120) NULL,
  institucion VARCHAR(160) NULL,
  nivel VARCHAR(100) NULL,
  tipo VARCHAR(160) NULL,
  ambito VARCHAR(80) NULL,
  localidad VARCHAR(180) NULL,
  direccion VARCHAR(700) NULL,
  latitud DECIMAL(21,18) NULL,
  longitud DECIMAL(21,18) NULL,
  cerca_frontera BOOLEAN NOT NULL DEFAULT FALSE,
  distancia_frontera_km DECIMAL(10,2) NULL,
  estado_fuente VARCHAR(80) NULL,
  fecha_registro_fuente DATE NULL,
  fecha_modificacion_fuente DATE NULL,
  fuente_archivo VARCHAR(255) NOT NULL,
  gestion_fuente SMALLINT UNSIGNED NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_centros_salud_uuid (uuid),
  UNIQUE KEY uq_centros_salud_codigo_rues (codigo_rues),
  INDEX idx_centros_salud_ubicacion (departamento, municipio, localidad),
  INDEX idx_centros_salud_red (red_salud, activo),
  INDEX idx_centros_salud_coordenadas (latitud, longitud),
  FULLTEXT KEY ftx_centros_salud_busqueda (nombre, direccion, localidad, municipio),
  CONSTRAINT chk_centros_salud_latitud CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),
  CONSTRAINT chk_centros_salud_longitud CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
  CONSTRAINT chk_centros_salud_distancia CHECK (distancia_frontera_km IS NULL OR distancia_frontera_km >= 0)
) ENGINE=InnoDB;

-- 6. Tipos presentados en el inicio del flujo de solicitud de ayuda.
CREATE TABLE IF NOT EXISTS tipos_emergencia (
  id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  icono VARCHAR(100) NULL,
  color_hex CHAR(7) NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_tipos_emergencia_codigo (codigo)
) ENGINE=InnoDB;

-- 7. Estados mínimos para mostrar el seguimiento de una solicitud.
CREATE TABLE IF NOT EXISTS estados_emergencia (
  id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  es_final BOOLEAN NOT NULL DEFAULT FALSE,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_estados_emergencia_codigo (codigo)
) ENGINE=InnoDB;

-- 8. Solicitud principal de emergencia.
CREATE TABLE IF NOT EXISTS emergencias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL,
  codigo_publico VARCHAR(40) NOT NULL,
  idempotency_key CHAR(36) NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  tipo_emergencia_id SMALLINT UNSIGNED NOT NULL,
  estado_id SMALLINT UNSIGNED NOT NULL,
  centro_salud_sugerido_id BIGINT UNSIGNED NULL,
  operador_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  gravedad VARCHAR(30) NULL,
  puntaje_triage INT NOT NULL DEFAULT 0,
  descripcion TEXT NULL,
  cantidad_afectados SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  latitud DECIMAL(21,18) NOT NULL,
  longitud DECIMAL(21,18) NOT NULL,
  precision_metros DECIMAL(10,2) NULL,
  direccion_referencia VARCHAR(700) NULL,
  ubicacion_confirmada BOOLEAN NOT NULL DEFAULT FALSE,
  puede_hablar BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSON NULL,
  reportada_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finalizada_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emergencias_uuid (uuid),
  UNIQUE KEY uq_emergencias_codigo_publico (codigo_publico),
  UNIQUE KEY uq_emergencias_idempotency (usuario_id, idempotency_key),
  INDEX idx_emergencias_usuario (usuario_id, created_at),
  INDEX idx_emergencias_estado (estado_id, gravedad, created_at),
  INDEX idx_emergencias_coordenadas (latitud, longitud),
  CONSTRAINT fk_emergencias_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE RESTRICT,
  CONSTRAINT fk_emergencias_tipo FOREIGN KEY (tipo_emergencia_id) REFERENCES tipos_emergencia(id) ON DELETE RESTRICT,
  CONSTRAINT fk_emergencias_estado FOREIGN KEY (estado_id) REFERENCES estados_emergencia(id) ON DELETE RESTRICT,
  CONSTRAINT fk_emergencias_centro FOREIGN KEY (centro_salud_sugerido_id) REFERENCES centros_salud(id) ON DELETE SET NULL,
  CONSTRAINT fk_emergencias_operador FOREIGN KEY (operador_id) REFERENCES usuario(id) ON DELETE SET NULL,
  CONSTRAINT chk_emergencias_latitud CHECK (latitud BETWEEN -90 AND 90),
  CONSTRAINT chk_emergencias_longitud CHECK (longitud BETWEEN -180 AND 180),
  CONSTRAINT chk_emergencias_afectados CHECK (cantidad_afectados > 0)
) ENGINE=InnoDB;

-- Compatibilidad con la base movil anterior: CREATE TABLE IF NOT EXISTS no
-- agrega columnas cuando la tabla ya existe, por lo que estas migraciones son
-- deliberadamente idempotentes.
SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'emergencias' AND column_name = 'operador_id'
  ),
  'SELECT 1',
  'ALTER TABLE emergencias ADD COLUMN operador_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL AFTER centro_salud_sugerido_id'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'emergencias' AND column_name = 'puede_hablar'
  ),
  'SELECT 1',
  'ALTER TABLE emergencias ADD COLUMN puede_hablar BOOLEAN NOT NULL DEFAULT TRUE AFTER ubicacion_confirmada'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = DATABASE() AND table_name = 'emergencias' AND constraint_name = 'fk_emergencias_operador'
  ),
  'SELECT 1',
  'ALTER TABLE emergencias ADD CONSTRAINT fk_emergencias_operador FOREIGN KEY (operador_id) REFERENCES usuario(id) ON DELETE SET NULL'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. Respuestas de triage. Las preguntas se definen inicialmente en backend/configuración.
CREATE TABLE IF NOT EXISTS respuestas_triage (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  emergencia_id BIGINT UNSIGNED NOT NULL,
  pregunta_codigo VARCHAR(60) NOT NULL,
  pregunta_texto VARCHAR(500) NOT NULL,
  opcion_codigo VARCHAR(60) NULL,
  respuesta_texto VARCHAR(1000) NULL,
  respuesta_numero DECIMAL(12,2) NULL,
  respuesta_booleano BOOLEAN NULL,
  peso_aplicado SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_respuestas_triage_pregunta (emergencia_id, pregunta_codigo),
  CONSTRAINT fk_respuestas_triage_emergencia FOREIGN KEY (emergencia_id) REFERENCES emergencias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Línea de tiempo de estados para el seguimiento.
CREATE TABLE IF NOT EXISTS historial_emergencia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  emergencia_id BIGINT UNSIGNED NOT NULL,
  estado_anterior_id SMALLINT UNSIGNED NULL,
  estado_nuevo_id SMALLINT UNSIGNED NOT NULL,
  actor_usuario_id BIGINT UNSIGNED NULL,
  actor_admin_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  observacion VARCHAR(1000) NULL,
  latitud DECIMAL(21,18) NULL,
  longitud DECIMAL(21,18) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_historial_emergencia (emergencia_id, created_at),
  CONSTRAINT fk_historial_emergencia FOREIGN KEY (emergencia_id) REFERENCES emergencias(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_estado_anterior FOREIGN KEY (estado_anterior_id) REFERENCES estados_emergencia(id) ON DELETE SET NULL,
  CONSTRAINT fk_historial_estado_nuevo FOREIGN KEY (estado_nuevo_id) REFERENCES estados_emergencia(id) ON DELETE RESTRICT,
  CONSTRAINT fk_historial_actor FOREIGN KEY (actor_usuario_id) REFERENCES ciudadanos(id) ON DELETE SET NULL,
  CONSTRAINT fk_historial_actor_admin FOREIGN KEY (actor_admin_id) REFERENCES usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'historial_emergencia' AND column_name = 'actor_admin_id'
  ),
  'SELECT 1',
  'ALTER TABLE historial_emergencia ADD COLUMN actor_admin_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL AFTER actor_usuario_id'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = DATABASE() AND table_name = 'historial_emergencia' AND constraint_name = 'fk_historial_actor_admin'
  ),
  'SELECT 1',
  'ALTER TABLE historial_emergencia ADD CONSTRAINT fk_historial_actor_admin FOREIGN KEY (actor_admin_id) REFERENCES usuario(id) ON DELETE SET NULL'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 13. Evidencias opcionales de una emergencia: nota, fotografia o audio.
CREATE TABLE IF NOT EXISTS evidencias_emergencia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL,
  emergencia_id BIGINT UNSIGNED NOT NULL,
  tipo ENUM('NOTA','FOTO','AUDIO') NOT NULL,
  contenido TEXT NULL,
  archivo_url VARCHAR(700) NULL,
  mime_type VARCHAR(120) NULL,
  duracion_segundos SMALLINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_evidencias_uuid (uuid),
  INDEX idx_evidencias_emergencia (emergencia_id, created_at),
  CONSTRAINT fk_evidencias_emergencia FOREIGN KEY (emergencia_id) REFERENCES emergencias(id) ON DELETE CASCADE,
  CONSTRAINT chk_evidencia_contenido CHECK (
    (tipo = 'NOTA' AND contenido IS NOT NULL) OR
    (tipo IN ('FOTO','AUDIO') AND archivo_url IS NOT NULL)
  )
) ENGINE=InnoDB;

-- Repunte idempotente de las cuentas de ciudadano. Las bases creadas con el
-- esquema anterior mantienen estas claves foraneas apuntando a `usuarios`, lo
-- que impedia registrar perfiles, contactos y emergencias de cuentas nuevas.

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'perfiles'
      AND constraint_name = 'fk_perfiles_usuario'
      AND referenced_table_name = 'usuarios'
  ),
  'ALTER TABLE perfiles DROP FOREIGN KEY fk_perfiles_usuario',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'perfiles'
      AND constraint_name = 'fk_perfiles_usuario'
  ),
  'SELECT 1',
  'ALTER TABLE perfiles ADD CONSTRAINT fk_perfiles_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE CASCADE'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'contactos_emergencia'
      AND constraint_name = 'fk_contactos_usuario'
      AND referenced_table_name = 'usuarios'
  ),
  'ALTER TABLE contactos_emergencia DROP FOREIGN KEY fk_contactos_usuario',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'contactos_emergencia'
      AND constraint_name = 'fk_contactos_usuario'
  ),
  'SELECT 1',
  'ALTER TABLE contactos_emergencia ADD CONSTRAINT fk_contactos_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE CASCADE'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'sesiones_refresh'
      AND constraint_name = 'fk_sesiones_refresh_usuario'
      AND referenced_table_name = 'usuarios'
  ),
  'ALTER TABLE sesiones_refresh DROP FOREIGN KEY fk_sesiones_refresh_usuario',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'sesiones_refresh'
      AND constraint_name = 'fk_sesiones_refresh_usuario'
  ),
  'SELECT 1',
  'ALTER TABLE sesiones_refresh ADD CONSTRAINT fk_sesiones_refresh_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE CASCADE'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'emergencias'
      AND constraint_name = 'fk_emergencias_usuario'
      AND referenced_table_name = 'usuarios'
  ),
  'ALTER TABLE emergencias DROP FOREIGN KEY fk_emergencias_usuario',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'emergencias'
      AND constraint_name = 'fk_emergencias_usuario'
  ),
  'SELECT 1',
  'ALTER TABLE emergencias ADD CONSTRAINT fk_emergencias_usuario FOREIGN KEY (usuario_id) REFERENCES ciudadanos(id) ON DELETE RESTRICT'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'historial_emergencia'
      AND constraint_name = 'fk_historial_actor'
      AND referenced_table_name = 'usuarios'
  ),
  'ALTER TABLE historial_emergencia DROP FOREIGN KEY fk_historial_actor',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'historial_emergencia'
      AND constraint_name = 'fk_historial_actor'
  ),
  'SELECT 1',
  'ALTER TABLE historial_emergencia ADD CONSTRAINT fk_historial_actor FOREIGN KEY (actor_usuario_id) REFERENCES ciudadanos(id) ON DELETE SET NULL'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO tipos_emergencia (codigo, nombre, descripcion, icono, color_hex, orden) VALUES
  ('MEDICA', 'Emergencia médica', 'Lesión, enfermedad súbita o riesgo vital', 'medical-bag', '#D32F2F', 10),
  ('ACCIDENTE', 'Accidente', 'Accidente vial, doméstico o laboral', 'car-emergency', '#EF6C00', 20),
  ('INCENDIO', 'Incendio', 'Fuego, humo o riesgo de explosión', 'fire', '#C62828', 30),
  ('SEGURIDAD', 'Seguridad', 'Situación de violencia o amenaza', 'shield-alert', '#6A1B9A', 40),
  ('OTRO', 'Otra emergencia', 'Situación urgente no clasificada', 'alert-circle', '#455A64', 50)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), icono = VALUES(icono), color_hex = VALUES(color_hex), orden = VALUES(orden), activo = TRUE;

INSERT INTO estados_emergencia (codigo, nombre, es_final, orden) VALUES
  ('REPORTADA', 'Reportada', FALSE, 10),
  ('VALIDANDO', 'En validación', FALSE, 20),
  ('ASIGNADA', 'Ayuda asignada', FALSE, 30),
  ('EN_CAMINO', 'Ayuda en camino', FALSE, 40),
  ('EN_SITIO', 'Ayuda en el lugar', FALSE, 50),
  ('ATENDIDA', 'Atendida', TRUE, 60),
  ('CANCELADA', 'Cancelada', TRUE, 70)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), es_final = VALUES(es_final), orden = VALUES(orden), activo = TRUE;

INSERT INTO centros_salud (
  uuid,
  numero_reporte,
  codigo_rues,
  departamento,
  red_salud,
  municipio,
  nombre,
  subsector,
  institucion,
  nivel,
  tipo,
  ambito,
  localidad,
  direccion,
  latitud,
  longitud,
  cerca_frontera,
  distancia_frontera_km,
  estado_fuente,
  fecha_registro_fuente,
  fecha_modificacion_fuente,
  fuente_archivo,
  gestion_fuente,
  activo
) VALUES
  (UUID(), 1, '400053', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'ANCACATO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'ANCACATO', 'ANCACATO', -18.83898346285583, -66.6474709766765, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 2, '400054', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'ANTACOLLO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'AGUAS CALIENTES', 'ANTACOLLO', -18.7507679808, -66.6017828636, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 3, '400055', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'CACACHACA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'QAQACHACA', 'CALLE SIN NOMBRE', -18.81591178649568, -66.41457979706692, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 4, '400056', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'HOSP. SAN JUAN DE DIOS', 'Público', 'G.A.M.', '2do NIVEL', 'HOSPITAL SEGUNDO NIVEL', 'URBANO', 'CHALLAPATA', 'CALLE MENDEZ ARCOSY CALLE GERMAN BUSCH ENTRE CALLE SIN NOMBRE', -18.88168105494803, -66.7772951104178, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 5, '400058', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'CRUCE CULTA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CRUCE CULTA', 'AVENIDA POTOSI', -19.072318933671866, -66.20656532061766, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 6, '400059', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'LIVICHUCO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'LIVICHUCO', 'CALLE DE LA CANCHA', -18.887205364, -66.429851116, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 7, '400060', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'THOLAPALCA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'TOLAPALCA', 'CARRETERA ORURO POTOSI', -19.12733900997644, -66.4113016902653, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 8, '400142', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'HUCHUSUMA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUCHUSUMA PORVENIR', 'HUCHUSUMA PORVENIR', -18.7923518902, -66.8110151765, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 9, '400143', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'PARCO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'PARKU ARRIBA', 'SIN NOMBRE', -18.7469524757, -66.4098922568, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 10, '400190', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'HUANCANE', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUANCANE', 'CALLE 13 ENTRE HUARANCOCO', -18.7060689825, -66.875837591, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 11, '400206', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'NORTE CONDO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CATAVI COLLO', 'SIN NOMBRE', -18.942497821371063, -66.56478693870825, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 12, '400219', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'CULTA ANTIGUA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CULTA ANTIGUA', 'AVENIDA SAN ROQUE', -19.1476741646, -66.1784404867, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 13, '400220', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'HUANCARANI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUANCARANI', 'CARRETERA UNCIA', -18.789488, -66.646453, 0, 0, 'MIGRADO', '2023-12-27', '2025-09-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 14, '400229', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'SUMAJ CAUSAYPAJ', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CHALLAPATA', 'AV. HEROES DEL ACRE ENTRE RENGEL Y VALDIVIESO', -18.904973, -66.778189, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 15, '400243', 'Oruro', 'AZANAQUE', 'CHALLAPATA', '1º DE MAYO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'RURAL', 'CHALLAPATA', 'TOMAS FRIAS ESQUINA LITORAL NRO S/N', -18.90799168946216, -66.76951648807601, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 16, '400245', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'HUMAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'UMA MARCA', 'SOBRE LA CARRETERA A COLCUYO', -18.726900842091926, -66.67328294382624, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 17, '400267', 'Oruro', 'AZANAQUE', 'CHALLAPATA', 'C.S.A. VILLA DEL CARMEN', 'Público', 'G.A.M.', '1er NIVEL', 'CENTRO SALUD', 'RURAL', 'CHALLAPATA', 'Calle Chuquisaca entre Calle Kilometro 7 y Pasaje 2 de agosto', -18.89413648882249, -66.76486001516136, 0, 0, 'REGISTRADO', '2024-04-19', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 18, '400061', 'Oruro', 'AZANAQUE', 'SANTUARIO DE QUILLACAS', 'SANTUARIO DE QUILLACAS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SANTUARIO DE QUILLACAS', 'CALLE BOLIVAR S/N ENTRE LADISLAO CABRERA Y 3 DE MAYO', -19.233292471147767, -66.94229424309022, 0, 168, 'MIGRADO', '2023-12-27', '2026-06-11', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 19, '400062', 'Oruro', 'AZANAQUE', 'SANTUARIO DE QUILLACAS', 'SEVARUYO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SEVARUYO', 'JUNIN S/N ENTRE 25 DE MAYO', -19.3623449999, -66.8623889997, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 20, '400205', 'Oruro', 'AZANAQUE', 'SANTUARIO DE QUILLACAS', 'TORKO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'TORKO', 'CALLE"B" N°S/N,ENTRE CALLES "1! Y "2"', -19.411696067789507, -66.75636291503908, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 21, '400086', 'Oruro', 'AZANAQUE', 'PAZÑA', 'PAZÑA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'PAZÑA', 'TUPAC KATARI ENTRE CALLE SUCRE Y MARISCAL SANTA CRUZ', -18.597346239535057, -66.92262748440884, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 22, '400088', 'Oruro', 'AZANAQUE', 'PAZÑA', 'PEÑAS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'RURAL', 'APANAQUE', 'AV COMERCIO', -18.6923307231, -66.7577108534, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 23, '400089', 'Oruro', 'AZANAQUE', 'PAZÑA', 'TOTORAL', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'TOTORAL', 'AV. SANTA CRUZ Y C/ 25 DE MAYO', -18.49614872794013, -66.8735808398405, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 24, '400090', 'Oruro', 'AZANAQUE', 'PAZÑA', 'URMIRI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'URMIRI', 'C/Y-5 Y Y-8 URMIRI', -18.57824343382752, -66.87796322574711, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 25, '400223', 'Oruro', 'AZANAQUE', 'PAZÑA', 'AVICAYA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'AVICAYA', 'COMUNIDAD -AVICAYA', -18.520713628497617, -66.88236236572267, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 26, '400098', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'LUCA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'LUCA', 'AVENIDA ANTOFAGASTA ENTRE CALLE LITORAL Y CALLE SIN NOMBRE', -19.588741726201278, -67.89979934692384, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 27, '400099', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'PUQUI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'PUQUI', 'AVENIDA PUQUI', -19.5737882062, -67.3708607598, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 28, '400100', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'SALINAS DE G. MENDOZA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SALINAS DE GARCI MENDOZA', 'CALLE Y ENTRE SUCRE Y BATALLON COLORADOS FRENTE A LA PLAZA DEL ESTUDIANTE', -19.6341803681833, -67.6764410939022, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-20', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 29, '400101', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'SAN MARTIN', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SAN MARTIN', 'Calle principal entre Oruro y San Martin', -19.276627984732343, -67.59836733642275, 0, 288, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 30, '400102', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'UCUMASI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'UCUMASI', '6 DE AGOSTO Y LA PAZ', -19.13158615963558, -67.42380961226104, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 31, '400144', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'AROMA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'AROMA', '25 DE JULIO SN', -19.319385056721813, -67.31181586895447, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 32, '400145', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'CHALLACOTA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CHALLACOTA', 'BOLÍVAR S/N ENTRE CALLE DEL ESTUDIANTE Y CALLE SIN NOMBRE', -19.255030027613312, -67.75896207750239, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 33, '400240', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'P.S. VIRGEN DE CONCEPCION DE VILLA ESPERANZA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'QUINSUYO', 'VILLA ESPERANZA', -19.39672944682966, -67.28427531497904, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 34, '400277', 'Oruro', 'AZANAQUE', 'SALINAS DE GARCI MENDOZA', 'P.S. SALLY SAYCUNI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SALLY SUYCUNI', 'Comunidad sally suycuni', -19.368471, -67.4457791, 0, 0, 'REGISTRADO', '2026-03-26', '2026-06-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 35, '400103', 'Oruro', 'AZANAQUE', 'PAMPA AULLAGAS', 'PAMPA AULLAGAS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'PAMPA AULLAGAS', 'CALLE LITORAL ENTRE CALLE BOLIVAR', -19.196921720283097, -67.06319700814474, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 36, '400192', 'Oruro', 'AZANAQUE', 'PAMPA AULLAGAS', 'BENGAL VINTO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'BENGAL VINTO', 'BENGAL VINTO', -19.282816133, -67.0641481739, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 37, '400193', 'Oruro', 'AZANAQUE', 'PAMPA AULLAGAS', 'ICHALULA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ICHALULA', 'AV. FRANZ TAMAYO, ESQ. LOS ANGELES', -19.406950209306327, -67.1448383220627, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 38, '400129', 'Oruro', 'AZANAQUE', 'SANTIAGO DE HUARI', 'CASTILLO HUMA', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CASTILLA HUMA', 'AVENIDA PRINCIPAL DE CASTILLA HUMA', -19.1399464405, -66.7139422245, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 39, '400130', 'Oruro', 'AZANAQUE', 'SANTIAGO DE HUARI', 'HUARI', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SANTIAGO DE HUARI', 'CALLE ANICETO ARCE Y BENI', -19.0129703, -66.775443, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 40, '400132', 'Oruro', 'AZANAQUE', 'SANTIAGO DE HUARI', 'SAN PEDRO DE CONDO', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SAN PEDRO DE CONDO', 'AVENIDA POTOSI N°369 ENTRE AZANAQUE', -19.042048578649528, -66.74699656428517, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 41, '400133', 'Oruro', 'AZANAQUE', 'SANTIAGO DE HUARI', 'URMIRI DE QUILLACAS', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'URMIRI', 'CALLE BOLÍVAR S/N', -19.226905377326936, -66.72109689903536, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-13', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 42, '400134', 'Oruro', 'AZANAQUE', 'SANTIAGO DE HUARI', 'VICHAJ LUPE', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VICHAJLUPE', 'avenida principal vichajlupe', -19.252953637991734, -66.75138542845053, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-11', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 43, '400135', 'Oruro', 'AZANAQUE', 'SANTIAGO DE HUARI', 'MARKA LAGUNILLAS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'LAGUNILLAS', 'LAGUNILLAS', -19.229377176639527, -66.27441287911373, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 44, '400231', 'Oruro', 'AZANAQUE', 'SANTIAGO DE HUARI', 'GUADALUPE', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'GUADALUPE', 'avenida principal Guadalupe', -19.150296644721212, -66.74460366499723, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 45, '400045', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'CAÑOHUMA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CAÑOHUMA - VILLA TAROCA', 'CALLE SIN NOMBRE', -17.414201289469997, -67.26520466683918, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-14', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 46, '400046', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'SAN ANDRES DE CARACOLLO', 'Público', 'G.A.M.', '2do NIVEL', 'HOSPITAL SEGUNDO NIVEL', 'URBANO', 'CARACOLLO', 'LA PAZ / LABAYEN Y 30 DE NOVIEMBRE', -17.63993232910442, -67.21686629246172, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 47, '400047', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'HUERTA PAMPA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'HUERTA PAMPA', 'CALLE SIN NOMBRE', -17.526058378379687, -67.13584199918772, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 48, '400048', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'LA JOYA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'LA JOYA', 'CALLE BOLIVAR S/N ENTRE SANTA BARBARA', -17.775144655225393, -67.49653460960627, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-14', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 49, '400049', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'LAJMA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'LAJMA', 'LAJMA CALLE LA PAZ', -17.8942914617, -67.6719035897, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 50, '400179', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'VILA VILA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILA VILA', 'VILA VILA', -17.55737216666668, -67.36371157565831, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-27', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 51, '400214', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'HUNTUTA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUNTUTA', 'HUNTUTA', -17.521925086303582, -67.3260964323181, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 52, '400215', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'SILLOTA BELEN', 'Público', 'G.A.D.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SILLOTA BELEN', 'CALLE SIN NOMBRE Nº S/N COMUNIDAD CALASAYA CENTRAL SILLOTA BELEN MUNICIPIO CARACOLLO', -17.807717511569006, -67.3473232984543, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-27', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 53, '400216', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'SILLOTA VITO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SILLOTA VITO', 'CARRETERA LA JOYA', -17.88760995568206, -67.32663918172265, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 54, '400235', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'MARKA NUEVA LLALLAGUA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'NUEVA LLALLAGUA', 'NINGUNO', -17.79627146294365, -67.65474203772155, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-22', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 55, '400236', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'VENTILLA PONGO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'JESUS DE VENTILLA PONGO', 'VENTILLA PONGO', -17.51301874965462, -67.0876586153578, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-22', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 56, '400237', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'OCOTAVI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'OCOTAVI', 'CALLE SIN NOMBRE', -17.666529045245298, -67.04877801146837, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 57, '400246', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'QUEMALLA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'KEMALLA', 'SIN NOMBRE', -17.58771917539132, -67.29825521344007, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 58, '400263', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'P.S. YARVICOYA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILLA SANTA FE', 'U.E ARCA DE NOE', -17.53749605714312, -67.14448887193639, 0, 0, 'REGISTRADO', '2024-04-10', '2026-03-25', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 59, '400280', 'Oruro', 'NORTE ORURO', 'CARACOLLO', 'PUESTO DE SALUD CENTRAL HORENCO', 'Público', 'ABEN', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 60, '400003', 'Oruro', 'NORTE ORURO', 'PARÍA', 'HUAYNA PASTO GRANDE', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'HUAYÑA PASTO GRANDE', 'HUAYÑA PASTO GRANDE', -18.047133873897724, -66.96270082996229, 0, 0, 'REGISTRADO', '2024-04-10', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 61, '400005', 'Oruro', 'NORTE ORURO', 'PARÍA', 'LEQUEPALCA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'LEQUEPALCA', 'Lequepalca', -17.630985789446648, -66.95621946663243, 0, 0, 'REGISTRADO', '2024-04-10', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 62, '400033', 'Oruro', 'NORTE ORURO', 'PARÍA', 'P.S. BANDERANI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'URBANO', 'BANDERANI', 'CENTRAL BANDERANI EN LA CALLE D ENTRE CALLE 3 , CALLE D Y TERRENO DE LA COMUNIDAD', -17.84644271206796, -66.75038702220455, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-24', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 63, '400038', 'Oruro', 'NORTE ORURO', 'PARÍA', 'PARIA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'PARIA', 'CALLE 12 DE OCTUBRE ENTRE CALLE S/N Y CALLE ORURO', -17.8224585881, -67.0179536849, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 64, '400040', 'Oruro', 'NORTE ORURO', 'PARÍA', 'THOLAPALCA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'THOLA PALCA', 'TOLAPALCA', -17.8534535089875, -66.84182902280253, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-20', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 65, '400157', 'Oruro', 'NORTE ORURO', 'PARÍA', 'SORACACHI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SORACACHI', 'SORACACHI', -17.764345, -67.029389, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 66, '400158', 'Oruro', 'NORTE ORURO', 'PARÍA', 'GUARDANA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'GUARDAÑA', 'COMUNIDAD GUARDAÑA', -17.905155339700716, -66.93396272918376, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 67, '400202', 'Oruro', 'NORTE ORURO', 'PARÍA', 'CACHI CACHI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CACHI CACHI', 'CACHI CACHI', -17.927777491267427, -66.90030103247945, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-24', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 68, '400203', 'Oruro', 'NORTE ORURO', 'PARÍA', 'IRUMA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'IRUMA', 'IRUMA', -17.8277441232, -66.9523027133, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-24', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 69, '400204', 'Oruro', 'NORTE ORURO', 'PARÍA', 'C.S SEPULTURAS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SEPULTURAS', 'CALLE F S/N ENTRE CALLE 8', -17.9773818184, -67.0104918174, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-28', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 70, '400072', 'Oruro', 'NORTE ORURO', 'CURAHUARA DE CARANGAS', 'CURAHUARA DE CARANGAS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CURAGUARA DE CARANGAS', 'AV. 23 DE MARZO', -17.84427763232515, -68.40677979545232, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 71, '400073', 'Oruro', 'NORTE ORURO', 'CURAHUARA DE CARANGAS', 'LAGUNAS', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'LAGUNAS', 'CALLE "D" N° S/N ENTRE CALLE "2"', -18.22353035232952, -68.93714752790225, 1, 14, 'MIGRADO', '2023-12-27', '2024-12-13', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 72, '400074', 'Oruro', 'NORTE ORURO', 'CURAHUARA DE CARANGAS', 'SAJAMA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SAJAMA', 'AV. PANAMERICANA y WISALLA', -18.134381731668384, -68.97485554594445, 1, 15, 'MIGRADO', '2023-12-27', '2024-12-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 73, '400150', 'Oruro', 'NORTE ORURO', 'CURAHUARA DE CARANGAS', 'CULTA II', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CULTA', 'AVENIDA CULTA/ CALLE 2 Y CALLE 6', -18.01962983195869, -68.68272539137527, 0, 0, 'MIGRADO', '2023-12-27', '2026-02-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 74, '400117', 'Oruro', 'NORTE ORURO', 'EUCALIPTUS', 'EUCALIPTUS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'EUCALIPTUS', 'CALLE AVAROA ENTRE CAP. MORALES Y LA PAZ', -17.596652519932785, -67.510567963186, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 75, '400146', 'Oruro', 'NORTE ORURO', 'EUCALIPTUS', 'AMACHUMA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'AMACHUMA', 'AMACHUMA', -17.627499074890416, -67.39794768733161, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 76, '400147', 'Oruro', 'NORTE ORURO', 'EUCALIPTUS', 'QUELCATA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'QUELCATA', 'CARRETERA A EUCALIPTUS', -17.557464227977718, -67.48429255440419, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 77, '400123', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'CRUCERO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CRUCERO', 'CALLE SIN NOMBRE', -17.791189202427198, -68.28668125159275, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 78, '400124', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'CULTA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CULTA', 'CALLE SIN NOMBRE AL FRENDE DE LA UNIDAD EDUCATICA LITORAL DE CULTA', -17.973207024321482, -68.03880215433793, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-11', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 79, '400125', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'ROSA SANI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ROSASANI', 'ROSASANI', -17.71531609836879, -68.20427283567368, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 80, '400126', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'SAN PEDRO DE TOTORA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'TOTORA', 'TOTORA', -17.791929842359597, -68.14683620263885, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 81, '400127', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'SORA SORA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SORA SORA', 'SORA SORA', -17.9355949697, -68.1051338973, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 82, '400128', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'VINOHUTA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VINOHUTA', 'FRENTE A LA PLAZA PRINCIPAL', -17.850017078605525, -68.23382557325453, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 83, '400180', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'CALAZAYA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CALAZAYA', 'SIN NOMBRE', -17.6603450001, -68.2973890002, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 84, '400184', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'HUACANAPI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUACANAPI', 'PASANDO 2 CUADRAS DE PLAZA 8 DE DICIEMBRE HACIA ZONA SUD', -17.861173746412728, -68.03974093464278, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 85, '400225', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'VILLA IRPOCO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILLA IRPOCO', 'SIN NOMBRE S/N FRENTE ALA UNIDAD EDUCATIVA VILLA IRPOCO', -17.8742010002, -68.3301999997, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-27', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 86, '400264', 'Oruro', 'NORTE ORURO', 'TOTORA (ORR)', 'P.S.PUERTO ESCOMA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'PUERTO ESCOMA', 'COMUNIDAD PUERTO ESCOMA', -17.720464, -68.056019, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 87, '400139', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'CHUQUICHAMBI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CHUQUICHAMBI', 'CALLE S/N N° S/N ENTRE AVENIDA SIN NOMBRE', -17.90683474574128, -67.80496719038996, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 88, '400140', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'HUAYLLAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SANTIAGO DE HUAYLLAMARCA', 'AV. ORURO ENTRE EUCALIPTUS S/N', -17.83866566380995, -67.94284337850598, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-27', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 89, '400141', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'LLANQUERA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'LLANQUERA', 'COMUNIDAD DE LLANQUERA CALLE SIN NOMBRE', -17.99069800487145, -67.69262605126542, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 90, '400151', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'SAN MIGUEL (ORU)', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SAN MIGUEL', 'FRENTE A LA PLAZA PIEDRA LITICA 21 DE NOVIEMBRE MARCA SAN MIGUEL', -17.95522440744652, -67.74903258084662, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 91, '400207', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'CHOJNOHUMA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CHOJÑOHUMA', 'CHOJÑOHUMA', -17.756191742712637, -67.99900359709862, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-20', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 92, '400208', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'BELEN DE CHOQUECOTA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'BELEN DE CHOQUECOTA', 'CALLE S/N CANTON BELEN DE CHOQUECOTA', -17.99791227452683, -67.85013022094473, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 93, '400217', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'BELLA VISTA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'BELLA VISTA', 'S/N BELLA VISTA MUN. DE HUAYLLAMARCA', -18.053274767823805, -67.63921125161966, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-22', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 94, '400218', 'Oruro', 'NORTE ORURO', 'SANTIAGO DE HUAYLLAMARCA', 'PUERTO NEQUETA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ÑEQUETA', 'S/N ÑEQUETA', -17.791485458768836, -68.02082041697726, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-27', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 95, '400081', 'Oruro', 'RED OCCIDENTE', 'HUACHACALLA', 'HUACHACALLA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. INTEGRAL', 'RURAL', 'HUACHACALLA', 'CALLE 10 DE FEBRERO N° S/N ENTRE BOLÍVAR', -18.793258453966086, -68.26228375514633, 1, 72, 'MIGRADO', '2023-12-27', '2026-03-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 96, '400082', 'Oruro', 'RED OCCIDENTE', 'ESCARA', 'ESCARA (ORU)', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'ESCARA', 'AV. ORURO ENTRE CALLE SUCRE Y AV. COMERCIO', -18.85447281261388, -68.1720551114363, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 97, '400212', 'Oruro', 'RED OCCIDENTE', 'CRUZ DE MACHACAMARCA', 'CRUZ DE MACHACAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CRUZ DE MACHACAMARCA', 'AVENIDA HUACHACALLA AL LADO DERECHO DEL CORREGIMIENTO', -18.76944098563419, -68.31193897751668, 1, 100, 'MIGRADO', '2023-12-27', '2025-06-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 98, '400211', 'Oruro', 'RED OCCIDENTE', 'YUNGUYO DE LITORAL', 'YUNGUYO DE LITORAL', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'YUNGUYO', '25 DE JULIO', -17.98333, -67.15, 1, 70, 'MIGRADO', '2023-12-27', '2026-03-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 99, '400182', 'Oruro', 'RED OCCIDENTE', 'ESMERALDA', 'BELEN DE ESMERALDA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'BELEN', 'AV. 10 DE SEPTIEMBRE ENTRE CALLES BELÉN Y VIRGEN DE NATIVIDAD', -18.881325751884916, -68.25189823069857, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 100, '400249', 'Oruro', 'RED OCCIDENTE', 'ESMERALDA', 'ROMERO PAMPA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ROMERO PAMPA', 'AV. EVO MORALES S/N ENTRE AV. LITORAL LADO COMPLEJO DEPORTIVO DE LA COMUNIDAD DE ROMERO PAMPA', -18.91570036836122, -68.20856989236474, 1, 74, 'MIGRADO', '2023-12-27', '2026-03-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 101, '400268', 'Oruro', 'RED OCCIDENTE', 'ESMERALDA', 'ESMERALDA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ESMERALDA', 'CARRETERA INTERNACIONAL ORURO PISIGA', -18.845294111136216, -68.282561437285, 0, 0, 'REGISTRADO', '2024-04-12', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 102, '400104', 'Oruro', 'RED OCCIDENTE', 'SABAYA', 'CRUZ DE HUAYLLAS', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CRUZ DE HUAYLLAS', 'CRUZ DE HUAYLLAS', -18.967657429881445, -68.5209353699111, 1, 35, 'MIGRADO', '2023-12-27', '2025-06-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 103, '400105', 'Oruro', 'RED OCCIDENTE', 'SABAYA', 'JULO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'JULO', 'S/C', -18.701085238123063, -68.89164261921798, 1, 202, 'MIGRADO', '2023-12-27', '2025-01-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 104, '400106', 'Oruro', 'RED OCCIDENTE', 'SABAYA', 'NEGRILLOS', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'NEGRILLOS', 'CALLE ORURO NOR ESTE', -18.8268779994, -68.61128493, 1, 35, 'MIGRADO', '2023-12-27', '2026-06-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 105, '400107', 'Oruro', 'RED OCCIDENTE', 'SABAYA', 'PISIGA BOLIVAR', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'PISIGA BOLIVAR', 'AVENIDA BOLIVAR ENTRE PENTECOSTAL Y TARIJA', -19.271650325769237, -68.61405552314652, 1, 1, 'MIGRADO', '2023-12-27', '2025-06-11', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 106, '400108', 'Oruro', 'RED OCCIDENTE', 'SABAYA', 'SABAYA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SABAYA', 'AVENIDA DOBLE CIRCUNVALACION ENTRE CALLE POTOSI Y CALLE SANTA CRUZ', -19.015571436138874, -68.37287678510836, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 107, '400109', 'Oruro', 'RED OCCIDENTE', 'SABAYA', 'VILLA VITALINA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILLA VITALINA', 'VILLA VITALINA', -19.1913450004, -68.3563889997, 1, 20, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 108, '400110', 'Oruro', 'RED OCCIDENTE', 'COIPASA', 'COIPASA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'COIPASA', 'AVENIDA VILLARROEL ENTRE CALLE MURILLO', -19.275711458682927, -68.2799535371447, 1, 20, 'MIGRADO', '2023-12-27', '2024-12-27', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 109, '400111', 'Oruro', 'RED OCCIDENTE', 'URU CHIPAYA (NACIÓN ORIGINARIA URU CHIPAYA)', 'CHIPAYA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CHIPAYA', 'AVENIDA ORURO ENTTRE CALLE LA PAZ', -19.039320426124146, -68.09021527333974, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 110, '400154', 'Oruro', 'RED OCCIDENTE', 'URU CHIPAYA (NACIÓN ORIGINARIA URU CHIPAYA)', 'AYPARAVI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'AYPARAVI', 'CALLE ORURO ENTRE SABAYA', -19.03210429732096, -67.91440157768552, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 111, '400136', 'Oruro', 'RED OCCIDENTE', 'LA RIVERA', 'LA RIVERA', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'LA RIVERA', 'CALLE 6 DE ENERO, 10 DE FEBRERO Y ARGENTINA', -19.00263814395992, -68.64067497880717, 1, 264, 'MIGRADO', '2023-12-27', '2026-06-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 112, '400137', 'Oruro', 'RED OCCIDENTE', 'TODOS SANTOS', 'TODOS SANTOS', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'TODOS SANTOS', 'C/ COMERCIO Y ESPAÑA', -19.0138684818, -68.7190755372, 1, 272, 'MIGRADO', '2023-12-27', '2025-09-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 113, '400138', 'Oruro', 'RED OCCIDENTE', 'CARANGAS', 'CARANGAS', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CARANGAS', 'Calama y Antofagasta lote 3', -18.94041243252248, -68.62563704377925, 1, 292, 'MIGRADO', '2023-12-27', '2026-03-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 114, '400050', 'Oruro', 'RED CUENCA POOPO (3)', 'EL CHORO', 'SAN PEDRO DE CHALLACOLLO', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SAN PEDRO DE CHALLACOLLO', 'AVENIDA SUCRE', -18.076800974183964, -67.2393912223798, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-06', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 115, '400051', 'Oruro', 'RED CUENCA POOPO (3)', 'EL CHORO', 'EL CHORO VIRGEN DE LAS NIEVES', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'EL CHORO', 'PLAZA SIMON BOLIVAR', -18.354780104433868, -67.11479212856923, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 116, '400052', 'Oruro', 'RED CUENCA POOPO (3)', 'EL CHORO', 'RANCHO GRANDE', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'RANCHO GRANDE', 'RANCHO GRANDE', -18.27967941494609, -67.12319235241608, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 117, '400178', 'Oruro', 'RED CUENCA POOPO (3)', 'EL CHORO', 'CRUCERO BELEN', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CRUCERO BELEN', 'S/N', -18.204423892676175, -67.16077550037173, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-06', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 118, '400185', 'Oruro', 'RED CUENCA POOPO (3)', 'EL CHORO', 'CHAITAVI', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SAN FELIPE DE CHAYTAVI', 'S/N', -18.2947052149499, -67.19703378349051, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-06', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 119, '400209', 'Oruro', 'RED CUENCA POOPO (3)', 'EL CHORO', 'SANTA MARIA', 'Público', 'MINISTERIO DE SALUD Y DEPORTES', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'SANTA MARIA', 'S/N', -18.402592869245538, -67.1980369678425, 0, 75, 'MIGRADO', '2023-12-27', '2026-03-04', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 120, '400063', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'SAN PEDRO DE HUAYLLOCO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SAN PEDRO DE HUAYLLOCO', 'S/N FRENTE AL COLEGIO HUAYLLOCO', -18.628164506895892, -67.60868301377585, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 121, '400064', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'C.S. CON INTERNACION SAN JUAN BAUTISTA CORQUE', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CORQUE', 'AV ORURO ESMERALDA PELAESY PACO KATARI', -18.352998069402542, -67.68155830263572, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 122, '400065', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'HUMAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUMA MARKA', 'AVENIDA FINAL ORURO SN', -18.26006242035567, -67.9314225471551, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 123, '400066', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'OPOQUERI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'OPOQUERI', 'AV. SAN ANTONIO', -18.537633559954752, -67.90208595836475, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-11', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 124, '400067', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'POMATA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'POMATA AITE', 'CALLE FRANZTAMAYO N° S/N ENTRE CALLE ¨H¨ COMUNIDAD POMATA', -18.343547884963485, -67.929099962672, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 125, '400068', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'SAN ANTONIO (ORU)', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SAN ANTONIO DE NOR KALA', 'avenida final oruro', -18.423175966446166, -67.96675184362795, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 126, '400069', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'SAN JOSE DE KALA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'SAN JOSE DE KALA', 'N/SAN JOSE DE KALA', -18.610345, -67.8683890001, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 127, '400070', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'TARUCACHI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILLA TURUCACHI', 'TARUCACHI', -18.172586787105782, -67.69596207314987, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 128, '400155', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'VILLA COPACABANA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILLA COPACABANA', 'S/C', -18.336072911825177, -67.58663597578436, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 129, '400177', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'CATAZA ANCARAVI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'ANCARAVI', 'N/ANCARAVI', -18.400485558698623, -67.75310490543299, 0, 0, 'MIGRADO', '2023-12-27', '2025-11-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 130, '400188', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'HUAYLLAPACHA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUAYLLAPACHA', 'ORURO', -18.2083450003, -67.785389, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-26', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 131, '400189', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'VILLA ESPERANZA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILLA ESPERNZA', 'S/N', -18.6945734281, -67.79711461, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 132, '400248', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'ANDAPATA LUPE', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ANDA PATA LUPE', 'N/10 DE JUNIO .', -18.5742517599202, -67.80091167626782, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 133, '400254', 'Oruro', 'RED CUENCA POOPO (3)', 'CORQUE', 'P.S. CONDORIRI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CONDORIRI', 'COMUNIDAD DE CONDORIRI C/MANUEL JOSE FLORES', -18.280621749146317, -67.87035988051848, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 134, '400071', 'Oruro', 'RED CUENCA POOPO (3)', 'CHOQUECOTA', 'CHOQUECOTA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'CHOQUECOTA', 'AV. DEL ESTUDIANTE', -18.098218147088105, -67.89667748748433, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-24', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 135, '400259', 'Oruro', 'RED CUENCA POOPO (3)', 'CHOQUECOTA', 'P.S. VIRGEN DEL ROSARIO DE ANDAPATA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ANDAPATA', 'COMUNIDAD DE ANDAPATA', -18.9777535, -67.8962029, 0, 0, 'REGISTRADO', '2025-06-06', '2025-06-06', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 136, '400075', 'Oruro', 'RED CUENCA POOPO (3)', 'TURCO', 'CHACHACOMANI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CHACHACOMANI', 'CALLE CAPURATA S/N ENTRE AVENIDA TOPATER Y CAMACHO', -18.3552152568, -68.9460482365, 1, 11, 'MIGRADO', '2023-12-27', '2026-03-13', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 137, '400076', 'Oruro', 'RED CUENCA POOPO (3)', 'TURCO', 'COSAPA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'COSAPA', 'AV. PANAMERICANA', -18.177760011419018, -68.71029322371822, 0, 38, 'MIGRADO', '2023-12-27', '2026-03-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 138, '400077', 'Oruro', 'RED CUENCA POOPO (3)', 'TURCO', 'LACA LACA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ASUNCION DE LACA LACA', 'CALLE LA PAZ', -18.01208485287698, -67.94190428884885, 0, 135, 'MIGRADO', '2023-12-27', '2026-03-05', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 139, '400078', 'Oruro', 'RED CUENCA POOPO (3)', 'TURCO', 'TITIRI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'LOC AMANZANADA TITIRI', 'CALLE LA PAZ ENTRE PUMIRI', -18.3880315371, -68.3330612612, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 140, '400079', 'Oruro', 'RED CUENCA POOPO (3)', 'TURCO', 'TURCO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'TURCO', 'SANTA BARBARA S/N ENTRE ORURO Y SAJAMA', -18.180389887344262, -68.19376386196804, 0, 0, 'MIGRADO', '2023-12-27', '2025-12-06', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 141, '400080', 'Oruro', 'RED CUENCA POOPO (3)', 'TURCO', 'TAMBO QUEMADO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'TAMBO QUEMADO', 'CALLE ARICA S/N ENTRE ORURO Y LA PAZ', -18.27433602853637, -69.00220862160816, 1, 7, 'MIGRADO', '2023-12-27', '2025-06-01', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 142, '400112', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'CHALLAVITO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CHALLAVITO', 'Calle C S/N entre calles 4 y5', -18.030332026772726, -67.59828687090325, 0, 0, 'MIGRADO', '2023-12-27', '2025-12-03', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 143, '400113', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'PUESTO DE SALUD CHUQUIÑA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILLA CHUQUIÑA', 'AV. VILLA CHUQUIÑA ENTRE AV. 19 DE MAYO', -17.802252510717096, -67.46886526238242, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 144, '400114', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'CULLURI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CULLURI', 'COMUNIDAD CULLURI', -18.265869108, -67.5421451052, 0, 0, 'MIGRADO', '2023-12-27', '2025-11-20', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 145, '400115', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'TOLEDO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'TOLEDO', 'SAN FRANCISCO/TUPIZA', -18.1800229302925, -67.40710972423088, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-14', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 146, '400116', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'UNTAVI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'UNTAVI', 'AV.HOSPITAL', -18.65565322482772, -67.35504304446616, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 147, '400164', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'CARI CARI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'KARI KARI', 'CARI CARI', -18.295245100812128, -67.28943011433576, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 148, '400165', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'CHALLA CRUZ', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CHALLA CRUZ', 'AV. SUCRE ENTRE CALLE "C"', -18.5034397861, -67.4051477069, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 149, '400201', 'Oruro', 'RED CUENCA POOPO (3)', 'TOLEDO', 'TOMA TOMA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'TOMA TOMA', 'LOCALIDAD TOMA TOMA', -17.935622089001583, -67.49931522993839, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 150, '400118', 'Oruro', 'RED CUENCA POOPO (3)', 'ANDAMARCA', 'SANTIAGO DE ANDAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'ANDAMARCA', 'CALLE BALDIVIESO ENTRE COLEGIO', -18.7783449997, -67.5083890001, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 151, '400119', 'Oruro', 'RED CUENCA POOPO (3)', 'ANDAMARCA', 'AVAROA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'EDUARDO AVAROA', 'CALLE LITORAL Y ARCE', -18.8733450001, -67.5013890001, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 152, '400120', 'Oruro', 'RED CUENCA POOPO (3)', 'ANDAMARCA', 'ORINOCA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'ORINOCA', 'FINAL ANTOFAGASTA N/SN', -18.967840062891575, -67.26169572068719, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 153, '400175', 'Oruro', 'RED CUENCA POOPO (3)', 'ANDAMARCA', 'ROSAPATA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ROSA PATA', 'COMUNIDAD ROSAPATA', -18.9019833216, -67.1297018362, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 154, '400186', 'Oruro', 'RED CUENCA POOPO (3)', 'ANDAMARCA', 'LLOCO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'LLOCO', 'COMUNIDAD DE LLOCO', -18.8933825706, -67.3079098255, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 155, '400187', 'Oruro', 'RED CUENCA POOPO (3)', 'ANDAMARCA', 'CALAVILLCA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CALAVILLCA', 'COMUNIDAD DE CALAVILLCA', -18.8987307246, -67.2711485485, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 156, '400200', 'Oruro', 'RED CUENCA POOPO (3)', 'ANDAMARCA', 'ROSARIO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'LUVISAYA', 'CALLE ROSARIO', -18.6661801908, -67.5492539969, 0, 0, 'MIGRADO', '2023-12-27', '2025-08-19', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 157, '400121', 'Oruro', 'RED CUENCA POOPO (3)', 'BELEN DE ANDAMARCA', 'BELEN DE ANDAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'BELEN DE ANDAMARCA', 'ORURO Y BERNAL', -18.81755696687523, -67.64136857001498, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 158, '400122', 'Oruro', 'RED CUENCA POOPO (3)', 'BELEN DE ANDAMARCA', 'CALAMA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CALAMA', 'ELIZARDO PEREZ Y ADAVIRI', -18.7586850104, -67.6764159228, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 159, '400176', 'Oruro', 'RED CUENCA POOPO (3)', 'BELEN DE ANDAMARCA', 'CRUZ DE HUAYLLAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CRUZ DE HUAYLLAMARCA', 'BOLIVAR Y COPACABANA', -18.7414033601, -67.7568369649, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 160, '400213', 'Oruro', 'RED CUENCA POOPO (3)', 'BELEN DE ANDAMARCA', 'REAL MACHACAMARCA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'REAL MACHACAMARCA', 'CALLE CONCEPCION', -18.751280036821527, -67.68949271423196, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 161, '400083', 'Oruro', 'RED MINERA (2)', 'POOPÓ', 'POOPO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. INTEGRAL', 'RURAL', 'POOPO', 'CALLE SUCRE ENTRE OBLITAS Y RODRIGUEZ', -18.3802736164, -66.9690314541, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-24', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 162, '400085', 'Oruro', 'RED MINERA (2)', 'POOPÓ', 'VENTA Y MEDIA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'VENTA Y MEDIA', 'CALLE SIN NOMBRE ENTRE PUENTE VENTA Y MEDIA', -18.29370183770062, -66.85943473662259, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 163, '400174', 'Oruro', 'RED MINERA (2)', 'POOPÓ', 'SAN JOSE TOLAPAMPA (ORU)', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'TOLAPAMPA', 'CARRETERA PANAMERICANA ORURO POTOSI', -18.2965051475, -67.0172655075, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 164, '400183', 'Oruro', 'RED MINERA (2)', 'POOPÓ', 'CALLIPAMPA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CALLIPAMPA', 'CARRETERA PANAMERICANA ORURO POTOSI', -18.44985296247111, -66.97192665390449, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 165, '400091', 'Oruro', 'RED MINERA (2)', 'ANTEQUERA', 'ANTEQUERA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'ANTEQUERA', 'CALLEJOS Nº3 ENTRE RIO ANTEQUERA', -18.47917150361618, -66.84060072352844, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-13', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 166, '400152', 'Oruro', 'RED MINERA (2)', 'ANTEQUERA', 'CHALLHUAMAYU', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'URBANO', 'CHALLGUAMAYO', 'CALLE SIN NOMBRE A LADO DE LA ESCUELA CHALLHUAMAYU', -18.608516091591984, -66.75702243263947, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 167, '400153', 'Oruro', 'RED MINERA (2)', 'ANTEQUERA', 'TUTUNI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'TUTUNI', 'CALLE SIN NOMBRE A LADO DE LA PLAZA CENTRAL TUTUNI', -18.577129842499712, -66.73834421473741, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-13', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 168, '400092', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'HOSP. SAN MARTIN DE PORRES HUANUNI', 'Público', 'G.A.M.', '2do NIVEL', 'HOSPITAL SEGUNDO NIVEL', 'RURAL', 'HUANUNI', 'Zona Sajsani , calle S/N', -18.27965394638314, -66.84915670852426, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 169, '400094', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'MOROCOCALA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'MOROCOCALA', 'CALLE S/N', -18.2854, -66.83103, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-13', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 170, '400095', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'TAYAQUIRA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'TAYAQUIRA', 'CALLE SIN NOMBRE, FRENTE A LA PLAZA CENTRAL DE TAYAQUIRA', -18.282761083459775, -66.68177624350793, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-17', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 171, '400156', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'HUALLATIRI', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'HUALLATIRI', 'S/N FRENTE A LA PRINCIPAL DE HUALLATIRI', -18.260357888808393, -66.57712163009464, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-10', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 172, '400160', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'CATARICAGUA', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'CATARICAHUA', 'SIN NOMBRE', -18.2743449997, -66.8153889996, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 173, '400161', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'BARTOLINA SISA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'HUANUNI', 'CALLE ABSALON ZABALA', -18.289922567694994, -66.84222583701508, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-11', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 174, '400162', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'HUAYRAPATA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'RURAL', 'HUANUNI', 'CAMPAMENTO HUAYRAPATA LADO CANCHA DE BASQUET', -18.284126168705527, -66.83827756243672, 0, 0, 'MIGRADO', '2023-12-27', '2026-06-09', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 175, '400163', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'JAPO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'JAPO', 'CALLE SIN NOMBRE', -18.071859355287618, -66.84800902833624, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-23', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 176, '400247', 'Oruro', 'RED MINERA (2)', 'HUANUNI', 'P.S. VILUYO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'VILUYO', 'CARRETERA ORURO HUANUNI', -18.241756585222017, -66.88573710340938, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-12', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 177, '400096', 'Oruro', 'RED MINERA (2)', 'MACHACAMARCA', 'MACHACAMARCA HNA. MONICA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. CON INTERNACION', 'RURAL', 'MACHACAMARCA', 'ZONA FERROVIARIA CALLE JOAQUIN FORTUN SUD ESTE', -18.17218413562885, -67.01600613372752, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-15', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 178, '400199', 'Oruro', 'RED MINERA (2)', 'MACHACAMARCA', 'ACO ACO', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'RURAL', 'ACO ACO', 'CARRETERA ORURO - HUANUNI', -18.1925543927, -66.9124390945, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-18', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 179, '400001', 'Oruro', 'RED URBANA (1)', 'ORURO', 'ALTO ORURO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'AVENIDA DE LAS AMERICAS ENTRE CALLE 20 A TRES CUADRA DE PARADA TRUFI 13 VERDE', -17.977172, -67.121943, 0, 0, 'REGISTRADO', '2024-04-20', '2024-12-16', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 180, '400007', 'Oruro', 'RED URBANA (1)', 'ORURO', 'ASISTENCIA PUBLICA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'ADOLFO MIER PETOT Y CAMACHO', -17.968721746671388, -67.11594907481681, 0, 0, 'REGISTRADO', '2024-04-17', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 181, '400008', 'Oruro', 'RED URBANA (1)', 'ORURO', 'CHIRIPUJIO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'Av. España entre Ecuador y Panamá', -17.977329908070892, -67.13629782199861, 0, 0, 'REGISTRADO', '2024-04-09', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 182, '400009', 'Oruro', 'RED URBANA (1)', 'ORURO', 'HOSP. WALTER KHON', 'Público', 'G.A.M.', '2do NIVEL', 'HOSPITAL SEGUNDO NIVEL', 'URBANO', 'ORURO', 'Calle Kenndy esquina catacora', -17.986850938747356, -67.113170158668, 0, 0, 'REGISTRADO', '2024-04-10', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 183, '400010', 'Oruro', 'RED URBANA (1)', 'ORURO', 'C.S. INTEGRAL RAFAEL PABON', 'Público', 'G.A.D.', '1er NIVEL', 'CENTRO SALUD', 'URBANO', 'ORURO', 'arica entre tomas frias y lizarraga', -17.981258804927414, -67.10501774419401, 0, 0, 'REGISTRADO', '2024-04-10', '2024-12-31', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 184, '400011', 'Oruro', 'RED URBANA (1)', 'ORURO', 'SANTA LUCIA (ORU)', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'TEJERINA ENTRE MONTESINOS Y HERRERA', -17.966619393370397, -67.10417555604971, 0, 0, 'REGISTRADO', '2024-04-23', '2026-02-24', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 185, '400012', 'Oruro', 'RED URBANA (1)', 'ORURO', 'NSTA.SRA. DE CANDELARIA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'Calle 1 Encinas Nieto entre calle B', -17.94816659822426, -67.10624636100661, 0, 0, 'REGISTRADO', '2024-04-10', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 186, '400013', 'Oruro', 'RED URBANA (1)', 'ORURO', 'YUGOESLAVO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'avenida tomas barron calle Mario Quiroga', -17.93400930483893, -67.11669098570403, 0, 0, 'REGISTRADO', '2024-04-10', '2025-06-11', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 187, '400014', 'Oruro', 'RED URBANA (1)', 'ORURO', 'HOSP. BARRIOS MINEROS', 'Público', 'G.A.M.', '2do NIVEL', 'HOSPITAL SEGUNDO NIVEL', 'URBANO', 'ORURO', 'Bloque central prolongación petot, juan lechin y calle D. Hospital cuenta con 3 bloques totales: bloque Nª1 calle: juan lechin teniete villa. bloque Nª2 calle juan lechin y 21 de diciembre.', -17.9537036596366, -67.1175491369302, 0, 0, 'REGISTRADO', '2024-04-05', '2025-01-02', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 188, '400015', 'Oruro', 'RED URBANA (1)', 'ORURO', 'CENTRO DE SALUD INTEGRAL VINTO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'VINTO PLAZA PRINCIPAL', -17.97833510169322, -67.0497534379864, 0, 0, 'REGISTRADO', '2024-04-15', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 189, '400021', 'Oruro', 'RED URBANA (1)', 'ORURO', 'CENTRO DE SALUD EPIDEMIOLOGICO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'ORURO', -17.978610288392026, -67.08241478641189, 0, 0, 'REGISTRADO', '2025-03-17', NULL, 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 190, '400035', 'Oruro', 'RED URBANA (1)', 'ORURO', 'HOSP. GENERAL S.J.D.D.', 'Público', 'G.A.D.', '3er NIVEL', 'HOSPITAL GENERAL', 'URBANO', 'ORURO', 'bloque central SAN FELIPE, 6 DE OCTUBRE Y TARIJA bloque oruro corea avenida antofagasta y c. san felipe', -17.9756971022, -67.1139750768, 0, 0, 'MIGRADO', '2023-12-27', '2025-05-08', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 191, '400168', 'Oruro', 'RED URBANA (1)', 'ORURO', 'AURORA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'URB. AURORA, AV. MARIO MERCADO DE VACA GUZMAN ENTRE TERESA DE CALCULTA S/N', -17.9125830003, -67.126176, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 192, '400173', 'Oruro', 'RED URBANA (1)', 'ORURO', 'MARIA AUXILIADORA (HUAJARA)', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'AVENIDA 3 Y 4', -17.942569, -67.0967449999, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-31', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 193, '400198', 'Oruro', 'RED URBANA (1)', 'ORURO', 'PLAN 500', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'AVENIDA TUPAC YUPANQUI Y 12 DE OCTUBRE', -17.97766157157377, -67.1426443751009, 0, 212, 'MIGRADO', '2023-12-27', '2025-08-14', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 194, '400224', 'Oruro', 'RED URBANA (1)', 'ORURO', 'RUMY CAMPANA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'AV. P. CARRASCO ENTRE ARGENTILLO Y J. PEÑARANDA S/N', -17.950588636, -67.1252075768, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 195, '400226', 'Oruro', 'RED URBANA (1)', 'ORURO', 'PUMAS ANDINOS', 'Público', 'G.A.M.', '1er NIVEL', 'PUESTO DE SALUD', 'URBANO', 'ORURO', 'CALLE JUAN MEZA S/N ENTRE CALENDULOS Y KIHUINOS', -17.9940148795, -67.067280062, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 196, '400227', 'Oruro', 'RED URBANA (1)', 'ORURO', 'VERDE UNO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'RENE RENJEL S/N, GABRILA MISTRAL Y MADRID', -17.990493, -67.132389, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 197, '400228', 'Oruro', 'RED URBANA (1)', 'ORURO', 'SANTA ROSA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'CELESTINO GUTIERREZ ENTRE MARTIN CARDENAS Y 31 DE OCTUBRE', -17.9709873615409, -67.0810176351755, 0, 0, 'MIGRADO', '2023-12-27', '2026-03-20', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 198, '400230', 'Oruro', 'RED URBANA (1)', 'ORURO', 'AMBULATORIO SOCAMANI', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'AV. EX. CARRETERA CALA CALA', -17.97111, -67.04907, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 199, '400232', 'Oruro', 'RED URBANA (1)', 'ORURO', 'CENTRO DE SALUD VICHULOMA', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'CARRETERA ORURO-POTOSI Y PLAZUELA VICHULOMA', -18.0142313, -67.0348905, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 200, '400233', 'Oruro', 'RED URBANA (1)', 'ORURO', 'CDVIR ORURO', 'Público', 'G.A.M.', '1er NIVEL', 'C. CARACTERISTICAS PART.', 'URBANO', 'ORURO', 'QUINTANA C SAN FELIPE CASI CIRCUNVALACION, LA PARTE OPERATIVA Y LABORATORIO Y OTROSSERVICIOS SE ENCUENTRA ACTUALMENTE TRABAJANDO EN URB.SANTIAGO', -17.939409011719576, -67.09839831391918, 0, 0, 'MIGRADO', '2023-12-27', '2025-06-06', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 201, '400238', 'Oruro', 'RED URBANA (1)', 'ORURO', 'BANCO DE SANGRE ORURO', 'Público', 'G.A.M.', 'Banco de Sangre', 'BANCO DE SANGRE', 'URBANO', 'ORURO', 'LEON S/N BRASIL Y TEJERINA', -17.96421, -67.10401, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-31', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 202, '400239', 'Oruro', 'RED URBANA (1)', 'ORURO', '7 DE MARZO', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'SAN ANTONIO, LIMA Y MADRID', -17.985942, -67.08476, 0, 271, 'MIGRADO', '2023-12-27', '2025-12-03', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 203, '400244', 'Oruro', 'RED URBANA (1)', 'ORURO', 'PAPA JUAN PABLO II', 'Público', 'G.A.M.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'CALLE VÍA LOCAL 03 S/N ENTRE VILLA LOCAL 05 Y VÍA LOCAL 06, VÍA LOCAL P 3, URBANIZACIÓN CIO 1', -17.952268, -67.067275, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-30', 'reporte_ubicacion (1).xlsx', 2026, 1),
  (UUID(), 204, '400253', 'Oruro', 'RED URBANA (1)', 'ORURO', 'CENTRO DE SALUD "LOS ANGELES"', 'Público', 'G.A.D.', '1er NIVEL', 'C.S. AMBULATORIO', 'URBANO', 'ORURO', 'CALLE 4 / CALLE G Y AB', -17.967711395537453, -67.06114777704143, 0, 0, 'MIGRADO', '2023-12-27', '2024-12-24', 'reporte_ubicacion (1).xlsx', 2026, 1)
ON DUPLICATE KEY UPDATE
  numero_reporte = VALUES(numero_reporte),
  departamento = VALUES(departamento),
  red_salud = VALUES(red_salud),
  municipio = VALUES(municipio),
  nombre = VALUES(nombre),
  subsector = VALUES(subsector),
  institucion = VALUES(institucion),
  nivel = VALUES(nivel),
  tipo = VALUES(tipo),
  ambito = VALUES(ambito),
  localidad = VALUES(localidad),
  direccion = VALUES(direccion),
  latitud = VALUES(latitud),
  longitud = VALUES(longitud),
  cerca_frontera = VALUES(cerca_frontera),
  distancia_frontera_km = VALUES(distancia_frontera_km),
  estado_fuente = VALUES(estado_fuente),
  fecha_registro_fuente = VALUES(fecha_registro_fuente),
  fecha_modificacion_fuente = VALUES(fecha_modificacion_fuente),
  fuente_archivo = VALUES(fuente_archivo),
  gestion_fuente = VALUES(gestion_fuente),
  activo = VALUES(activo),
  updated_at = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación esperada: 204 centros importados.
SELECT COUNT(*) AS centros_salud_importados FROM centros_salud;
