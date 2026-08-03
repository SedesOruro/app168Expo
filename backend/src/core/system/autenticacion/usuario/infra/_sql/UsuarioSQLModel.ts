import bcrypt from "bcryptjs";
import { DeviceInfo } from "../../UsuarioEntity";

export type UsuarioSQLModelData = {
  username: string;
  password: string;
  fullname: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  ci: string;
  email: string;
  direccion: string;
  celular: string;
  genero: "MASCULINO" | "FEMENINO" | "NINGUNO";
  is_jefe?: boolean;
  activo: boolean;
  estado: "ACTIVO" | "INACTIVO" | "ELIMINADO";
  avatar?: string;
  fid_role: string;
  devices?: DeviceInfo[];
};

export class UsuarioSQLModel {
  static define(sequelize: any, Sequelize: any) {
    const MODEL = sequelize.define("usuario", {
      id: { type: Sequelize.UUID, primaryKey: true },
      username: { type: Sequelize.STRING(160), allowNull: false },
      password: { type: Sequelize.STRING(255), allowNull: false },
      fullname: { type: Sequelize.STRING(220), defaultValue: "" },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      primer_apellido: { type: Sequelize.STRING(120), defaultValue: "" },
      segundo_apellido: { type: Sequelize.STRING(120), defaultValue: "" },
      ci: { type: Sequelize.STRING(40), defaultValue: "" },
      email: { type: Sequelize.STRING(160), allowNull: false },
      direccion: { type: Sequelize.STRING(220), defaultValue: "" },
      celular: { type: Sequelize.STRING(40), defaultValue: "" },
      genero: {
        type: Sequelize.ENUM("MASCULINO", "FEMENINO", "NINGUNO"),
        defaultValue: "NINGUNO",
      },
      is_jefe: { type: Sequelize.BOOLEAN, defaultValue: false },
      activo: { type: Sequelize.BOOLEAN, defaultValue: true },
      estado: {
        type: Sequelize.ENUM("ACTIVO", "INACTIVO", "ELIMINADO"),
        defaultValue: "ACTIVO",
      },
      avatar: {
        type: Sequelize.STRING(220),
        defaultValue: "avatar_default.png",
      },
      fid_role: { type: Sequelize.UUID, allowNull: false },
      devices: { type: Sequelize.JSON, defaultValue: [] },
    });

    MODEL.associate = (models: any) => {
      MODEL.belongsTo(models.rol, {
        as: "rol",
        foreignKey: { name: "fid_role", targetKey: "id" },
        constraints: false,
      });
    };

    MODEL.beforeCreate(async (usuario: any) => {
      if (usuario.password)
        usuario.password = await bcrypt.hash(usuario.password, 10);
    });

    MODEL.beforeUpdate(async (usuario: any) => {
      if (usuario.changed("password"))
        usuario.password = await bcrypt.hash(usuario.password, 10);
    });

    return MODEL;
  }
}
