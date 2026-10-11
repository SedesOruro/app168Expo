import React, { ReactElement, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { useTheme } from 'styled-components/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../../../app/providers/AuthProvider';
import type { AuthStackParamList } from '../../../../app/navigation/types';
import { ApiError } from '../../../../shared/api/apiError';
import type { AppTheme } from '../../../../shared/theme';
import { SeccionAcordeon, type EstadoSeccion } from '../components/SeccionAcordeon';
import {
  useBorradorRegistro,
  type DatosRegistro,
} from '../hooks/useBorradorRegistro';

type ClaveSeccion = 'personales' | 'acceso' | 'contacto';
type RegisterNavigation = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

/** Formato que exige el backend en `birthDate`. */
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const esFechaValida = (valor: string): boolean => {
  if (!FORMATO_FECHA.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00`);
  return !Number.isNaN(fecha.getTime()) && fecha < new Date();
};

/** Fecha a AAAA-MM-DD, que es lo que espera el backend en `birthDate`. */
const aTextoISO = (fecha: Date): string =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
    fecha.getDate(),
  ).padStart(2, '0')}`;

/** Fecha que abre el selector cuando aun no hay ninguna elegida. */
const FECHA_POR_DEFECTO = new Date(1990, 0, 1);

export const RegisterScreen = (): ReactElement => {
  const { signUp, saltarRegistro } = useAuth();
  const navigation = useNavigation<RegisterNavigation>();
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const { datos, actualizar, limpiar } = useBorradorRegistro();
  const [terminos, setTerminos] = useState(false);
  const [abierta, setAbierta] = useState<ClaveSeccion | null>('personales');
  const [enviando, setEnviando] = useState(false);
  const [selectorFecha, setSelectorFecha] = useState(false);

  const completas = useMemo(
    () => ({
      personales: Boolean(
        datos.names &&
          datos.surnames &&
          datos.document &&
          esFechaValida(datos.birthDate) &&
          datos.address,
      ),
      acceso: Boolean(
        datos.phone && datos.email.includes('@') && datos.password.length >= 8,
      ),
      contacto: Boolean(datos.contactName && datos.contactPhone && terminos),
    }),
    [datos, terminos],
  );

  const tocadas = useMemo(
    () => ({
      personales: Boolean(
        datos.names || datos.surnames || datos.document || datos.birthDate || datos.address,
      ),
      acceso: Boolean(datos.phone || datos.email || datos.password),
      contacto: Boolean(datos.contactName || datos.contactPhone || terminos),
    }),
    [datos, terminos],
  );

  const estadoDe = (clave: ClaveSeccion): EstadoSeccion => {
    if (completas[clave]) return 'completo';
    return tocadas[clave] ? 'en_curso' : 'sin_empezar';
  };

  const totalCompletas = Object.values(completas).filter(Boolean).length;
  const listo = totalCompletas === 3;

  const alternar = (clave: ClaveSeccion): void => {
    setAbierta(actual => (actual === clave ? null : clave));
  };

  const campo = (
    etiqueta: string,
    clave: keyof DatosRegistro,
    extra?: Partial<React.ComponentProps<typeof TextInput>>,
  ): ReactElement => (
    <TextInput
      label={etiqueta}
      mode="outlined"
      value={datos[clave]}
      onChangeText={valor => actualizar(clave, valor)}
      style={estilos.campo}
      outlineColor={tema.colors.border}
      activeOutlineColor={tema.colors.primary}
      {...extra}
    />
  );

  const onRegistrarme = async (): Promise<void> => {
    if (!listo) return;

    setEnviando(true);
    try {
      await signUp({ ...datos, acceptedTerms: terminos });
      // La cuenta ya existe: el borrador deja de tener sentido y se descarta.
      await limpiar();
    } catch (error) {
      // El correo, telefono o cedula ya tienen cuenta: suele ser alguien que
      // cambio de celular. Se le lleva a ingresar en vez de dejarlo atascado.
      if (error instanceof ApiError && error.status === 409) {
        Alert.alert(
          'Ya tienes una cuenta',
          `${error.message}. Ingresa con tu correo y contrasena. Si no la recuerdas, pide a la Central 168 que la restablezca.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Iniciar sesion',
              onPress: () => navigation.navigate('Login', { email: datos.email.trim() }),
            },
          ],
        );
        return;
      }
      Alert.alert(
        'No se pudo completar el registro',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.pantalla}>
      <StatusBar
        barStyle={tema.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tema.colors.background}
      />
      <KeyboardAvoidingView
        style={estilos.pantalla}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={estilos.rotulo}>REGISTRO UNICO</Text>
          <Text style={estilos.titulo}>Vamos a conocerte</Text>
          <Text style={estilos.subtitulo}>
            Completa las secciones en el orden que prefieras — se guardan solas.
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Ya tengo cuenta, iniciar sesion"
            style={estilos.enlaceIngresar}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={estilos.textoEnlaceIngresar}>
              ¿Ya tienes cuenta? Inicia sesion
            </Text>
          </Pressable>

          <View style={estilos.barra}>
            <View
              style={[estilos.barraRelleno, { width: `${(totalCompletas / 3) * 100}%` }]}
            />
          </View>
          <Text style={estilos.progreso}>
            {totalCompletas} de 3 secciones completas
          </Text>

          <View style={estilos.secciones}>
            <SeccionAcordeon
              numero={1}
              titulo="Datos personales"
              estado={estadoDe('personales')}
              abierta={abierta === 'personales'}
              onAlternar={() => alternar('personales')}
            >
              {campo('Nombres*', 'names')}
              {campo('Apellidos*', 'surnames')}
              <View style={estilos.fila}>
                <View style={estilos.filaAncha}>
                  {campo('Cedula de identidad*', 'document', {
                    keyboardType: 'numeric',
                  })}
                </View>
                <View style={estilos.filaEstrecha}>
                  {campo('Complemento', 'complement')}
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  datos.birthDate
                    ? `Fecha de nacimiento, ${datos.birthDate}. Tocar para cambiarla`
                    : 'Elegir fecha de nacimiento'
                }
                onPress={() => setSelectorFecha(true)}
              >
                {/* El TextInput solo muestra; el valor lo fija el selector. */}
                <View pointerEvents="none">
                  <TextInput
                    label="Fecha de nacimiento*"
                    mode="outlined"
                    value={datos.birthDate}
                    placeholder="Elegir fecha"
                    editable={false}
                    style={estilos.campo}
                    outlineColor={tema.colors.border}
                    activeOutlineColor={tema.colors.primary}
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <MaterialCommunityIcons
                            name="calendar"
                            size={22}
                            color={tema.colors.textMuted}
                          />
                        )}
                      />
                    }
                  />
                </View>
              </Pressable>
              {campo('Direccion*', 'address')}
            </SeccionAcordeon>

            <SeccionAcordeon
              numero={2}
              titulo="Acceso y contacto"
              estado={estadoDe('acceso')}
              abierta={abierta === 'acceso'}
              onAlternar={() => alternar('acceso')}
            >
              {campo('Numero de celular*', 'phone', { keyboardType: 'phone-pad' })}
              {campo('Correo electronico*', 'email', {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              })}
              {campo('Contrasena (minimo 8 caracteres)*', 'password', {
                secureTextEntry: true,
                autoCapitalize: 'none',
              })}
              {datos.password && datos.password.length < 8 ? (
                <Text style={estilos.error}>La contrasena necesita 8 caracteres.</Text>
              ) : null}
            </SeccionAcordeon>

            <SeccionAcordeon
              numero={3}
              titulo="Contacto de emergencia"
              estado={estadoDe('contacto')}
              abierta={abierta === 'contacto'}
              onAlternar={() => alternar('contacto')}
            >
              {campo('Nombre del contacto*', 'contactName')}
              {campo('Telefono del contacto*', 'contactPhone', {
                keyboardType: 'phone-pad',
              })}
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: terminos }}
                onPress={() => setTerminos(actual => !actual)}
                style={estilos.terminos}
              >
                <View style={[estilos.casilla, terminos && estilos.casillaMarcada]} />
                <Text style={estilos.textoTerminos}>
                  Acepto los terminos y el tratamiento de mis datos para atender
                  emergencias.
                </Text>
              </Pressable>
            </SeccionAcordeon>
          </View>

          {selectorFecha ? (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={
                esFechaValida(datos.birthDate)
                  ? new Date(`${datos.birthDate}T00:00:00`)
                  : FECHA_POR_DEFECTO
              }
              maximumDate={new Date()}
              // onChange quedo deprecado en la v9: onValueChange solo dispara al
              // aceptar y onDismiss al cancelar, sin tener que mirar el tipo de evento.
              onValueChange={(_evento, fecha) => {
                setSelectorFecha(false);
                if (fecha) {
                  actualizar('birthDate', aTextoISO(fecha));
                }
              }}
              onDismiss={() => setSelectorFecha(false)}
            />
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !listo || enviando }}
            disabled={!listo || enviando}
            style={({ pressed }) => [
              estilos.boton,
              (!listo || enviando) && estilos.botonInactivo,
              pressed && estilos.presionado,
            ]}
            onPress={() => {
              onRegistrarme().catch(() => undefined);
            }}
          >
            <Text style={estilos.textoBoton}>
              {enviando ? 'Registrando...' : 'Registrarme'}
            </Text>
          </Pressable>

          {/*
            Saltar deja recorrer la aplicacion sin cuenta. El boton de emergencia
            sigue pidiendo el registro al pulsarlo.
          
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Explora la aplicacion sin cuenta. Para pedir ayuda tendras que registrarte."
            disabled={enviando}
            style={estilos.saltar}
            onPress={() => {
              saltarRegistro().catch(() => undefined);
            }}
          >
            <Text style={estilos.textoSaltar}>Saltar registro por ahora</Text>
          </Pressable>*/}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    enlaceIngresar: {
      minHeight: 44,
      alignSelf: 'flex-start',
      justifyContent: 'center',
    },
    textoEnlaceIngresar: {
      ...tema.estilosTexto.bodyStrong,
      color: tema.colors.accentText,
      textDecorationLine: 'underline',
    },
    pantalla: {
      flex: 1,
      backgroundColor: tema.colors.background,
    },
    contenido: {
      paddingHorizontal: tema.spacing.xl,
      paddingTop: tema.spacing.lg,
      paddingBottom: tema.spacing.xxl,
    },
    // primaryDark y no primary: el turquesa claro da 2.76 sobre el fondo y no
    // llega a AA como texto.
    rotulo: {
      ...tema.estilosTexto.caption,
      color: tema.colors.primaryDark,
      letterSpacing: 1.2,
    },
    titulo: {
      ...tema.estilosTexto.h1,
      marginTop: tema.spacing.xs,
      color: tema.colors.text,
    },
    subtitulo: {
      ...tema.estilosTexto.body,
      marginTop: tema.spacing.sm,
      color: tema.colors.textMuted,
    },
    barra: {
      height: 8,
      marginTop: tema.spacing.xl,
      borderRadius: tema.radius.pill,
      backgroundColor: tema.colors.surfaceMuted,
      overflow: 'hidden',
    },
    barraRelleno: {
      height: '100%',
      borderRadius: tema.radius.pill,
      backgroundColor: tema.colors.primaryDark,
    },
    progreso: {
      ...tema.estilosTexto.caption,
      marginTop: tema.spacing.sm,
      color: tema.colors.primaryDark,
    },
    secciones: {
      marginTop: tema.spacing.lg,
      gap: tema.spacing.md,
    },
    campo: {
      backgroundColor: tema.colors.surface,
    },
    fila: {
      flexDirection: 'row',
      gap: tema.spacing.sm,
    },
    filaAncha: {
      flex: 2,
    },
    filaEstrecha: {
      flex: 1,
    },
    error: {
      ...tema.estilosTexto.caption,
      color: tema.colors.danger,
    },
    terminos: {
      marginTop: tema.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tema.spacing.md,
    },
    casilla: {
      width: 24,
      height: 24,
      borderRadius: tema.radius.xs,
      borderWidth: 2,
      borderColor: tema.colors.border,
    },
    casillaMarcada: {
      borderColor: tema.colors.primaryDark,
      backgroundColor: tema.colors.primaryDark,
    },
    textoTerminos: {
      ...tema.estilosTexto.caption,
      flex: 1,
      color: tema.colors.textMuted,
    },
    boton: {
      marginTop: tema.spacing.xl,
      minHeight: 60,
      borderRadius: tema.radius.md,
      backgroundColor: tema.colors.primaryDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonInactivo: {
      opacity: 0.45,
    },
    presionado: {
      opacity: 0.86,
    },
    textoBoton: {
      ...tema.estilosTexto.h3,
      color: tema.colors.onFill,
    },
    saltar: {
      marginTop: tema.spacing.md,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textoSaltar: {
      ...tema.estilosTexto.bodyStrong,
      color: tema.colors.primaryDark,
      textDecorationLine: 'underline',
    },
  });
