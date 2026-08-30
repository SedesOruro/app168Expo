# Graph Report - D:/PROYECTOS/app168Expo  (2026-08-29)

## Corpus Check
- 12 files · ~368,631 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2212 nodes · 3946 edges · 167 communities (126 shown, 41 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 180 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Autenticacion Movil Ciudadano
- Tema MUI Admin
- Campos FormDialog Admin
- Dependencias Backend
- Ubicacion y Pasos Emergencia
- Maquetas Dashboard y Mapa
- Showcase Tema y Botones
- Configuracion Base de Datos
- Rutas y Paginas Admin
- Tema Movil
- Maquetas Registro Ciudadano
- Repositorio Usuario Backend
- Tabla de Reportes Admin
- Modulo Rol Backend
- API Emergencia Movil
- Documentacion del Proyecto
- Dashboard y Menu Lateral
- Selector de Rango Fechas
- Migraciones Ciudadanos
- Paquetes Expo
- Editor y Config Admin
- Pantalla Dashboard Movil
- Controladores HTTP Backend
- Hoja de Filtros Movil
- Layout Dashboard Admin
- Tipos FormDialog Admin
- Showcase Layout y Tarjetas
- TSConfig Admin
- Dependencias Dev Backend
- Rutas y Middleware Backend
- Modulo Roles Admin
- Modulo Respuesta Triage
- JWT y Auth Ciudadano
- Entidad y Servicio Ciudadano
- Servicio HTTP Admin
- Capa Base Backend
- Entidad Centro de Salud
- Entidad Emergencia
- Tabla Datos y Roles
- Tipos DataTable Admin
- Entidad Estado Emergencia
- Tooling Pruebas Movil
- Navegacion y Login Movil
- Onboarding y Botones Movil
- Paginas Operaciones Admin
- Dialogos Confirmacion Admin
- Tipos ReportTable Admin
- Entidad Contacto Emergencia
- Entidad Evidencia Emergencia
- Entidad Historial Emergencia
- Repositorio Perfil Backend
- Modulo Sesion Refresh
- Modulo Tipo Emergencia
- Dependencias Admin
- Autenticacion Admin
- Repositorio Base SQL
- Repositorio Rol Backend
- Dependencias Dev Admin
- Campo Dropzone Admin
- Titulo de Pagina Admin
- Tabla Simple Admin
- Exportaciones Graphify
- Wiki y Clustering Graphify
- Especificacion Extraccion Graphify
- Seed de Operaciones
- Pantallas Flujo Emergencia
- Tarjetas y UI Movil
- Graphify Add y Watch
- Columna Activo Admin
- Esquema SQL 168-db
- Config TypeScript Movil
- Almacenamiento de Archivos
- TSConfig Backend
- Proveedores App y Socket
- Campo de Busqueda Movil
- Barra Herramientas Lista
- Filtros DataTable Admin
- Iconos de Aplicacion
- Aplicacion Express Backend
- Configuracion Expo app.json
- Assets Plantilla Sin Uso
- Busqueda de Datos Admin
- Arranque App Movil
- Scripts Movil
- Browserslist Admin
- Variantes FormDialog Admin
- Formato de Archivos Admin
- Metadatos Paquete Admin
- Cuerpo DataTable Admin
- Campo Grid Admin
- Icono Adaptativo Android
- Almacenamiento Local Backend
- Metadatos Paquete Movil
- Imagenes Hotel Plantilla
- Scripts Admin
- Navegacion por Secciones
- Ilustraciones Plantilla Movil
- Presupuesto de Tokens
- Lista de Datos Admin
- Campo de Texto Admin
- Lista de Modulos Admin
- Tipos SimpleTable Admin
- Item de Tabla Admin
- Insignia de Metrica Movil
- Modo Watch Graphify
- Boton de Archivo Admin
- Etiqueta Admin
- Barra de Desplazamiento Admin
- Hook de Sesion Admin
- Configuracion iOS
- Plugins Expo y MapLibre
- Seccion Lista Horizontal
- Tipos de Error Movil
- Formato ID y Expansion
- TypeScript Compartido
- Columna Ver Mas Admin
- Iconify Admin
- Paginacion Admin
- Tipo Result Movil
- Tipos React Compartidos
- Columna Progreso Admin
- Sin Resultados Admin
- Estilo Icono SVG Admin
- Notificaciones Admin
- Variables Entorno Vite
- Configuracion ESLint
- Boton Flotante Movil
- Paquete date-fns
- Paquete Emotion Styled
- Paquete Iconify React
- Paquete jwt-decode
- Paquete MUI Icons
- Paquete MUI Date Pickers
- Paquete Notistack
- Paquete Numeral
- Paquete React Admin
- Paquete React Dropzone
- Paquete React Router
- Paquete React Scrollbars
- Paquete Simplebar
- Paquete Simplebar React
- Paquete TSS React
- Constantes de Rutas Admin
- Tipos de Imagen Admin
- Paquete Expo Audio
- Paquete Expo Font
- Paquete Expo Status Bar
- Paquete Expo Vector Icons
- Paquete React Native
- Paquete Gesture Handler
- Paquete Navigation Native
- Paquete Native Stack
- Paquete Styled Components
- Paquete TanStack Query
- Rutas de Navegacion Movil

## God Nodes (most connected - your core abstractions)
1. `Result` - 120 edges
2. `BaseSQLRepository` - 37 edges
3. `BaseService` - 34 edges
4. `Entity` - 32 edges
5. `Database` - 26 edges
6. `useIsMounted()` - 25 edges
7. `IRepository` - 24 edges
8. `UsuarioEntity` - 19 edges
9. `compilerOptions` - 17 edges
10. `Graphify Pipeline` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Teal Flat In-App Icon Style` --conceptually_related_to--> `Blue Chevron Brand Language`  [AMBIGUOUS]
  src/shared/assets/icons/support_icon.png → assets/icon.png
- `Graphify Skill Directive` --conceptually_related_to--> `Project Knowledge Graph (graphify-out/)`  [INFERRED]
  .claude/CLAUDE.md → CLAUDE.md
- `Expo SDK 57 Versioned Docs Policy` --rationale_for--> `Citizen Mobile App (Expo SDK 57)`  [INFERRED]
  AGENTS.md → README.md
- `Emergency Call Center Contact Affordance` --conceptually_related_to--> `App Launcher Icon`  [INFERRED]
  src/shared/assets/icons/support_icon.png → assets/icon.png
- `Project Knowledge Graph (graphify-out/)` --references--> `168 Emergencias Integrated Solution`  [INFERRED]
  CLAUDE.md → README.md

## Import Cycles
- 5-file cycle: `admin/src/components/core/ReportSearch/ReportSearch.tsx -> admin/src/components/core/ReportTable/index.ts -> admin/src/components/core/ReportTable/ReportTable.tsx -> admin/src/components/core/ReportTable/ActionBar.tsx -> admin/src/components/core/ReportSearch/index.ts -> admin/src/components/core/ReportSearch/ReportSearch.tsx`
- 5-file cycle: `admin/src/components/core/FormDialog/FormDialog.tsx -> admin/src/components/core/FormDialog/fields/index.ts -> admin/src/components/core/FormDialog/fields/MyDropzone.tsx -> admin/src/components/core/_internal/fileFormat.ts -> admin/src/components/core/FormDialog/index.ts -> admin/src/components/core/FormDialog/FormDialog.tsx`
- 5-file cycle: `admin/src/components/core/FormDialog/FormDialogV2.tsx -> admin/src/components/core/FormDialog/fields/index.ts -> admin/src/components/core/FormDialog/fields/MyDropzone.tsx -> admin/src/components/core/_internal/fileFormat.ts -> admin/src/components/core/FormDialog/index.ts -> admin/src/components/core/FormDialog/FormDialogV2.tsx`
- 5-file cycle: `admin/src/components/core/DataSearch/DataSearch.tsx -> admin/src/components/core/DataTable/index.ts -> admin/src/components/core/DataTable/DataTable.tsx -> admin/src/components/core/DataTable/ActionBar.tsx -> admin/src/components/core/DataSearch/index.ts -> admin/src/components/core/DataSearch/DataSearch.tsx`
- 5-file cycle: `admin/src/components/core/DataSearch/DataSearch.tsx -> admin/src/components/core/DataTable/index.ts -> admin/src/components/core/DataTable/DataTableV2.tsx -> admin/src/components/core/DataTable/ActionBar.tsx -> admin/src/components/core/DataSearch/index.ts -> admin/src/components/core/DataSearch/DataSearch.tsx`

## Hyperedges (group relationships)
- **168 Emergencias Three-Component Architecture** — readme_mobile_app_expo, readme_backend_api, readme_admin_central_web, readme_database_168_db [EXTRACTED 1.00]
- **Graphify Codebase Navigation Toolchain** — claude_graphify_knowledge_graph, claude_graphify_query_first_rule, claude_graphify_wiki_index, claude_graphify_graph_report, claude_graphify_update_workflow [EXTRACTED 1.00]
- **End-to-End Emergency Alert Flow** — readme_alert_lifecycle_flow, readme_server_side_triage, readme_nearby_centers_lookup, readme_device_permissions_app_json, readme_admin_central_web [INFERRED 0.85]
- **Two-Track Extraction and Merge** — _claude_skills_graphify_skill_part_a_ast_extraction, _claude_skills_graphify_skill_part_b_semantic_extraction, _claude_skills_graphify_skill_part_c_merge, _claude_skills_graphify_references_extraction_spec_extraction_subagent_prompt [EXTRACTED 1.00]
- **Honest Audit Trail Contract** — _claude_skills_graphify_references_extraction_spec_confidence_taxonomy, _claude_skills_graphify_references_extraction_spec_confidence_score_rubric, _claude_skills_graphify_skill_honesty_rules, _claude_skills_graphify_skill_step_4_5_graph_health_check [INFERRED 0.85]
- **Query Answer Feedback Loop** — _claude_skills_graphify_references_query_constrained_query_expansion, _claude_skills_graphify_references_query_networkx_fallback_traversal, _claude_skills_graphify_references_query_save_result_feedback_loop, _claude_skills_graphify_references_query_work_memory_lessons, _claude_skills_graphify_references_update_incremental_update [EXTRACTED 1.00]
- **Android Adaptive Icon Layer Set** — assets_android_icon_background_adaptive_icon_background_layer, assets_android_icon_foreground_chevron_mark, assets_android_icon_monochrome_themed_icon_mark [INFERRED 0.95]
- **Unbranded Expo Template Asset Set** — assets_icon_app_launcher_icon, assets_splash_icon_splash_placeholder_graphic, assets_favicon_web_favicon_chevron, assets_android_icon_foreground_chevron_mark [INFERRED 0.85]
- **Hotel Booking Template Photo Set** — src_shared_assets_images_hotel_1_rooftop_pool_hotel_photo, src_shared_assets_images_hotel_2_waterfront_resort_photo, src_shared_assets_images_hotel_3_overwater_bungalow_photo [INFERRED 0.95]
- **Unused Starter Template Asset Group** — src_shared_assets_images_care_image_home_wellness_exercise_illustration, src_shared_assets_images_design_course_design_course_app_ui_mockup, src_shared_assets_images_design_user_image_default_user_avatar, src_shared_assets_images_hotel_1_rooftop_pool_hotel_photo, src_shared_assets_images_hotel_2_waterfront_resort_photo, src_shared_assets_images_hotel_3_overwater_bungalow_photo [INFERRED 0.85]
- **Flat Vector Support Illustration System** — src_shared_assets_images_feedbackimage_feedback_screen_illustration, src_shared_assets_images_helpimage_help_screen_illustration, src_shared_assets_images_helpimage_user_support_screen_flow [INFERRED 0.85]
- **Hotel Booking Starter-Template Residue (Unrelated To Emergency Domain)** — src_shared_assets_images_hotel_4_luxury_hotel_room_photo, src_shared_assets_images_hotel_5_beach_resort_photo, src_shared_assets_images_hotel_booking_hotel_booking_ui_mockup [INFERRED 0.85]
- **Flat Illustration Set For Onboarding Carousel Slides** — src_shared_assets_images_interface1_consultation_illustration, src_shared_assets_images_interface2_connected_worker_illustration, src_shared_assets_images_interface3_waiting_users_illustration, src_shared_assets_images_interface4_team_collaboration_illustration, src_shared_assets_images_introduction_animation_onboarding_carousel_reference [INFERRED 0.75]
- **Wellness Starter-Template Residue Asset Set** — src_shared_assets_images_introduction_image_meditation_onboarding_illustration, src_shared_assets_images_mood_dairy_image_mood_diary_template_art, src_shared_assets_images_relax_image_relaxation_template_art, src_shared_assets_images_welcome_welcome_screen_art [INFERRED 0.85]
- **User Identity and Collaboration Imagery** — src_shared_assets_images_inviteimage_invite_phone_call_illustration, src_shared_assets_images_profile_user_image_default_user_avatar_photo, src_shared_assets_images_webinterface_web_panel_teamwork_illustration [INFERRED 0.65]
- **Four-Tab Navigation Shell (Home / Map / Info / Profile)** — src_shared_assets_references_dashboard_floating_bottom_tab_bar, src_shared_assets_references_centro_de_salud_floating_bottom_tab_bar, src_shared_assets_references_informacion_floating_bottom_tab_bar, src_shared_assets_references_dashboard_dashboard_screen, src_shared_assets_references_centro_de_salud_health_centers_screen, src_shared_assets_references_informacion_information_screen [EXTRACTED 1.00]
- **Emergency Request Submission Flow (type + location consent + submit)** — src_shared_assets_references_dashboard_emergencias_card, src_shared_assets_references_emergencia_emergency_type_icon_grid, src_shared_assets_references_emergencia_precise_location_consent_toggle, src_shared_assets_references_emergencia_enviar_solicitud_button [INFERRED 0.85]
- **Triage Education Content Block (definitions + severity levels)** — src_shared_assets_references_informacion_triage_hospitalario_title_and_definition, src_shared_assets_references_informacion_urgencias_definition_card, src_shared_assets_references_informacion_emergencias_definition_card, src_shared_assets_references_informacion_triage_level_1_resucitacion_band, src_shared_assets_references_informacion_color_coded_triage_level_list [EXTRACTED 1.00]
- **Registro Unico Three-Step Citizen Registration Wizard** — src_shared_assets_references_paso_1_registro_registration_step_1_screen, src_shared_assets_references_paso_2_registro_registration_step_2_screen, src_shared_assets_references_paso_3_registro_registration_step_3_screen, src_shared_assets_references_paso_1_registro_three_step_progress_indicator, src_shared_assets_references_paso_3_registro_registrarse_button [EXTRACTED 1.00]
- **Citizen Identity Field Set Persisted To perfiles** — src_shared_assets_references_paso_1_registro_field_nombres, src_shared_assets_references_paso_1_registro_field_apellidos, src_shared_assets_references_paso_1_registro_field_cedula_de_identidad, src_shared_assets_references_paso_1_registro_field_complemento, src_shared_assets_references_paso_2_registro_field_fecha_de_nacimiento, src_shared_assets_references_paso_2_registro_field_direccion_de_su_domicilio, src_shared_assets_references_paso_1_registro_perfiles_table [INFERRED 0.85]
- **Profile Screen Reads Back Data Captured During Registration** — src_shared_assets_references_perfil_profile_screen, src_shared_assets_references_perfil_datos_personales_card, src_shared_assets_references_perfil_contacto_de_referencia_card, src_shared_assets_references_perfil_edit_fab, src_shared_assets_references_perfil_profile_edit_screen [INFERRED 0.85]

## Communities (167 total, 41 thin omitted)

### Community 0 - "Autenticacion Movil Ciudadano"
Cohesion: 0.06
Nodes (29): AuthContext, AuthContextValue, AuthProvider(), AuthProviderProps, authRepository, AuthStatus, tokenStorage, AuthApi (+21 more)

### Community 1 - "Tema MUI Admin"
Cohesion: 0.05
Nodes (43): @mui/material/styles, @mui/material/Typography, Palette, PaletteColor, PaletteOptions, Props, SimplePaletteColorOptions, Theme (+35 more)

### Community 2 - "Campos FormDialog Admin"
Cohesion: 0.07
Nodes (37): MyAutocomplete(), Props, MyCheckbox(), Props, MyCheckboxGroup(), Props, MyChipInput(), Props (+29 more)

### Community 3 - "Dependencias Backend"
Cohesion: 0.04
Nodes (44): dependencies, bcryptjs, compression, cors, dotenv, express, jsonwebtoken, mime-types (+36 more)

### Community 4 - "Ubicacion y Pasos Emergencia"
Cohesion: 0.09
Nodes (33): Stack, MainStackParamList, getCurrentCoordinates(), defaultSteps, EmergencyFlowSteps(), EmergencyFlowStepsProps, styles, useEmergencyFlow() (+25 more)

### Community 5 - "Maquetas Dashboard y Mapa"
Cohesion: 0.08
Nodes (39): Floating Bottom Tab Bar (Map tab active), Fullscreen Map View (OpenStreetMap), Red 'H' Health Center Marker Pins, HealthCenters Screen (Centros de salud), Map Zoom Controls (+/-), OpenStreetMap Contributors Attribution, Screen Title 'Centros de salud', Blue 'C' User Location Marker (+31 more)

### Community 6 - "Showcase Tema y Botones"
Cohesion: 0.07
Nodes (28): Body, H1, Section, Swatch, SwatchGrid, SwatchText, ThemeNavigation, TypeBlock (+20 more)

### Community 7 - "Configuracion Base de Datos"
Cohesion: 0.07
Nodes (13): CentroSaludSQLModel, CiudadanoSQLModel, ContactoEmergenciaSQLModel, EmergenciaSQLModel, EstadoEmergenciaSQLModel, EvidenciaEmergenciaSQLModel, HistorialEmergenciaSQLModel, PerfilSQLModel (+5 more)

### Community 8 - "Rutas y Paginas Admin"
Cohesion: 0.11
Nodes (19): DashboardPage, LoginPage, Page404, PerfilPage, ProtectedRoute(), RolesPage, SeguridadPage, UsuariosPage (+11 more)

### Community 9 - "Tema Movil"
Cohesion: 0.09
Nodes (24): AppThemeProvider(), AppThemeProviderProps, animations, AppAnimationTokens, AppColorTokens, darkColors, lightColors, AppTheme (+16 more)

### Community 10 - "Maquetas Registro Ciudadano"
Cohesion: 0.10
Nodes (34): Blue Gradient Background with White Card Registration Theme, Field: Apellidos* (required), Field: Cedula de identidad* (required), Field: Complemento (optional CI complement), Field: Nombres* (required), Government Logo Header Band (Gobierno Autonomo Departamental / SEDES), Outlined Input with Floating Label Design Pattern, Domain: perfiles Table (citizen profile record) (+26 more)

### Community 11 - "Repositorio Usuario Backend"
Cohesion: 0.12
Nodes (10): IUsuarioRepository, UsuarioRepositorySQL, UsuarioSQLModelData, construirNombre(), DeviceInfo, UsuarioEntity, UsuarioProps, UsuarioService (+2 more)

### Community 12 - "Tabla de Reportes Admin"
Cohesion: 0.10
Nodes (22): ActionSearchProps, ReportSearch(), useStyles, ActionBar(), formatDate(), parseDate(), useStyles, DataTableBody() (+14 more)

### Community 13 - "Modulo Rol Backend"
Cohesion: 0.09
Nodes (20): service, db, RolRepository, Permiso, service, db, UsuarioRepository, CreaUsuarioParams (+12 more)

### Community 14 - "API Emergencia Movil"
Cohesion: 0.10
Nodes (24): Coordinates, CreateEmergencyPayload, emergencyApi, EmergencyProfile, EmergencyStatus, HealthCenter, uploadFile(), centerCoordinates() (+16 more)

### Community 15 - "Documentacion del Proyecto"
Cohesion: 0.10
Nodes (28): Graphify Skill Directive, /graphify Trigger Command, #root Mount Node, Admin SPA HTML Shell, Admin Module Entry /src/index.tsx, Admin Theme Color #1976d2, Expo SDK 57 Versioned Docs Policy, AGENTS.md Include Directive (+20 more)

### Community 16 - "Dashboard y Menu Lateral"
Cohesion: 0.08
Nodes (24): DashboardFeature, dashboardFeatures, DashboardPattern, dashboardPatterns, AppImageKey, AppImages, Avatar, Container (+16 more)

### Community 17 - "Selector de Rango Fechas"
Cohesion: 0.12
Nodes (26): ComponentsShowcaseScreen(), ActionCell, Actions, Backdrop, DateRangePicker(), DateRangePickerProps, DayCell, DayText (+18 more)

### Community 18 - "Migraciones Ciudadanos"
Cohesion: 0.15
Nodes (17): routes, createApp(), env, errorHandler(), Column, columnasCiudadanoLegado, migrarCiudadanosLegado(), asegurarIndiceEstado() (+9 more)

### Community 19 - "Paquetes Expo"
Cohesion: 0.07
Nodes (27): expo, expo-image-picker, expo-location, expo-secure-store, expo-splash-screen, dependencies, expo, expo-image-picker (+19 more)

### Community 20 - "Editor y Config Admin"
Cohesion: 0.14
Nodes (16): Props, getHeaders(), removeFile(), sendError(), sendSuccess(), uploadFile(), API_URL, EDITOR_API_KEY (+8 more)

### Community 21 - "Pantalla Dashboard Movil"
Cohesion: 0.10
Nodes (20): RootNavigator(), useAuth(), SocketContext, SocketContextValue, SocketProvider(), SocketProviderProps, initialData, RegisterScreen() (+12 more)

### Community 22 - "Controladores HTTP Backend"
Cohesion: 0.11
Nodes (5): BaseHttpController, routeParam(), RolViewController, view, UsuarioViewController

### Community 23 - "Hoja de Filtros Movil"
Cohesion: 0.10
Nodes (22): filterSections, Row, Section, SectionTitle, ShowcaseNavigation, ActionCell, Actions, Backdrop (+14 more)

### Community 24 - "Layout Dashboard Admin"
Cohesion: 0.14
Nodes (17): DashboardLayout, ModuloRoute(), ArrowStyle, MenuPopover(), MenuPopoverProps, useModulosPermitidos(), AccountPopover(), DashboardLayout() (+9 more)

### Community 25 - "Tipos FormDialog Admin"
Cohesion: 0.08
Nodes (23): FileItem, FormControl, FormDialogProps, FormDialogPropsV2, FormDialogPropsV3, FormDialogPropsV4, FormDialogRefProps, FormDialogRefPropsV2 (+15 more)

### Community 26 - "Showcase Layout y Tarjetas"
Cohesion: 0.10
Nodes (19): MainDrawerParamList, Body, LayoutNavigation, Section, Title, BaseCard(), BaseCardProps, Card (+11 more)

### Community 27 - "TSConfig Admin"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+14 more)

### Community 28 - "Dependencias Dev Backend"
Cohesion: 0.09
Nodes (23): devDependencies, cross-env, oxlint, prettier, tsc-watch, @types/compression, @types/cors, @types/express (+15 more)

### Community 29 - "Rutas y Middleware Backend"
Cohesion: 0.16
Nodes (15): checkIfAdmin(), checkIfAuthenticated(), checkIfOperationalStaff(), checkIfSuperAdmin(), getAuthToken(), hydrateJwtUser(), storageRoutes, upload (+7 more)

### Community 30 - "Modulo Roles Admin"
Cohesion: 0.13
Nodes (12): formatModulos(), initialParams, parsePermisos(), RolesModulo(), RolesModuloServicio, RolFormularioModelo, RolTablaModelo, emptyForm (+4 more)

### Community 31 - "Modulo Respuesta Triage"
Cohesion: 0.18
Nodes (7): Entity, RespuestaTriageRepository, IRespuestaTriageRepository, RespuestaTriageRepositorySQL, RespuestaTriageEntity, RespuestaTriageProps, RespuestaTriageService

### Community 32 - "JWT y Auth Ciudadano"
Cohesion: 0.16
Nodes (13): Database, bearerToken(), checkIfCiudadanoAuthenticated(), Express, Request, signToken(), UsuarioAutenticado, verifyToken() (+5 more)

### Community 33 - "Entidad y Servicio Ciudadano"
Cohesion: 0.18
Nodes (7): CiudadanoEntity, CiudadanoProps, CiudadanoService, ICiudadanoRepository, CiudadanoRepository, CiudadanoRepositorySQL, CiudadanoSQLModelData

### Community 34 - "Servicio HTTP Admin"
Cohesion: 0.16
Nodes (18): buildQueryFilters(), buildQueryParamsText(), findAll(), getHeaders(), removeFile(), request(), sendError(), sendSuccess() (+10 more)

### Community 35 - "Capa Base Backend"
Cohesion: 0.15
Nodes (4): BaseService, IRepository, Result, RolService

### Community 36 - "Entidad Centro de Salud"
Cohesion: 0.20
Nodes (7): CentroSaludEntity, CentroSaludProps, CentroSaludService, ICentroSaludRepository, CentroSaludRepository, CentroSaludRepositorySQL, CentroSaludSQLModelData

### Community 37 - "Entidad Emergencia"
Cohesion: 0.20
Nodes (7): EmergenciaEntity, EmergenciaProps, EmergenciaService, IEmergenciaRepository, EmergenciaRepository, EmergenciaRepositorySQL, EmergenciaSQLModelData

### Community 38 - "Tabla Datos y Roles"
Cohesion: 0.14
Nodes (10): DataTable, RolOpcion, emptyForm, Props, UsuarioFormularioDialog(), initialParams, UsuarioFormModel, UsuariosModuloServicio (+2 more)

### Community 39 - "Tipos DataTable Admin"
Cohesion: 0.10
Nodes (19): ActionBarProps, DataListProps, DataListToolbarProps, DataTableBodyProps, DataTableBodyProps2, DataTableHeaderProps, DataTableHeaderProps2, DataTableProps (+11 more)

### Community 40 - "Entidad Estado Emergencia"
Cohesion: 0.23
Nodes (6): EstadoEmergenciaEntity, EstadoEmergenciaProps, EstadoEmergenciaService, IEstadoEmergenciaRepository, EstadoEmergenciaRepository, EstadoEmergenciaRepositorySQL

### Community 41 - "Tooling Pruebas Movil"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-expo, jest, jest-expo, devDependencies, eslint, eslint-config-expo, jest (+11 more)

### Community 42 - "Navegacion y Login Movil"
Cohesion: 0.16
Nodes (12): AuthNavigator(), Stack, linking, MainNavigator(), AuthStackParamList, RootStackParamList, Form, LinkButton (+4 more)

### Community 43 - "Onboarding y Botones Movil"
Cohesion: 0.12
Nodes (16): ButtonContainer, ButtonText, PrimaryButton(), PrimaryButtonProps, PrimaryButtonVariant, Container, EmptyState(), EmptyStateProps (+8 more)

### Community 44 - "Paginas Operaciones Admin"
Cohesion: 0.16
Nodes (11): CentrosSaludPage, CiudadanosPage, EmergenciasPage, emptyForm, OperatorOption, StatusOption, CitizenRow, EmergencyRow (+3 more)

### Community 45 - "Dialogos Confirmacion Admin"
Cohesion: 0.21
Nodes (11): ConfirmDialog(), Props, ConfirmInputDialog(), Props, ActionColumn(), Props, DataTableComponent(), FormDialogV4 (+3 more)

### Community 46 - "Tipos ReportTable Admin"
Cohesion: 0.11
Nodes (17): ActionBarProps, DataListProps, DataTableBodyProps, DataTableHeaderProps, DataTableProps, ExcelCell, FilterOption, HeaderFilter (+9 more)

### Community 47 - "Entidad Contacto Emergencia"
Cohesion: 0.24
Nodes (6): ContactoEmergenciaEntity, ContactoEmergenciaProps, ContactoEmergenciaService, IContactoEmergenciaRepository, ContactoEmergenciaRepository, ContactoEmergenciaRepositorySQL

### Community 48 - "Entidad Evidencia Emergencia"
Cohesion: 0.24
Nodes (6): EvidenciaEmergenciaEntity, EvidenciaEmergenciaProps, EvidenciaEmergenciaService, IEvidenciaEmergenciaRepository, EvidenciaEmergenciaRepository, EvidenciaEmergenciaRepositorySQL

### Community 49 - "Entidad Historial Emergencia"
Cohesion: 0.24
Nodes (6): HistorialEmergenciaEntity, HistorialEmergenciaProps, HistorialEmergenciaService, IHistorialEmergenciaRepository, HistorialEmergenciaRepository, HistorialEmergenciaRepositorySQL

### Community 50 - "Repositorio Perfil Backend"
Cohesion: 0.24
Nodes (6): PerfilRepository, IPerfilRepository, PerfilRepositorySQL, PerfilEntity, PerfilProps, PerfilService

### Community 51 - "Modulo Sesion Refresh"
Cohesion: 0.24
Nodes (6): SesionRefreshRepository, ISesionRefreshRepository, SesionRefreshRepositorySQL, SesionRefreshEntity, SesionRefreshProps, SesionRefreshService

### Community 52 - "Modulo Tipo Emergencia"
Cohesion: 0.24
Nodes (6): TipoEmergenciaRepository, ITipoEmergenciaRepository, TipoEmergenciaRepositorySQL, TipoEmergenciaEntity, TipoEmergenciaProps, TipoEmergenciaService

### Community 53 - "Dependencias Admin"
Cohesion: 0.12
Nodes (17): dependencies, clsx, @emotion/react, formik, @mui/material, react-dom, @tinymce/tinymce-react, use-debounce (+9 more)

### Community 54 - "Autenticacion Admin"
Cohesion: 0.22
Nodes (14): App(), AuthContext, AuthContextValue, AuthProvider(), MODULOS_LIBRES, doSignIn(), doSignOut(), getSessionInfoFromLocalStorage() (+6 more)

### Community 55 - "Repositorio Base SQL"
Cohesion: 0.21
Nodes (3): FindAndCount, PaginationQuery, BaseSQLRepository

### Community 56 - "Repositorio Rol Backend"
Cohesion: 0.23
Nodes (6): IRolRepository, RolRepositorySQL, RolSQLModelData, Modulo, RolEntity, RolProps

### Community 57 - "Dependencias Dev Admin"
Cohesion: 0.12
Nodes (16): devDependencies, jsdom, @types/node, @types/numeral, @types/react-dom, vite, @vitejs/plugin-react, vitest (+8 more)

### Community 58 - "Campo Dropzone Admin"
Cohesion: 0.17
Nodes (14): DEFAULT_ACCEPTED_FILES, DropzoneFileObject, MyDropzone, MyDropzoneComponent(), ProgressState, Props, buildFileItemFromFileName(), DocumentoAdjuntoItem (+6 more)

### Community 59 - "Titulo de Pagina Admin"
Cohesion: 0.21
Nodes (11): ConfigMenu, ConfigMenuItem, Props, PageTitleComponent(), Props, useStyles, HtmlTooltip, ModuleInfo (+3 more)

### Community 60 - "Tabla Simple Admin"
Cohesion: 0.18
Nodes (11): ActionColumn(), Props, useStyles, DataList(), useStyles, DEFAULT_COLUMN_ALIGN, DEFAULT_COLUMN_MAX_WIDTH, DEFAULT_COLUMN_MIN_WIDTH (+3 more)

### Community 61 - "Exportaciones Graphify"
Cohesion: 0.20
Nodes (15): FalkorDB Export, GraphML Export, MCP Graph Server, Neo4j Export, SVG Export, Cross-Repo Graph Merge, Monorepo Subfolder Extraction, GitHub Repo Clone (+7 more)

### Community 62 - "Wiki y Clustering Graphify"
Cohesion: 0.18
Nodes (15): Wiki Export, Node ID Format, source_file Verbatim Rule, build_merge Replace on Re-extract, cluster-only Reclustering, prune_sources Deletion Pruning, Community Detection, Graspologic ANSI Scrolling Issue (+7 more)

### Community 63 - "Especificacion Extraccion Graphify"
Cohesion: 0.20
Nodes (15): Calls Edge Direction Rule, Confidence Score Rubric, EXTRACTED INFERRED AMBIGUOUS Taxonomy, Deep Mode Extraction, Extraction JSON Schema, Extraction Subagent Prompt, Hyperedges, Semantic Similarity Edges (+7 more)

### Community 64 - "Seed de Operaciones"
Cohesion: 0.17
Nodes (14): asegurarCiudadanos(), asegurarEmergencias(), asegurarPersonal(), ciudadanos, CiudadanoSemilla, ejecutarSeedOperaciones(), emergencias, EmergenciaSemilla (+6 more)

### Community 65 - "Pantallas Flujo Emergencia"
Cohesion: 0.15
Nodes (12): BottomTabBar(), BottomTabBarProps, MaterialCommunityIconName, styles, TabKey, tabs, HistoryNavigation, HistoryScreen() (+4 more)

### Community 66 - "Tarjetas y UI Movil"
Cohesion: 0.14
Nodes (13): Container, Content, FeatureCard(), FeatureCardProps, Image, Meta, Row, Subtitle (+5 more)

### Community 67 - "Graphify Add y Watch"
Cohesion: 0.18
Nodes (14): graphify add URL Ingest, Supported URL Types, Image Vision Extraction Rules, graphify explain Node Explanation, graphify path Shortest Path, save-result Feedback Loop, Whisper Domain Hint Prompt, Whisper Transcription (+6 more)

### Community 68 - "Columna Activo Admin"
Cohesion: 0.21
Nodes (7): ActiveColumn(), Props, ChangeStateColumn(), Props, Props, StatusColumn(), DataTableV2

### Community 69 - "Esquema SQL 168-db"
Cohesion: 0.31
Nodes (13): centros_salud, ciudadanos, contactos_emergencia, emergencias, estados_emergencia, evidencias_emergencia, historial_emergencia, perfiles (+5 more)

### Community 70 - "Config TypeScript Movil"
Cohesion: 0.14
Nodes (13): App.tsx, expo/tsconfig.base, index.ts, jest, src/**/*.tsx, compilerOptions, noImplicitAny, noUncheckedIndexedAccess (+5 more)

### Community 71 - "Almacenamiento de Archivos"
Cohesion: 0.17
Nodes (5): StorageProvider, ciudadanoRoutes, db(), detalleEmergencia(), upload

### Community 72 - "TSConfig Backend"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, outDir, resolveJsonModule, rootDir, skipLibCheck (+4 more)

### Community 73 - "Proveedores App y Socket"
Cohesion: 0.18
Nodes (10): AppProviders(), AppProvidersProps, QueryProvider(), QueryProviderProps, EmergencyRecord, EmergencyDraft, EmergencyFlowContext, EmergencyFlowContextValue (+2 more)

### Community 74 - "Campo de Busqueda Movil"
Cohesion: 0.17
Nodes (11): Container, Input, SearchField(), SearchFieldProps, ActionButton, Container, CountBadge, CountText (+3 more)

### Community 75 - "Barra Herramientas Lista"
Cohesion: 0.20
Nodes (9): DataListToolbar(), RootStyle, DataTableBody2(), DataTableHeader2(), DEFAULT_COLUMN_ALIGN, DEFAULT_COLUMN_MAX_WIDTH, DEFAULT_COLUMN_MIN_WIDTH, DEFAULT_COLUMN_WIDTH (+1 more)

### Community 76 - "Filtros DataTable Admin"
Cohesion: 0.21
Nodes (8): DataTableFilters, DataTableFiltersHandle, DateFilter(), Props, Props, SelectFilter(), Props, TextFilter()

### Community 77 - "Iconos de Aplicacion"
Cohesion: 0.24
Nodes (12): Android Adaptive Icon Background Layer, Icon Construction Guide Grid, Android Adaptive Icon Foreground Chevron Mark, Android Monochrome Themed Icon Mark, Web Favicon Chevron, App Launcher Icon, Blue Chevron Brand Language, Expo Default Branding Placeholder (+4 more)

### Community 78 - "Aplicacion Express Backend"
Cohesion: 0.24
Nodes (5): BadRequest, Forbidden, HttpError, NotFound, Unauthorized

### Community 79 - "Configuracion Expo app.json"
Cohesion: 0.18
Nodes (10): expo, icon, name, orientation, scheme, slug, userInterfaceStyle, version (+2 more)

### Community 80 - "Assets Plantilla Sin Uso"
Cohesion: 0.29
Nodes (11): Home Wellness Exercise Illustration, Starter Template Asset Residue, Design Course App UI Mockup, Default User Avatar, Feedback Screen Illustration, Help Screen Illustration, User Support Screen Flow, Hotel Booking Listing Imagery (+3 more)

### Community 81 - "Busqueda de Datos Admin"
Cohesion: 0.31
Nodes (6): ActionSearchProps, DataSearch(), SearchStyle, Iconify(), IconRoot, Props

### Community 82 - "Arranque App Movil"
Cohesion: 0.31
Nodes (4): App(), initApp(), logger, LogLevel

### Community 83 - "Scripts Movil"
Cohesion: 0.20
Nodes (10): scripts, android, doctor, ios, lint, start, test, test:ci (+2 more)

### Community 84 - "Browserslist Admin"
Cohesion: 0.22
Nodes (9): browserslist, development, production, >0.2%, last 1 chrome version, last 1 firefox version, last 1 safari version, not dead (+1 more)

### Community 85 - "Variantes FormDialog Admin"
Cohesion: 0.36
Nodes (6): FormDialog(), FormDialogV2, FormDialogV3, FormDialogV3Component(), useStyles, useNotify()

### Community 86 - "Formato de Archivos Admin"
Cohesion: 0.31
Nodes (6): buildFileItemFromFileName(), DocumentoAdjuntoItem, getAdjuntoDisplayName(), getAdjuntoFileName(), normalizeAdjuntosToFileItems(), parseAdjuntos()

### Community 87 - "Metadatos Paquete Admin"
Cohesion: 0.25
Nodes (7): engines, node, homepage, name, private, type, version

### Community 88 - "Cuerpo DataTable Admin"
Cohesion: 0.54
Nodes (5): MemoizedRow, DEFAULT_COLUMN_ALIGN, DEFAULT_COLUMN_MAX_WIDTH, DEFAULT_COLUMN_MIN_WIDTH, DEFAULT_COLUMN_WIDTH

### Community 89 - "Campo Grid Admin"
Cohesion: 0.29
Nodes (6): MyGrid(), Props, Props, RootStyle, Scrollbar(), SimpleBarStyle

### Community 91 - "Icono Adaptativo Android"
Cohesion: 0.25
Nodes (8): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, android

### Community 93 - "Metadatos Paquete Movil"
Cohesion: 0.25
Nodes (7): engines, node, main, name, packageManager, private, version

### Community 94 - "Imagenes Hotel Plantilla"
Cohesion: 0.50
Nodes (8): Luxury Hotel Room Photo (Template Asset), Beach Resort Exterior Photo (Template Asset), Hotel Booking UI Mockup (Unused Template Design Reference), Consultation At Desk Illustration (Onboarding Slide 1), Connected Worker With Laptop Illustration (Onboarding Slide 2), Seated Users With Phones Illustration (Onboarding Slide 3), Team Collaboration Illustration (Onboarding Slide 4), Onboarding Carousel Design Reference (Relax / Welcome Screens)

### Community 95 - "Scripts Admin"
Cohesion: 0.29
Nodes (7): scripts, build, dev, local, start, test, typecheck

### Community 96 - "Navegacion por Secciones"
Cohesion: 0.38
Nodes (4): Props, SectionItem, SectionNav, SectionNavRefProps

### Community 98 - "Ilustraciones Plantilla Movil"
Cohesion: 0.48
Nodes (7): Meditation Onboarding Illustration, Invite Phone Call Illustration, Mood Diary Template Art, Default User Avatar Photo, Relaxation Template Art, Web Panel Teamwork Illustration, Welcome Screen Art

### Community 99 - "Presupuesto de Tokens"
Cohesion: 0.40
Nodes (6): Token Reduction Benchmark, BFS Traversal Mode, NetworkX Fallback Traversal, Token Budget Output Cap, Corpus Size Gate, Step 2 Detect Files

### Community 100 - "Lista de Datos Admin"
Cohesion: 0.40
Nodes (4): ActionBar(), DataList(), DataTableBody(), DataTableHeader()

### Community 101 - "Campo de Texto Admin"
Cohesion: 0.53
Nodes (5): MyTextField(), Props, removeNonNumericChars(), roundTo(), sanitizeStringToNumber()

### Community 102 - "Lista de Modulos Admin"
Cohesion: 0.53
Nodes (4): ModuleList(), ModuleListItem, Props, useStyles

### Community 103 - "Tipos SimpleTable Admin"
Cohesion: 0.33
Nodes (5): DataListProps, DataTableProps, MyTableModel, TableHeader, UpdateParams

### Community 104 - "Item de Tabla Admin"
Cohesion: 0.40
Nodes (4): colors, Props, TableListItemComponent(), useStyles

### Community 105 - "Insignia de Metrica Movil"
Cohesion: 0.33
Nodes (5): Container, Label, MetricBadge(), MetricBadgeProps, Value

### Community 106 - "Modo Watch Graphify"
Cohesion: 0.40
Nodes (5): Watch Debounce, Watch Mode Auto-Rebuild, Post-Commit Rebuild Hook, Work Memory LESSONS.md, Code-Only Change Fast Path

### Community 107 - "Boton de Archivo Admin"
Cohesion: 0.50
Nodes (3): ActionSearchProps, FileItemButton(), useStyles

### Community 108 - "Etiqueta Admin"
Cohesion: 0.40
Nodes (3): LabelProps, Props, RootStyle

### Community 109 - "Barra de Desplazamiento Admin"
Cohesion: 0.40
Nodes (3): Props, RootStyle, SimpleBarStyle

### Community 110 - "Hook de Sesion Admin"
Cohesion: 0.40
Nodes (3): defaultPermissions, SessionPermissions, UsuarioSesion

### Community 112 - "Configuracion iOS"
Cohesion: 0.40
Nodes (5): usesNonExemptEncryption, ios, bundleIdentifier, config, supportsTablet

### Community 113 - "Plugins Expo y MapLibre"
Cohesion: 0.40
Nodes (5): plugins, expo-asset, @maplibre/maplibre-react-native, expo-asset, @maplibre/maplibre-react-native

### Community 114 - "Seccion Lista Horizontal"
Cohesion: 0.40
Nodes (3): Container, Header, HorizontalListSectionProps

### Community 116 - "Formato ID y Expansion"
Cohesion: 0.50
Nodes (4): Constrained Query Expansion, Graph Label Vocabulary File, Honesty Rules, Step 9 Manifest and Cost Tracker

### Community 117 - "TypeScript Compartido"
Cohesion: 0.50
Nodes (4): typescript, typescript, typescript, typescript

### Community 122 - "Tipos React Compartidos"
Cohesion: 0.67
Nodes (3): @types/react, @types/react, @types/react

## Ambiguous Edges - Review These
- `Token Budget Output Cap` → `Token Reduction Benchmark`  [AMBIGUOUS]
  .claude/skills/graphify/references/exports.md · relation: conceptually_related_to
- `Blue Chevron Brand Language` → `Teal Flat In-App Icon Style`  [AMBIGUOUS]
  src/shared/assets/icons/support_icon.png · relation: conceptually_related_to
- `Home Wellness Exercise Illustration` → `User Support Screen Flow`  [AMBIGUOUS]
  src/shared/assets/images/care_image.png · relation: conceptually_related_to
- `Default User Avatar` → `User Support Screen Flow`  [AMBIGUOUS]
  src/shared/assets/images/design_user_image.png · relation: references
- `User Support Screen Flow` → `Hotel Booking Listing Imagery`  [AMBIGUOUS]
  src/shared/assets/images/hotel_1.png · relation: conceptually_related_to
- `Beach Resort Exterior Photo (Template Asset)` → `Seated Users With Phones Illustration (Onboarding Slide 3)`  [AMBIGUOUS]
  src/shared/assets/images/hotel_5.png · relation: conceptually_related_to
- `Hotel Booking UI Mockup (Unused Template Design Reference)` → `Consultation At Desk Illustration (Onboarding Slide 1)`  [AMBIGUOUS]
  src/shared/assets/images/hotel_booking.png · relation: conceptually_related_to
- `Meditation Onboarding Illustration` → `Invite Phone Call Illustration`  [AMBIGUOUS]
  src/shared/assets/images/introduction_image.png · relation: conceptually_related_to
- `Mood Diary Template Art` → `Web Panel Teamwork Illustration`  [AMBIGUOUS]
  src/shared/assets/images/mood_dairy_image.png · relation: conceptually_related_to
- `Relaxation Template Art` → `Web Panel Teamwork Illustration`  [AMBIGUOUS]
  src/shared/assets/images/relax_image.png · relation: conceptually_related_to
- `Dashboard Screen (Home)` → `Profile Tab Affordance (person icon)`  [AMBIGUOUS]
  src/shared/assets/references/informacion.jpeg · relation: conceptually_related_to
- `'Botón 168' Pulsing Circular Call Button (Línea Gratuita)` → `EmergencyType Screen (Emergencia)`  [AMBIGUOUS]
  src/shared/assets/references/dashboard.jpeg · relation: conceptually_related_to
- `'Enviar solicitud' Submit Button (disabled state)` → `Color-Coded Triage Level List (red, orange, ...)`  [AMBIGUOUS]
  src/shared/assets/references/emergencia.jpeg · relation: shares_data_with
- `Government Logo Header Band (Gobierno Autonomo Departamental / SEDES)` → `Branding Mismatch: Mockups Show Cochabamba SEDES, Project Targets Oruro`  [AMBIGUOUS]
  src/shared/assets/references/paso-3-registro.jpeg · relation: conceptually_related_to
- `Blue Gradient Background with White Card Registration Theme` → `Red/Coral Accent Theme with Icon-Labeled Data Rows`  [AMBIGUOUS]
  src/shared/assets/references/perfil.jpeg · relation: conceptually_related_to
- `Domain: perfiles Table (citizen profile record)` → `Gap: Medical Fields (tipo_sangre, alergias, enfermedades_cronicas, medicamentos, seguro_medico, sexo) Absent From Mockups`  [AMBIGUOUS]
  src/shared/assets/references/perfil.jpeg · relation: conceptually_related_to
- `Branding Mismatch: Mockups Show Cochabamba SEDES, Project Targets Oruro` → `Profile Value: Oruro (municipio / departamento home row)`  [AMBIGUOUS]
  src/shared/assets/references/perfil.jpeg · relation: conceptually_related_to

## Knowledge Gaps
- **669 isolated node(s):** `name`, `version`, `private`, `type`, `homepage` (+664 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Token Budget Output Cap` and `Token Reduction Benchmark`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Blue Chevron Brand Language` and `Teal Flat In-App Icon Style`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Home Wellness Exercise Illustration` and `User Support Screen Flow`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Default User Avatar` and `User Support Screen Flow`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `User Support Screen Flow` and `Hotel Booking Listing Imagery`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Beach Resort Exterior Photo (Template Asset)` and `Seated Users With Phones Illustration (Onboarding Slide 3)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Hotel Booking UI Mockup (Unused Template Design Reference)` and `Consultation At Desk Illustration (Onboarding Slide 1)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._