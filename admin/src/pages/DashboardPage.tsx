import EmergencyIcon from "@mui/icons-material/Emergency";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { Alert, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageContainer } from "../layouts/PageContainer";
import { DashboardStats, OperationsService } from "../services/operations/OperationsService";

const initialStats: DashboardStats = { emergencies: 0, active: 0, citizens: 0, centers: 0 };

export const DashboardPage = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    OperationsService.dashboard()
      .then((result) => {
        if (!result.success || !result.data) throw new Error(result.msg);
        setStats(result.data);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo cargar el tablero"))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Emergencias registradas", value: stats.emergencies, icon: <EmergencyIcon color="error" /> },
    { label: "Emergencias activas", value: stats.active, icon: <PendingActionsIcon color="warning" /> },
    { label: "Ciudadanos activos", value: stats.citizens, icon: <GroupsIcon color="primary" /> },
    { label: "Centros de salud", value: stats.centers, icon: <LocalHospitalIcon color="success" /> },
  ];

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Central de Emergencias 168</Typography>
          <Typography variant="body2" color="text.secondary">
            Bienvenido {session?.nombre || session?.username || "usuario"}. Este panel muestra datos operativos del backend.
          </Typography>
        </Paper>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? (
          <Stack sx={{ alignItems: "center", py: 6 }}><CircularProgress /></Stack>
        ) : (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
            {cards.map((card) => (
              <Paper key={card.label} variant="outlined" sx={{ p: 2.5, minWidth: 220, flex: 1 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  {card.icon}
                  <Stack>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>{card.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </PageContainer>
  );
};
