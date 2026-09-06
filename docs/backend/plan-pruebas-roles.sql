-- ============================================================================
-- Plan de pruebas: redefinicion de roles, limpieza de datos y usuarios base
-- Entorno: DESARROLLO. No ejecutar en produccion.
-- Motor: MySQL 8.0+   Base: 168-db
--
-- Alcance acordado:
--   * Roles y usuarios a nivel de APLICACION (tablas `rol` y `usuario`),
--     no cuentas de conexion de MySQL.
--   * Se eliminan los datos transaccionales y se CONSERVAN los catalogos
--     (centros_salud, tipos_emergencia, estados_emergencia), porque sin ellos
--     el backend responde "Catalogos de emergencia no configurados" y la app
--     movil no puede registrar emergencias.
-- ============================================================================

USE `168-db`;

START TRANSACTION;

-- ----------------------------------------------------------------------------
-- 1. REDEFINICION DE ROLES
-- ----------------------------------------------------------------------------
-- Administrador: permisos totales. Incluye los modulos de seguridad
-- (usuarios y roles), que es el equivalente aplicativo a "administracion de
-- usuarios"; y `remove` habilitado, equivalente a las operaciones destructivas.
UPDATE `rol`
SET
  `nombre`   = 'Administrador',
  `permisos` = '{"read":true,"create":true,"edit":true,"remove":true,"send":true,"download":true,"approve":true}',
  `modulos`  = '[
    {"id":"emergencias","name":"emergencias","path":"/emergencias","title":"Emergencias"},
    {"id":"ciudadanos","name":"ciudadanos","path":"/ciudadanos","title":"Ciudadanos"},
    {"id":"centros-salud","name":"centros-salud","path":"/centros-salud","title":"Centros de salud"},
    {"id":"usuarios","name":"usuarios","path":"/usuarios","title":"Usuarios"},
    {"id":"roles","name":"roles","path":"/roles","title":"Roles"}
  ]',
  `fecha_eliminacion` = NULL
WHERE `tipo` = 'administrador';

-- Operador: lectura y escritura de datos (INSERT/UPDATE), SIN eliminacion.
-- `remove:false` es lo que apaga las acciones destructivas en el panel; el
-- backend ademas lo bloquea por middleware en las rutas de administracion.
UPDATE `rol`
SET
  `nombre`   = 'Operador',
  `permisos` = '{"read":true,"create":true,"edit":true,"remove":false,"send":true}',
  `modulos`  = '[
    {"id":"emergencias","name":"emergencias","path":"/emergencias","title":"Emergencias"},
    {"id":"ciudadanos","name":"ciudadanos","path":"/ciudadanos","title":"Ciudadanos"}
  ]',
  `fecha_eliminacion` = NULL
WHERE `tipo` = 'operador';

-- ----------------------------------------------------------------------------
-- 2. LIMPIEZA DE DATOS
-- ----------------------------------------------------------------------------
-- Se desactivan las restricciones para no depender del orden de borrado.
SET FOREIGN_KEY_CHECKS = 0;

-- Datos transaccionales de emergencias
DELETE FROM `evidencias_emergencia`;
DELETE FROM `historial_emergencia`;
DELETE FROM `respuestas_triage`;
DELETE FROM `emergencias`;

-- Cuentas de ciudadanos y sus datos asociados
DELETE FROM `sesiones_refresh`;
DELETE FROM `contactos_emergencia`;
DELETE FROM `perfiles`;
DELETE FROM `ciudadanos`;

-- Tabla legada, se vacia por completitud (ya estaba en cero)
DELETE FROM `usuarios`;

-- Personal administrativo: se limpia para dejar solo los dos usuarios de prueba
DELETE FROM `usuario`;

