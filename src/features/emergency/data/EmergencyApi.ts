import { env } from '../../../shared/config/env';
import { authenticatedClient, getValidAccessToken } from '../../../shared/api/authenticatedClient';

export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export type HealthCenter = {
  id: number;
  uuid: string;
  codigo_rues: string;
  nombre: string;
  municipio: string;
  localidad?: string | null;
  direccion?: string | null;
  nivel?: string | null;
  tipo?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  distanceKm?: number | null;
};

export type EmergencyStatus = {
  id: number;
  codigo: string;
  nombre: string;
  es_final: boolean;
  orden: number;
};

export type EmergencyRecord = {
  id: number;
  uuid: string;
  codigo_publico: string;
  gravedad?: string | null;
  descripcion?: string | null;
  latitud: number | string;
  longitud: number | string;
  puede_hablar: boolean;
  reportada_at: string;
  created_at: string;
  tipo: { id: number; codigo: string; nombre: string };
  estado: EmergencyStatus;
  historial?: {
    id: number;
    observacion?: string | null;
    created_at: string;
    estadoNuevo: EmergencyStatus;
  }[];
  evidencias?: {
    id: number;
    uuid: string;
    tipo: 'NOTA' | 'FOTO' | 'AUDIO';
    contenido?: string | null;
    archivo_url?: string | null;
  }[];
  operador?: { id: string; nombre: string; telefono?: string | null } | null;
};

export type EmergencyProfile = {
  id: string;
  email: string;
  phone: string;
  profile: {
    nombres: string;
    apellidos: string;
    cedula_identidad: string;
    complemento_ci?: string | null;
    fecha_nacimiento: string;
    tipo_sangre?: string | null;
    direccion?: string | null;
    alergias?: string | null;
    enfermedades_cronicas?: string | null;
    medicamentos_actuales?: string | null;
  };
  contacts: {
    id: number;
    nombre_completo: string;
    parentesco: string;
    telefono: string;
  }[];
};

export type CreateEmergencyPayload = Coordinates & {
  idempotencyKey?: string;
  typeCode: string;
  severity: string;
  canSpeak: boolean;
  locationConfirmed: boolean;
  address?: string;
  description?: string;
  flow: 'direct' | 'guided';
  triage: Record<string, string>;
};

export type CompleteTriagePayload = {
  typeCode: string;
  triage: Record<string, string>;
  affected: number;
  description?: string;
};

const getHealthCenters = (
  location?: Coordinates | null,
  search = '',
): Promise<HealthCenter[]> => {
  const params = new URLSearchParams({ limit: '30' });
  if (search) params.set('q', search);
  if (location) {
    params.set('lat', String(location.latitude));
    params.set('lng', String(location.longitude));
  }
  return authenticatedClient.get(`/mobile/health-centers?${params.toString()}`);
};

const uploadFile = async (
  uri: string,
  name: string,
  mimeType: string,
): Promise<{ file: string; name: string; mimeType: string }> => {
  const request = async (token: string): Promise<Response> => {
    const form = new FormData();
    form.append('file', { uri, name, type: mimeType } as unknown as Blob);
    return fetch(`${env.apiBaseUrl}/mobile/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  };
  let response = await request(await getValidAccessToken());
  if (response.status === 401) response = await request(await getValidAccessToken(true));
  const payload = (await response.json().catch(() => ({}))) as {
    file?: string;
    name?: string;
    mimeType?: string;
    error?: string;
  };
  if (!response.ok || !payload.file) {
    throw new Error(payload.error || 'No se pudo cargar el archivo');
  }
  return {
    file: payload.file,
    name: payload.name || name,
    mimeType: payload.mimeType || mimeType,
  };
};

export const emergencyApi = {
  getHealthCenters,
  getProfile: (): Promise<EmergencyProfile> =>
    authenticatedClient.get('/mobile/profile'),
  updateProfile: (payload: Record<string, unknown>): Promise<{ updated: boolean }> =>
    authenticatedClient.put('/mobile/profile', payload),
  createEmergency: (payload: CreateEmergencyPayload): Promise<EmergencyRecord> =>
    authenticatedClient.post('/mobile/emergencies', payload),
  completeTriage: (
    uuid: string,
    payload: CompleteTriagePayload,
  ): Promise<EmergencyRecord> =>
    authenticatedClient.patch(`/mobile/emergencies/${uuid}/triage`, payload),
  listEmergencies: (): Promise<EmergencyRecord[]> =>
    authenticatedClient.get('/mobile/emergencies'),
  getEmergency: (uuid: string): Promise<EmergencyRecord> =>
    authenticatedClient.get(`/mobile/emergencies/${uuid}`),
  addEvidence: (
    uuid: string,
    payload: {
      type: 'NOTA' | 'FOTO' | 'AUDIO';
      content?: string;
      fileUrl?: string;
      mimeType?: string;
      durationSeconds?: number;
    },
  ): Promise<unknown> =>
    authenticatedClient.post(`/mobile/emergencies/${uuid}/evidence`, payload),
  uploadFile,
};
