import RolService from "../core/system/autenticacion/rol";
import UsuarioService from "../core/system/autenticacion/usuario";
import { env } from "../config/env";

export const SECURITY_IDS = {
  adminRol: "00000000-0000-0000-0000-000000000002",
  operatorRol: "00000000-0000-0000-0000-000000000003",
  adminUsuario: "00000000-0000-0000-0000-000000000001",
};

export const ensureSecuritySeed = async (): Promise<void> => {
  if (!env.securitySeed.enabled) return;
  if (!env.securitySeed.email || !env.securitySeed.password) {
    throw new Error(
      "SECURITY_SEED_EMAIL y SECURITY_SEED_PASSWORD son requeridos cuando SECURITY_SEED_ENABLED=true",
    );
  }

  const operationalModules = [
    {
      id: "emergencias",
      name: "emergencias",
      path: "/emergencias",
      title: "Emergencias",
      icon: "emergencias",
      color: "primary",
    },
    {
      id: "ciudadanos",
      name: "ciudadanos",
      path: "/ciudadanos",
      title: "Ciudadanos",
      icon: "ciudadanos",
      color: "primary",
    },
    {
      id: "centros-salud",
      name: "centros-salud",
      path: "/centros-salud",
      title: "Centros de salud",
      icon: "centros-salud",
      color: "primary",
    },
  ];

  const adminRole = await RolService.getById(SECURITY_IDS.adminRol);
  if (adminRole.isFailure) {
    await RolService.create(
      {
        nombre: "Administrador",
        tipo: "administrador",
        permisos: JSON.stringify({
          read: true,
          create: true,
          edit: true,
          remove: true,
        }),
        modulos: [
          ...operationalModules,
          {
            id: "usuarios",
            name: "usuarios",
            path: "/usuarios",
            title: "Usuarios",
            icon: "usuarios",
            color: "primary",
          },
          {
            id: "roles",
            name: "roles",
            path: "/roles",
            title: "Roles",
            icon: "roles",
            color: "primary",
          },
        ],
      },
      SECURITY_IDS.adminRol,
    );
  }

  const operatorRole = await RolService.getById(SECURITY_IDS.operatorRol);
  if (operatorRole.isFailure) {
    await RolService.create(
      {
        nombre: "Operador 168",
        tipo: "operador",
        permisos: JSON.stringify({ read: true, edit: true, send: true }),
        modulos: [operationalModules[0], operationalModules[1]],
      },
      SECURITY_IDS.operatorRol,
    );
  }

  const usuarios = await UsuarioService.getAll();
  if (usuarios.isSuccess && usuarios.getValue().length > 0) return;

  await UsuarioService.creaUsuario(
    {
      email: env.securitySeed.email,
      password: env.securitySeed.password,
      nombre: env.securitySeed.firstName,
      primerApellido: env.securitySeed.firstLastName,
      segundoApellido: env.securitySeed.secondLastName,
      ci: "123456",
      direccion: "Local",
      celular: "12345678",
      genero: "MASCULINO",
      rolId: SECURITY_IDS.adminRol,
      avatar: "avatar_default.png",
    },
    SECURITY_IDS.adminUsuario,
  );
};