-- Se reinician los contadores para que los ids de prueba empiecen en 1
ALTER TABLE `evidencias_emergencia`  AUTO_INCREMENT = 1;
ALTER TABLE `historial_emergencia`   AUTO_INCREMENT = 1;
ALTER TABLE `respuestas_triage`      AUTO_INCREMENT = 1;
ALTER TABLE `emergencias`            AUTO_INCREMENT = 1;
ALTER TABLE `sesiones_refresh`       AUTO_INCREMENT = 1;
ALTER TABLE `contactos_emergencia`   AUTO_INCREMENT = 1;
ALTER TABLE `perfiles`               AUTO_INCREMENT = 1;
ALTER TABLE `ciudadanos`             AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- NOTA: se conservan deliberadamente
--   centros_salud       (204 registros del catalogo RUES)
--   tipos_emergencia    (5 registros)
--   estados_emergencia  (7 registros)

-- ----------------------------------------------------------------------------
-- 3. CREACION DE USUARIOS DE PRUEBA
-- ----------------------------------------------------------------------------
-- La contrasena `123456` se almacena como hash bcrypt (coste 10), que es lo
-- que compara el backend con bcrypt.compare. Nunca en texto plano.
-- El login del panel se hace por el campo `email`, por eso `email` y `username`
-- llevan el mismo valor: asi se ingresa literalmente `admin_test`.

INSERT INTO `usuario` (
  `id`, `username`, `password`, `fullname`, `nombre`, `primer_apellido`,
  `segundo_apellido`, `ci`, `email`, `direccion`, `celular`, `genero`,
  `is_jefe`, `activo`, `estado`, `avatar`, `fid_role`
) VALUES (
  UUID(),
  'admin_test',
  '$2b$10$qLPKLz0PHWcgWl7VLJHZn.xXj6dSwbkQ6inGgV9JKappYDtgV/xTq',
  'Administrador de Pruebas',
  'Administrador',
  'de',
  'Pruebas',
  '10000001',
  'admin_test',
  'Oficina central',
  '70000001',
  'NINGUNO',
  TRUE,
  TRUE,
  'ACTIVO',
  'avatar_default.png',
  (SELECT `id` FROM `rol` WHERE `tipo` = 'administrador' LIMIT 1)
);

INSERT INTO `usuario` (
  `id`, `username`, `password`, `fullname`, `nombre`, `primer_apellido`,
  `segundo_apellido`, `ci`, `email`, `direccion`, `celular`, `genero`,
  `is_jefe`, `activo`, `estado`, `avatar`, `fid_role`
) VALUES (
  UUID(),
  'operator_test',
  '$2b$10$qLPKLz0PHWcgWl7VLJHZn.xXj6dSwbkQ6inGgV9JKappYDtgV/xTq',
  'Operador de Pruebas',
  'Operador',
  'de',
  'Pruebas',
  '10000002',
  'operator_test',
  'Central 168',
  '70000002',
  'NINGUNO',
  FALSE,
  TRUE,
  'ACTIVO',
  'avatar_default.png',
  (SELECT `id` FROM `rol` WHERE `tipo` = 'operador' LIMIT 1)
);

COMMIT;

-- ----------------------------------------------------------------------------
-- VERIFICACION
-- ----------------------------------------------------------------------------
SELECT u.`username`, u.`fullname`, r.`tipo` AS rol, r.`permisos`, u.`activo`
FROM `usuario` u JOIN `rol` r ON r.`id` = u.`fid_role`
ORDER BY r.`tipo`;

SELECT 'centros_salud' AS catalogo, COUNT(*) AS filas FROM `centros_salud`
UNION ALL SELECT 'tipos_emergencia', COUNT(*) FROM `tipos_emergencia`
UNION ALL SELECT 'estados_emergencia', COUNT(*) FROM `estados_emergencia`
UNION ALL SELECT 'emergencias (vacia)', COUNT(*) FROM `emergencias`
UNION ALL SELECT 'ciudadanos (vacia)', COUNT(*) FROM `ciudadanos`;
