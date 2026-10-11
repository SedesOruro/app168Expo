-- ============================================================================
-- 168 Emergencias - Estructura de la base de datos (solo tablas, sin datos)
-- Uso: documentacion y creacion de una base vacia. Para dejar la base lista
-- para produccion usa reinicio-base-datos.sql.
-- Motor: MySQL 8.0+   Fuente: dump de central-db del 2026-10-11
--
-- Selecciona la base antes de ejecutar, por ejemplo:
--   mysql -h <host> -P <puerto> -u <usuario> -p central-db < <este-archivo>.sql
-- (en Workbench/DBeaver: marca central-db como esquema por defecto)
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '-04:00';

SET FOREIGN_KEY_CHECKS = 0;

-- Roles del personal administrativo (panel web).
CREATE TABLE `rol` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `permisos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulos` json DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rol_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personal administrativo: administradores y operadores.
CREATE TABLE `usuario` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullname` varchar(220) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `primer_apellido` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `segundo_apellido` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `ci` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `email` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(220) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `celular` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `genero` enum('MASCULINO','FEMENINO','NINGUNO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NINGUNO',
  `is_jefe` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `estado` enum('ACTIVO','INACTIVO','ELIMINADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
  `avatar` varchar(220) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'avatar_default.png',
  `fid_role` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `devices` json DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_username` (`username`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  KEY `idx_usuario_rol` (`fid_role`,`activo`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`fid_role`) REFERENCES `rol` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cuentas de la aplicacion movil.
CREATE TABLE `ciudadanos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(190) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CIUDADANO',
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `ultimo_acceso_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telefono` (`telefono`),
  KEY `idx_ciudadanos_estado` (`estado`,`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens JWT rotativos del ciudadano (solo el hash).
CREATE TABLE `sesiones_refresh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `jti` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dispositivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_origen` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expira_at` datetime NOT NULL,
  `revocado_at` datetime DEFAULT NULL,
  `reemplazado_por_jti` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sesiones_refresh_jti` (`jti`),
  UNIQUE KEY `uq_sesiones_refresh_hash` (`token_hash`),
  KEY `idx_sesiones_refresh_usuario` (`usuario_id`,`revocado_at`,`expira_at`),
  CONSTRAINT `fk_sesiones_refresh_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `ciudadanos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos personales, medicos y aceptacion de terminos del ciudadano.
CREATE TABLE `perfiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `nombres` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cedula_identidad` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `complemento_ci` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `sexo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_sangre` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `municipio` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alergias` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `enfermedades_cronicas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `medicamentos_actuales` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `condiciones_relevantes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `seguro_medico` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_seguro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `terminos_version` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `terminos_aceptados_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_perfiles_usuario` (`usuario_id`),
  UNIQUE KEY `uq_perfiles_ci` (`cedula_identidad`,`complemento_ci`),
  CONSTRAINT `fk_perfiles_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `ciudadanos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contactos a avisar durante una emergencia.
CREATE TABLE `contactos_emergencia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `nombre_completo` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentesco` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono_alternativo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contactos_usuario` (`usuario_id`,`activo`,`es_principal`),
  CONSTRAINT `fk_contactos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `ciudadanos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catalogo RUES de centros de salud.
CREATE TABLE `centros_salud` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_reporte` int unsigned DEFAULT NULL,
  `codigo_rues` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `red_salud` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `municipio` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subsector` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institucion` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nivel` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ambito` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `localidad` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitud` decimal(21,18) DEFAULT NULL,
  `longitud` decimal(21,18) DEFAULT NULL,
  `cerca_frontera` tinyint(1) NOT NULL DEFAULT '0',
  `distancia_frontera_km` decimal(10,2) DEFAULT NULL,
  `estado_fuente` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro_fuente` date DEFAULT NULL,
  `fecha_modificacion_fuente` date DEFAULT NULL,
  `fuente_archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gestion_fuente` smallint unsigned NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_centros_salud_uuid` (`uuid`),
  UNIQUE KEY `uq_centros_salud_codigo_rues` (`codigo_rues`),
  KEY `idx_centros_salud_ubicacion` (`departamento`,`municipio`,`localidad`),
  KEY `idx_centros_salud_red` (`red_salud`,`activo`),
  KEY `idx_centros_salud_coordenadas` (`latitud`,`longitud`),
  FULLTEXT KEY `ftx_centros_salud_busqueda` (`nombre`,`direccion`,`localidad`,`municipio`),
  CONSTRAINT `chk_centros_salud_distancia` CHECK (((`distancia_frontera_km` is null) or (`distancia_frontera_km` >= 0))),
  CONSTRAINT `chk_centros_salud_latitud` CHECK (((`latitud` is null) or (`latitud` between -(90) and 90))),
  CONSTRAINT `chk_centros_salud_longitud` CHECK (((`longitud` is null) or (`longitud` between -(180) and 180)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catalogo de tipos de emergencia.
CREATE TABLE `tipos_emergencia` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icono` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_hex` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` smallint unsigned NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tipos_emergencia_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catalogo de estados de una emergencia.
CREATE TABLE `estados_emergencia` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_final` tinyint(1) NOT NULL DEFAULT '0',
  `orden` smallint unsigned NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_estados_emergencia_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Solicitud principal de emergencia.
CREATE TABLE `emergencias` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_publico` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `idempotency_key` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `tipo_emergencia_id` smallint unsigned NOT NULL,
  `estado_id` smallint unsigned NOT NULL,
  `centro_salud_sugerido_id` bigint unsigned DEFAULT NULL,
  `operador_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `gravedad` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `puntaje_triage` int NOT NULL DEFAULT '0',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cantidad_afectados` smallint unsigned NOT NULL DEFAULT '1',
  `latitud` decimal(21,18) NOT NULL,
  `longitud` decimal(21,18) NOT NULL,
  `precision_metros` decimal(10,2) DEFAULT NULL,
  `direccion_referencia` varchar(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion_confirmada` tinyint(1) NOT NULL DEFAULT '0',
  `puede_hablar` tinyint(1) NOT NULL DEFAULT '1',
  `metadata` json DEFAULT NULL,
  `reportada_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finalizada_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_emergencias_uuid` (`uuid`),
  UNIQUE KEY `uq_emergencias_codigo_publico` (`codigo_publico`),
  UNIQUE KEY `uq_emergencias_idempotency` (`usuario_id`,`idempotency_key`),
  KEY `idx_emergencias_usuario` (`usuario_id`,`created_at`),
  KEY `idx_emergencias_estado` (`estado_id`,`gravedad`,`created_at`),
  KEY `idx_emergencias_coordenadas` (`latitud`,`longitud`),
  KEY `fk_emergencias_tipo` (`tipo_emergencia_id`),
  KEY `fk_emergencias_centro` (`centro_salud_sugerido_id`),
  KEY `fk_emergencias_operador` (`operador_id`),
  CONSTRAINT `fk_emergencias_centro` FOREIGN KEY (`centro_salud_sugerido_id`) REFERENCES `centros_salud` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emergencias_estado` FOREIGN KEY (`estado_id`) REFERENCES `estados_emergencia` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_emergencias_operador` FOREIGN KEY (`operador_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emergencias_tipo` FOREIGN KEY (`tipo_emergencia_id`) REFERENCES `tipos_emergencia` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_emergencias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `ciudadanos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_emergencias_afectados` CHECK ((`cantidad_afectados` > 0)),
  CONSTRAINT `chk_emergencias_latitud` CHECK ((`latitud` between -(90) and 90)),
  CONSTRAINT `chk_emergencias_longitud` CHECK ((`longitud` between -(180) and 180))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Respuestas del triage de cada emergencia.
CREATE TABLE `respuestas_triage` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `emergencia_id` bigint unsigned NOT NULL,
  `pregunta_codigo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pregunta_texto` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `opcion_codigo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `respuesta_texto` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `respuesta_numero` decimal(12,2) DEFAULT NULL,
  `respuesta_booleano` tinyint(1) DEFAULT NULL,
  `peso_aplicado` smallint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_respuestas_triage_pregunta` (`emergencia_id`,`pregunta_codigo`),
  CONSTRAINT `fk_respuestas_triage_emergencia` FOREIGN KEY (`emergencia_id`) REFERENCES `emergencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Linea de tiempo de estados de cada emergencia.
CREATE TABLE `historial_emergencia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `emergencia_id` bigint unsigned NOT NULL,
  `estado_anterior_id` smallint unsigned DEFAULT NULL,
  `estado_nuevo_id` smallint unsigned NOT NULL,
  `actor_usuario_id` bigint unsigned DEFAULT NULL,
  `actor_admin_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `observacion` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitud` decimal(21,18) DEFAULT NULL,
  `longitud` decimal(21,18) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_historial_emergencia` (`emergencia_id`,`created_at`),
  KEY `fk_historial_estado_anterior` (`estado_anterior_id`),
  KEY `fk_historial_estado_nuevo` (`estado_nuevo_id`),
  KEY `fk_historial_actor_admin` (`actor_admin_id`),
  KEY `fk_historial_actor` (`actor_usuario_id`),
  CONSTRAINT `fk_historial_actor` FOREIGN KEY (`actor_usuario_id`) REFERENCES `ciudadanos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_historial_actor_admin` FOREIGN KEY (`actor_admin_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_historial_emergencia` FOREIGN KEY (`emergencia_id`) REFERENCES `emergencias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_historial_estado_anterior` FOREIGN KEY (`estado_anterior_id`) REFERENCES `estados_emergencia` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_historial_estado_nuevo` FOREIGN KEY (`estado_nuevo_id`) REFERENCES `estados_emergencia` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evidencias: nota, foto o audio.
CREATE TABLE `evidencias_emergencia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `emergencia_id` bigint unsigned NOT NULL,
  `tipo` enum('NOTA','FOTO','AUDIO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `archivo_url` varchar(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion_segundos` smallint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_evidencias_uuid` (`uuid`),
  KEY `idx_evidencias_emergencia` (`emergencia_id`,`created_at`),
  CONSTRAINT `fk_evidencias_emergencia` FOREIGN KEY (`emergencia_id`) REFERENCES `emergencias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_evidencia_contenido` CHECK ((((`tipo` = _utf8mb4'NOTA') and (`contenido` is not null)) or ((`tipo` in (_utf8mb4'FOTO',_utf8mb4'AUDIO')) and (`archivo_url` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
