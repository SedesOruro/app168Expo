export type SessionPermissions = {
    read: boolean;
    create: boolean;
    edit: boolean;
    remove: boolean;
    send: boolean;
    download: boolean;
    approve: boolean;
};

export type UsuarioSesion = {
    permisos: SessionPermissions;
};

const defaultPermissions: SessionPermissions = {
    read: true,
    create: true,
    edit: true,
    remove: true,
    send: true,
    download: true,
    approve: true
};

export const useSession = (): UsuarioSesion => ({
    permisos: defaultPermissions
});
