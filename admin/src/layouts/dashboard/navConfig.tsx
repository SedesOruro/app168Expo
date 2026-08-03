import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import EmergencyIcon from "@mui/icons-material/Emergency";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BadgeIcon from "@mui/icons-material/Badge";
import { ReactElement } from "react";

export type NavItem = {
  id: string;
  title: string;
  path: string;
  icon: ReactElement;
};

export const navConfig: NavItem[] = [
  { id: "dashboard", title: "Inicio", path: "/", icon: <DashboardIcon /> },
  { id: "emergencias", title: "Emergencias", path: "/emergencias", icon: <EmergencyIcon /> },
  { id: "ciudadanos", title: "Ciudadanos", path: "/ciudadanos", icon: <BadgeIcon /> },
  { id: "centros-salud", title: "Centros de salud", path: "/centros-salud", icon: <LocalHospitalIcon /> },
  { id: "usuarios", title: "Usuarios", path: "/usuarios", icon: <GroupsIcon /> },
  { id: "roles", title: "Roles", path: "/roles", icon: <SecurityIcon /> },
  { id: "perfil", title: "Perfil", path: "/perfil", icon: <PersonIcon /> }
];
