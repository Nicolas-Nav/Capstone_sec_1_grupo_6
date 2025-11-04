# PROPUESTAS PARA MÓDULO ANALÍTICO
## Sistema de Gestión de Reclutamiento y Selección
### Análisis Prácticos y Accionables

---

## 🎯 FILOSOFÍA DEL MÓDULO

Este módulo extrae **insights accionables** de los datos para:
- Identificar problemas antes de que se vuelvan críticos
- Encontrar oportunidades de mejora
- Optimizar procesos basándose en evidencia histórica
- Tomar decisiones informadas con datos reales

---

## ⏱️ 1. ANÁLISIS DE TIEMPO: DURACIÓN REAL VS ESTIMADA 

### 1.1 Duración Real vs Plazo Máximo
**Objetivo**: Identificar procesos que exceden plazos y ajustar estimaciones futuras

**Análisis**:
- **Desviación promedio**: Diferencia entre `plazo_maximo_solicitud` y duración real (hasta `fecha_ingreso_contratacion` o cancelación)
- **Porcentaje de procesos en tiempo**: Qué % cumple con el plazo
- **Desviación por tipo de servicio**: ¿Qué servicios (`codigo_servicio`) tienden a exceder plazos?
- **Desviación por consultor**: ¿Qué consultores (`rut_usuario`) tienden a cumplir/exceder plazos?
- **Desviación por cliente**: ¿Qué clientes tienen procesos que exceden plazos frecuentemente?

**Acción Esperada**:
- Ajustar duraciones estimadas (`plazo_maximo_solicitud`) según datos históricos
- Identificar cuellos de botella en tipos de servicio específicos
- Alertar proactivamente cuando un proceso va en camino a exceder plazo

---

### 1.2 Tiempo por Etapa
**Objetivo**: Identificar etapas lentas del proceso

**Análisis**:
- **Tiempo promedio en cada etapa** (`etapa_solicitud`): Cuánto tiempo pasa cada solicitud en cada etapa
- **Etapas más lentas**: Qué etapas retrasan más el proceso
- **Tiempo en etapa vs resultado final**: ¿Etapas que toman mucho tiempo terminan en éxito?
- **Variabilidad**: ¿Qué etapas tienen más variabilidad en tiempo?

**Acción Esperada**:
- Optimizar procesos en etapas identificadas como lentas
- Establecer SLAs por etapa basados en datos históricos
- Identificar si hay problemas específicos en ciertas etapas

---

### 1.3 Tiempo Óptimo de Ciclo
**Objetivo**: Encontrar el tiempo ideal que maximiza tasa de éxito

**Análisis**:
- **Correlación tiempo total vs éxito**: ¿Procesos más rápidos o más lentos tienen mejor resultado?
- **Tiempo promedio de procesos exitosos vs fallidos**: Comparar duraciones
- **Zona óptima**: ¿Qué rango de tiempo tiene mayor tasa de éxito?
- **Por tipo de servicio**: Tiempo óptimo puede variar por servicio

**Acción Esperada**:
- Establecer objetivos de tiempo basados en evidencia, no en suposiciones
- Identificar si acelerar demasiado reduce calidad o si demorar demasiado reduce éxito

---

## 👥 2. RENDIMIENTO POR CONSULTOR

### 2.1 Eficiencia de Consultores
**Objetivo**: Identificar consultores con necesidades de apoyo y reconocer a los destacados

**Análisis**:
- **Tasa de éxito por consultor**: % de solicitudes asignadas que terminan en contratación
- **Tiempo promedio de ciclo**: Cuánto tarda cada consultor en completar procesos
- **Tasa de cumplimiento de plazos**: % de procesos que cumple con `plazo_maximo_solicitud`
- **Promedio de candidatos por solicitud**: Cantidad de postulaciones gestionadas por proceso
- **Rating promedio de candidatos presentados**: Calidad según `valoracion` en postulaciones
- **Tasa de aprobación del cliente**: % de candidatos aprobados vs rechazados

**Acción Esperada**:
- **Reasignar carga de trabajo**: Balancear carga entre consultores eficientes y menos eficientes
- **Capacitación dirigida**: Identificar consultores que necesitan apoyo en áreas específicas
- **Reconocimiento**: Identificar consultores destacados para reconocimiento y como mentores

---

### 2.2 Carga de Trabajo y Productividad
**Objetivo**: Balancear carga y prevenir sobrecarga

**Análisis**:
- **Solicitudes activas por consultor**: Cuántas solicitudes tiene cada consultor actualmente
- **Solicitudes completadas por período**: Productividad mensual/trimestral
- **Carga vs rendimiento**: ¿Consultores con más carga tienen menor rendimiento?
- **Tiempo entre solicitudes**: ¿Consultores que toman muchas a la vez tienen peores resultados?

**Acción Esperada**:
- Distribuir equitativamente nuevas solicitudes
- Identificar consultores sobrecargados antes de que afecte calidad
- Planificar asignaciones considerando carga actual

---

### 2.3 Especialización por Consultor
**Objetivo**: Asignar solicitudes según fortalezas de cada consultor

**Análisis**:
- **Rendimiento por tipo de servicio**: ¿Qué consultor tiene mejor desempeño con cada `codigo_servicio`?
- **Rendimiento por rubro**: ¿Qué consultor tiene mejor éxito con cada `rubro`?
- **Rendimiento por cliente**: ¿Qué consultor trabaja mejor con cada cliente específico?
- **Rendimiento por región**: ¿Consultores tienen mejor desempeño con procesos de ciertas regiones?

**Acción Esperada**:
- Asignar solicitudes basándose en historial de éxito
- Identificar áreas de especialización de cada consultor
- Potenciar fortalezas identificadas

---

## 📈 3. TENDENCIAS Y TEMPORADAS

### 3.1 Estacionalidad de Solicitudes
**Objetivo**: Predecir alta/baja demanda para preparar recursos

**Análisis**:
- **Solicitudes por mes**: Identificar meses de mayor/menor actividad
- **Solicitudes por trimestre**: Patrones trimestrales
- **Variación año sobre año**: Comparar mismo mes de años diferentes
- **Patrones de días**: ¿Hay días de la semana/mes con más solicitudes?
- **Tendencia histórica**: ¿La demanda va en aumento o disminución?

**Acción Esperada**:
- **Planificar recursos**: Contratar consultores temporales en períodos de alta demanda
- **Planificación de vacaciones**: Evitar vacaciones en períodos críticos
- **Preparación anticipada**: Saber cuándo reforzar equipos

---

### 3.2 Estacionalidad de Contrataciones
**Objetivo**: Entender cuándo es más probable tener éxito

**Análisis**:
- **Contrataciones por mes**: ¿Hay meses con mayor tasa de éxito?
- **Tiempo de ciclo por mes**: ¿Procesos en ciertos meses son más rápidos?
- **Correlación con solicitudes**: ¿Períodos de alta demanda tienen menor tasa de éxito?

**Acción Esperada**:
- Ajustar expectativas según época del año
- Planificar esfuerzos extra en períodos históricamente más exitosos

---

### 3.3 Tendencias de Mercado
**Objetivo**: Adaptarse a cambios en el mercado laboral

**Análisis**:
- **Evolución de tipos de servicio demandados**: ¿Qué servicios están creciendo/decreciendo?
- **Cambio en perfiles solicitados**: ¿Qué características (`nivel_ingles`, `rubro`, etc.) se demandan más?
- **Evolución de expectativas salariales**: Tendencias en `expectativa_renta`
- **Cambios geográficos**: ¿Hay regiones con crecimiento/declive en solicitudes?

**Acción Esperada**:
- Preparar especialización en servicios/rubros emergentes
- Ajustar estrategias de búsqueda según cambios de mercado
- Identificar nuevas oportunidades geográficas

---

## 🔍 4. IDENTIFICACIÓN DE CUELLOS DE BOTELLA

### 4.1 Análisis de Estados Lentos
**Objetivo**: Identificar dónde se estancan los procesos

**Análisis**:
- **Tiempo promedio en cada estado**: Basado en `estado_solicitud_hist`, cuánto tiempo pasa cada solicitud en cada estado
- **Estados con mayor variabilidad**: Estados que tienen tiempos muy inconsistentes
- **Estados que predicen problemas**: ¿Estados donde los procesos se demoran mucho tienden a fallar?
- **Frecuencia de cambios de estado**: ¿Qué estados tienen más cambios (indicando dificultades)?

**Acción Esperada**:
- Optimizar procesos en estados identificados como problemáticos
- Establecer tiempos máximos por estado
- Identificar si hay problemas específicos de consultores/clientes en ciertos estados

---

### 4.2 Análisis de Hitos Problemáticos
**Objetivo**: Identificar hitos que causan retrasos

**Análisis**:
- **Tasa de cumplimiento por hito** (`nombre_hito`): % que se cumple a tiempo
- **Desviación promedio**: Diferencia entre `fecha_limite` y `fecha_cumplimiento`
- **Hitos más frecuentemente vencidos**: Cuáles se exceden más
- **Impacto de hitos vencidos**: ¿Hitos vencidos predicen fracaso del proceso?
- **Hitos por tipo de servicio**: ¿Algunos servicios tienen hitos más problemáticos?

**Acción Esperada**:
- Ajustar duraciones de hitos problemáticos
- Mejorar procesos o asignar más recursos a hitos críticos
- Revisar si algunos hitos deberían eliminarse o modificarse

---

### 4.3 Análisis de Feedback Lento
**Objetivo**: Identificar demoras en respuesta de clientes

**Análisis**:
- **Tiempo de respuesta del cliente**: Entre `fecha_envio` (postulación) y `fecha_feedback_cliente`
- **Clientes más lentos en responder**: Cuáles demoran más en dar feedback
- **Impacto de demora**: ¿Clientes que responden lento tienen menor tasa de éxito final?
- **Correlación con satisfacción**: ¿Respuesta rápida correlaciona con mejor satisfacción (`encuesta_satisfaccion`)?

**Acción Esperada**:
- Establecer SLAs de respuesta con clientes problemáticos
- Identificar clientes que requieren seguimiento más proactivo
- Crear alertas cuando el tiempo de respuesta excede lo normal

---

## 🏢 5. ANÁLISIS DE CLIENTES

### 5.1 Clientes por Volumen y Recurrencia
**Objetivo**: Identificar clientes VIP y oportunidades de crecimiento

**Análisis**:
- **Volumen de solicitudes por cliente**: Total histórico y tendencia reciente
- **Frecuencia de solicitudes**: Clientes recurrentes vs nuevos
- **Tendencia**: ¿Cliente está aumentando o disminuyendo solicitudes?
- **Valor del cliente**: Estimación basada en historial

**Acción Esperada**:
- Tratamiento especial para clientes VIP (alto volumen/recurrencia)
- Identificar clientes en riesgo de dejar de solicitar servicios
- Priorizar atención a clientes de alto potencial

---

### 5.2 Satisfacción y Calidad de Relación
**Objetivo**: Mantener relaciones exitosas y mejorar problemáticas

**Análisis**:
- **Tasa de éxito histórica por cliente**: % de contrataciones exitosas
- **Análisis de encuestas de satisfacción**: Evaluación de `encuesta_satisfaccion`
- **Tiempo de respuesta del cliente**: Entrega de feedback
- **Tendencia de satisfacción**: ¿Mejora o empeora con el tiempo?

**Acción Esperada**:
- Mejorar procesos con clientes insatisfechos
- Replicar estrategias exitosas con clientes satisfechos
- Identificar clientes en riesgo de pérdida

---

### 5.3 Patrones de Comportamiento del Cliente
**Objetivo**: Anticipar necesidades y comportamientos

**Análisis**:
- **Patrones temporales**: ¿Cliente solicita en ciertos períodos del año?
- **Tipo de servicios preferidos**: Qué `codigo_servicio` solicita más cada cliente
- **Complejidad de solicitudes**: ¿Cliente tiende a solicitudes más complejas/simples?
- **Velocidad de decisión**: Tiempo que toma cliente en aprobar/rechazar candidatos

**Acción Esperada**:
- Contacto proactivo con clientes según patrones históricos
- Preparación anticipada para solicitudes esperadas
- Ajustar estrategias según comportamiento del cliente

---

### 5.4 Análisis de Antigüedad y Ciclo de Vida del Cliente
**Objetivo**: Entender comportamiento según antigüedad del cliente

**Análisis** (requiere campo `fecha_creacion_cliente`):
- **Antigüedad del cliente**: Días/años desde `fecha_creacion_cliente` hasta hoy
- **Comportamiento de clientes nuevos vs antiguos**: ¿Clientes nuevos solicitan más/frecuente que antiguos?
- **Tiempo hasta primera solicitud**: Días entre `fecha_creacion_cliente` y primera solicitud
- **Evolución de volumen**: ¿El volumen de solicitudes aumenta/disminuye con el tiempo?
- **Tasa de éxito por antigüedad**: ¿Clientes nuevos o antiguos tienen mejor tasa de éxito?
- **Clientes en riesgo de churn**: Clientes antiguos que han dejado de solicitar servicios

**Acción Esperada**:
- Estrategias diferenciadas para onboarding de clientes nuevos
- Programas de reactivación para clientes antiguos inactivos
- Identificar momento óptimo para contacto con clientes nuevos
- Prevenir churn detectando clientes que van disminuyendo actividad

---

### 5.5 Análisis de Crecimiento de Base de Clientes
**Objetivo**: Entender adquisición y retención de clientes

**Análisis** (requiere campo `fecha_creacion_cliente`):
- **Nuevos clientes por período**: Cantidad de clientes creados por mes/trimestre/año
- **Tendencia de adquisición**: ¿La tasa de nuevos clientes aumenta o disminuye?
- **Tasa de retención**: % de clientes que siguen activos después de X tiempo
- **Curva de cohorte**: Comportamiento de clientes creados en el mismo período
- **Clientes activos vs inactivos por antigüedad**: ¿Qué antigüedad tiene mayor actividad?

**Acción Esperada**:
- Medir efectividad de estrategias de adquisición
- Identificar factores de retención exitosa
- Ajustar estrategias según cohortes de clientes
- Predecir necesidades de recursos según crecimiento esperado

---

## 📊 6. ANÁLISIS DE EFECTIVIDAD DE PORTALES

### 6.1 ROI por Portal
**Objetivo**: Optimizar inversión en portales de postulación

**Análisis**:
- **Postulaciones generadas por portal**: Cantidad desde cada `id_portal_postulacion`
- **Tasa de conversión**: De postulado a contratado por portal
- **Calidad de candidatos**: Rating promedio (`valoracion`) por portal
- **Costo por contratación**: Si se tiene costo, calcular eficiencia
- **Tiempo promedio hasta primera postulación**: Velocidad de respuesta por portal

**Acción Esperada**:
- Enfocar recursos en portales más efectivos
- Reducir o eliminar inversión en portales poco efectivos
- Optimizar mix de portales según tipo de servicio

---

### 6.2 Efectividad por Tipo de Servicio
**Objetivo**: Elegir el portal adecuado para cada tipo de solicitud

**Análisis**:
- **Mejor portal por `codigo_servicio`**: ¿Qué portal tiene mejor tasa de éxito para cada tipo?
- **Calidad de candidatos por portal y servicio**: Rating promedio según combinación
- **Tiempo hasta postulaciones**: Velocidad por combinación portal-servicio

**Acción Esperada**:
- Recomendar portales específicos según tipo de servicio
- Crear estrategias diferenciadas por tipo de servicio

---

## 👤 7. ANÁLISIS DE PERFILES DE CANDIDATOS

### 7.1 Perfiles Más Exitosos
**Objetivo**: Identificar características de candidatos con mayor probabilidad de éxito

**Análisis**:
- **Tasa de éxito por edad**: ¿Qué rangos de `edad_candidato` tienen mayor tasa de contratación?
- **Tasa de éxito por nivel de inglés**: Impacto de `nivel_ingles` en contratación
- **Tasa de éxito por experiencia**: Años de experiencia (calculados desde `experiencia`) vs éxito
- **Tasa de éxito por rubro**: ¿Qué `rubro` tiene mayor tasa de contratación?
- **Combinaciones exitosas**: ¿Qué combinaciones de características tienen mejor resultado?

**Acción Esperada**:
- Enfocar búsqueda en perfiles con mayor probabilidad de éxito
- Ajustar criterios de selección basándose en evidencia
- Identificar nuevos nichos prometedores

---

### 7.2 Desajustes Oferta-Demanda
**Objetivo**: Identificar gaps entre lo que se busca y lo que hay disponible

**Análisis**:
- **Demanda vs oferta por rubro**: ¿Qué rubros se solicitan mucho pero hay pocos candidatos?
- **Demanda vs oferta geográfica**: ¿Qué regiones tienen desbalance?
- **Competencias demandadas vs disponibles**: Análisis de `software_herramientas`, `nivel_ingles`, etc.

**Acción Esperada**:
- Identificar oportunidades de mercado (alta demanda, baja oferta)
- Ajustar estrategias de búsqueda según disponibilidad
- Potenciar áreas con alta oferta y demanda

---

## ✅ 8. ANÁLISIS DE TASA DE ÉXITO

### 8.1 Factores que Afectan el Éxito
**Objetivo**: Identificar qué variables influyen más en la tasa de contratación

**Análisis**:
- **Tasa de éxito por tipo de servicio**: Qué `codigo_servicio` tiene mayor tasa
- **Tasa de éxito por consultor**: Rendimiento individual
- **Tasa de éxito por cliente**: Rendimiento por cliente
- **Tasa de éxito por región**: Variaciones geográficas
- **Tasa de éxito por rubro**: Diferencias por sector
- **Tasa de éxito por mes/trimestre**: Estacionalidad del éxito

**Acción Esperada**:
- Replicar condiciones de procesos exitosos
- Evitar o mejorar condiciones de procesos con baja tasa de éxito
- Enfocar recursos en áreas/servicios con mayor potencial

---

### 8.2 Comparativa de Rendimiento
**Objetivo**: Identificar mejores prácticas y áreas de mejora

**Análisis**:
- **Benchmarking interno**: Comparar rendimiento de diferentes unidades (consultores, servicios, regiones)
- **Tendencias de mejora/deterioro**: ¿Qué áreas están mejorando/empeorando?
- **Desviaciones significativas**: ¿Qué consultores/servicios/clientes se desvían mucho del promedio?

**Acción Esperada**:
- Aplicar mejores prácticas de áreas destacadas a áreas débiles
- Investigar causas de desviaciones significativas
- Celebrar mejoras y corregir deterioros

---

## 🎯 9. ANÁLISIS DE OPTIMIZACIÓN

### 9.1 Timing Óptimo
**Objetivo**: Identificar mejores momentos para acciones clave

**Análisis**:
- **Día óptimo de publicación**: ¿Qué día de la semana `fecha_publicacion` genera más postulaciones?
- **Tiempo óptimo entre acciones**: ¿Cuál es el intervalo ideal entre publicación y evaluación?
- **Momento óptimo de seguimiento**: ¿Cuándo seguir con clientes maximiza respuesta?

**Acción Esperada**:
- Programar publicaciones en días/momentos óptimos
- Optimizar timing de seguimientos
- Ajustar calendarios según evidencia

---

### 9.2 Optimización de Asignaciones
**Objetivo**: Asignar solicitudes de manera más efectiva

**Análisis**:
- **Match consultor-servicio**: ¿Qué consultor tiene mejor historial con cada tipo de servicio?
- **Match consultor-cliente**: ¿Qué consultor trabaja mejor con cada cliente?
- **Match consultor-rubro**: ¿Qué consultor tiene mejor desempeño con cada rubro?

**Acción Esperada**:
- Asignar solicitudes basándose en historial de éxito
- Crear equipos especializados
- Optimizar combinaciones consultor-servicio-cliente

---

## 📋 10. ALERTAS Y RECOMENDACIONES AUTOMÁTICAS

### 10.1 Alertas Proactivas
**Análisis que genera alertas**:
- **Proceso en riesgo de vencimiento**: Basado en tiempo transcurrido vs promedio histórico
- **Consultor sobrecargado**: Cuando carga excede capacidad histórica óptima
- **Cliente en riesgo**: Patrones que indican posible pérdida de cliente
- **Tendencia negativa**: Áreas que muestran deterioro continuo

**Acción Esperada**:
- Prevenir problemas antes de que ocurran
- Tomar acción correctiva temprana

---

### 10.2 Recomendaciones Contextuales
**Análisis que genera recomendaciones**:
- **Portal recomendado**: Basado en éxito histórico para tipo de servicio
- **Consultor recomendado**: Basado en especialización y disponibilidad
- **Plazo sugerido**: Basado en tiempo promedio de procesos similares exitosos
- **Estrategia sugerida**: Basada en patrones de éxito similares

**Acción Esperada**:
- Aprovechar conocimiento histórico automáticamente
- Reducir decisiones subóptimas

---

## 🛠️ IMPLEMENTACIÓN TÉCNICA

### Tecnologías Necesarias:
- **SQL Avanzado**: Agregaciones, window functions, subconsultas complejas
- **Visualización**: Charts interactivos (Chart.js, Recharts, Plotly)
- **Cálculos estadísticos básicos**: Promedios, medianas, desviaciones, correlaciones simples
- **Sistema de alertas**: Notificaciones basadas en umbrales

### Datos Clave a Consultar:
- **Solicitud**: `fecha_ingreso_solicitud`, `plazo_maximo_solicitud`, `codigo_servicio`, `rut_usuario`, `id_etapa_solicitud`, `id_contacto`
- **EstadoSolicitudHist**: Historial completo para calcular tiempos por estado
- **Postulacion**: `fecha_envio`, `fecha_feedback_cliente`, `valoracion`, `id_portal_postulacion`
- **Candidato**: `edad_candidato`, `fecha_nacimiento_candidato`, `nivel_ingles`, `rubro`, ubicación
- **Contratacion**: `fecha_ingreso_contratacion`, `encuesta_satisfaccion`
- **HitoSolicitud**: `fecha_base`, `fecha_limite`, `fecha_cumplimiento`, `nombre_hito`
- **Publicacion**: `fecha_publicacion`, `id_portal_postulacion`
- **Experiencia**: `fecha_inicio_experiencia`, `fecha_fin_experiencia`

---

## 💰 11. ANÁLISIS DE EXPECTATIVAS SALARIALES Y COMPETITIVIDAD

### 11.1 Análisis de Expectativas Salariales
**Objetivo**: Entender el mercado y ajustar estrategias de reclutamiento

**Análisis**:
- **Rango de expectativas por rubro**: `expectativa_renta` promedio, mínimo, máximo por `rubro`
- **Expectativas por nivel de experiencia**: Correlación años de experiencia vs expectativa
- **Expectativas por nivel de inglés**: Impacto de `nivel_ingles` en expectativa salarial
- **Tendencias temporales**: ¿Las expectativas suben/bajan con el tiempo?
- **Expectativas vs contratación real**: ¿Candidatos contratados tienen expectativas diferentes?

**Acción Esperada**:
- Ajustar rangos salariales en búsquedas según mercado real
- Identificar rubros con expectativas desalineadas con la realidad
- Preparar argumentos comerciales según expectativas del mercado

---

### 11.2 Competitividad del Mercado
**Objetivo**: Entender qué tan competitivo está el mercado laboral

**Análisis**:
- **Relación postulaciones/vacantes**: Cantidad de postulaciones por vacante por rubro/región
- **Tiempo hasta primera postulación**: Velocidad con que llegan candidatos tras publicación
- **Candidatos rechazados que se contratan rápido**: ¿Los buenos se van rápido?
- **Competencia entre clientes**: ¿Múltiples clientes compiten por mismos candidatos?

**Acción Esperada**:
- Actuar rápido en mercados competitivos
- Identificar oportunidades en mercados con baja competencia
- Ajustar estrategias según nivel de competitividad

---

## 🎓 12. ANÁLISIS DE FORMACIÓN Y COMPETENCIAS

### 12.1 Competencias Más Demandadas
**Objetivo**: Identificar skills críticos en el mercado actual

**Análisis**:
- **Frecuencia de requisitos**: Análisis de `nivel_ingles`, `software_herramientas`, `licencia` en solicitudes
- **Evolución de requisitos**: ¿Qué competencias están creciendo en demanda?
- **Competencias por tipo de servicio**: ¿Qué servicios requieren qué skills?
- **Competencias por rubro**: Skills más comunes por sector

**Acción Esperada**:
- Enfocar búsquedas en competencias más solicitadas
- Capacitar consultores en habilidades emergentes
- Ajustar perfiles de búsqueda según tendencias

---

### 12.2 Formación Educativa y Éxito
**Objetivo**: Entender impacto de formación en contratación

**Análisis**:
- **Tasa de éxito por nivel educativo**: Análisis de `profesion`, `postgrado_capacitacion`
- **Instituciones más valoradas**: ¿Qué `institucion` genera candidatos con mayor tasa de éxito?
- **Impacto de postgrados**: ¿Candidatos con postgrado tienen mayor tasa de aprobación?
- **Formación vs experiencia**: ¿Qué pesa más en el éxito final?

**Acción Esperada**:
- Priorizar perfiles con formación que históricamente funciona mejor
- Identificar instituciones que generan candidatos de calidad
- Balancear criterios entre formación y experiencia

---

## 🔄 13. ANÁLISIS DE REUTILIZACIÓN DE CANDIDATOS

### 13.1 Candidatos Reutilizables
**Objetivo**: Maximizar valor de base de candidatos

**Análisis**:
- **Candidatos que postulan múltiples veces**: Frecuencia de re-postulación
- **Tasa de éxito de re-postulaciones**: ¿Candidatos que vuelven a postular tienen mejor tasa?
- **Tiempo entre postulaciones**: ¿Cuánto tiempo pasa entre una postulación y otra?
- **Mejora en rating**: ¿Candidatos mejoran su `valoracion` en postulaciones posteriores?

**Acción Esperada**:
- Crear base de candidatos destacados para futuras oportunidades
- Contactar candidatos anteriores para nuevas posiciones
- Identificar candidatos que están mejorando continuamente

---

### 13.2 Candidatos Que Se Fueron Pero Volvieron
**Objetivo**: Entender rotación y segunda oportunidad

**Análisis**:
- **Candidatos contratados que postulan de nuevo**: ¿Hay rotación rápida?
- **Candidatos rechazados que se contratan después**: ¿Se perdió talento que luego se contrató?
- **Patrones de abandono**: ¿Candidatos en qué etapas vuelven más?

**Acción Esperada**:
- Identificar si se rechazó talento que debería haberse considerado
- Ajustar criterios de evaluación basándose en casos de éxito posterior
- Mantener relación con buenos candidatos rechazados

---

## ⏰ 14. ANÁLISIS DE TIEMPOS DE RESPUESTA

### 14.1 Velocidad de Respuesta del Sistema
**Objetivo**: Optimizar tiempos de respuesta en todo el proceso

**Análisis**:
- **Tiempo desde postulación hasta primera evaluación**: Velocidad de revisión inicial
- **Tiempo desde evaluación hasta presentación**: Eficiencia de consultores
- **Tiempo desde presentación hasta feedback cliente**: Respuesta del cliente
- **Tiempo total desde postulación hasta contratación**: Ciclo completo del candidato

**Acción Esperada**:
- Establecer SLAs basados en tiempos históricos
- Identificar etapas donde se puede acelerar sin perder calidad
- Mejorar experiencia del candidato con respuestas más rápidas

---

### 14.2 Impacto de Velocidad en Éxito
**Objetivo**: Entender si la velocidad afecta resultados

**Análisis**:
- **Correlación velocidad vs aprobación**: ¿Respuestas rápidas mejoran tasa de aprobación?
- **Punto óptimo**: ¿Hay velocidad que maximiza éxito?
- **Riesgo de velocidad excesiva**: ¿Acelerar demasiado reduce calidad?

**Acción Esperada**:
- Encontrar balance óptimo entre velocidad y calidad
- Priorizar velocidad en etapas críticas

---

## 📍 15. ANÁLISIS GEOGRÁFICO Y MOVILIDAD

### 15.1 Desajustes Geográficos Oferta-Demanda
**Objetivo**: Optimizar matching geográfico

**Análisis**:
- **Demanda por región**: Solicitudes por `region`
- **Oferta por región**: Candidatos disponibles por `region`
- **Gap geográfico**: Regiones con alta demanda pero baja oferta
- **Oportunidades geográficas**: Regiones con oferta disponible pero poca demanda explorada

**Acción Esperada**:
- Enfocar recursos en regiones con desajustes positivos
- Expandir búsqueda a regiones con oferta disponible
- Ajustar estrategias según realidad geográfica

---

### 15.2 Movilidad y Relocalización
**Objetivo**: Entender disponibilidad de candidatos para relocalización

**Análisis**:
- **Candidatos por región vs solicitudes de otras regiones**: Disponibilidad de movilidad
- **Patrones de relocalización histórica**: ¿Candidatos se han movido entre regiones?
- **Relación distancia-éxito**: ¿Candidatos de regiones cercanas tienen mejor resultado?

**Acción Esperada**:
- Identificar candidatos abiertos a relocalización
- Considerar movilidad en estrategias de búsqueda
- Ajustar expectativas según disponibilidad geográfica

---

## 👥 16. ANÁLISIS DE DIVERSIDAD E INCLUSIÓN

### 16.1 Diversidad en Procesos
**Objetivo**: Monitorear diversidad en reclutamiento

**Análisis**:
- **Distribución por edad**: Análisis de `edad_candidato` en postulaciones y contrataciones
- **Distribución geográfica**: Diversidad de ubicación de candidatos
- **Distribución por nacionalidad**: Análisis de `nacionalidad`
- **Inclusión de personas con discapacidad**: Análisis de `discapacidad` en contrataciones

**Acción Esperada**:
- Identificar sesgos potenciales en selección
- Promover diversidad en procesos
- Reportar métricas de inclusión

---

### 16.2 Impacto de Diversidad en Resultados
**Objetivo**: Entender si la diversidad mejora resultados

**Análisis**:
- **Tasa de éxito de procesos diversos**: ¿Procesos con mayor diversidad tienen mejor resultado?
- **Satisfacción del cliente vs diversidad**: ¿Clientes valoran diversidad?
- **Calidad promedio según diversidad**: Rating promedio de equipos diversos

**Acción Esperada**:
- Promover diversidad como ventaja competitiva
- Ajustar estrategias de búsqueda hacia inclusión

---

## 💼 17. ANÁLISIS DE EXPERIENCIA LABORAL

### 17.1 Patrones de Experiencia
**Objetivo**: Entender qué experiencia laboral correlaciona con éxito

**Análisis**:
- **Años de experiencia promedio**: Cálculo desde `fecha_inicio_experiencia` y `fecha_fin_experiencia`
- **Tasa de éxito por años de experiencia**: ¿Qué rango tiene mayor éxito?
- **Experiencia en rubro específico**: ¿Candidatos con experiencia en el mismo `rubro` tienen mejor resultado?
- **Stability laboral**: ¿Candidatos con trabajos largos vs frecuentes cambios tienen mejor resultado?

**Acción Esperada**:
- Enfocar búsqueda en rangos de experiencia que funcionan mejor
- Valorar experiencia específica según evidencia
- Ajustar criterios de estabilidad según datos

---

### 17.2 Trayectoria Laboral
**Objetivo**: Entender patrones de carrera profesional

**Análisis**:
- **Progresión de cargo**: ¿Candidatos con progresión ascendente tienen mejor éxito?
- **Cambios de rubro**: ¿Candidatos que cambian rubro tienen diferente tasa de éxito?
- **Tiempo promedio por empleo**: Duración de trabajos previos
- **Razones de salida**: Análisis de `exit_reason` si está disponible

**Acción Esperada**:
- Identificar trayectorias profesionales exitosas
- Ajustar evaluación según patrones de trayectoria

---

## 📊 18. ANÁLISIS DE CALIDAD Y RATING

### 18.1 Rating de Candidatos y Éxito
**Objetivo**: Validar si el rating predice éxito

**Análisis**:
- **Correlación rating vs contratación**: ¿Mayor `valoracion` correlaciona con mayor tasa de contratación?
- **Rating promedio por estado final**: Rating de candidatos contratados vs rechazados
- **Rating vs aprobación del cliente**: ¿Rating alto predice aprobación del cliente?
- **Mejora del rating**: ¿Candidatos que mejoran su rating tienen mejor resultado?

**Acción Esperada**:
- Ajustar sistema de rating si no predice bien
- Usar rating como herramienta de priorización validada
- Identificar qué consultores califican mejor (rating que predice éxito)

---

### 18.2 Consistencia de Evaluaciones
**Objetivo**: Entender variabilidad en evaluaciones

**Análisis**:
- **Variabilidad de rating por consultor**: ¿Algunos consultores califican más alto/bajo que otros?
- **Rating promedio por tipo de servicio**: ¿Diferentes servicios tienen diferentes estándares?
- **Correlación rating consultor vs aprobación cliente**: ¿Rating interno predice aprobación externa?

**Acción Esperada**:
- Estandarizar criterios de evaluación
- Identificar consultores con rating muy desalineado con resultados finales
- Ajustar expectativas según patrones de cada consultor

---

## 🎯 19. ANÁLISIS DE EFICIENCIA DE PUBLICACIONES

### 19.1 Timing de Publicaciones
**Objetivo**: Optimizar cuándo publicar vacantes

**Análisis**:
- **Postulaciones por día de publicación**: ¿Qué día de la semana genera más postulaciones?
- **Postulaciones por hora**: Si hay datos de hora, identificar mejor momento
- **Tiempo hasta primera postulación**: Velocidad de respuesta por momento de publicación
- **Calidad según timing**: ¿Postulaciones tempranas/tardías tienen diferente calidad?

**Acción Esperada**:
- Programar publicaciones en momentos óptimos
- Maximizar visibilidad y respuesta

---

### 19.2 Duración Óptima de Publicaciones
**Objetivo**: Encontrar duración ideal de publicación activa

**Análisis**:
- **Postulaciones por día activa**: ¿Cuántas postulaciones llegan cada día?
- **Curva de respuesta**: ¿Cuándo llegan la mayoría de postulaciones?
- **Postulaciones tardías vs calidad**: ¿Las postulaciones que llegan tarde tienen diferente calidad?

**Acción Esperada**:
- Determinar duración óptima antes de cerrar publicación
- No cerrar antes del punto de rendimientos decrecientes
- No mantener abiertas demasiado tiempo

---

## 📈 20. ANÁLISIS DE TENDENCIAS DE MERCADO

### 20.1 Evolución de Demandas
**Objetivo**: Anticipar cambios en el mercado

**Análisis**:
- **Cambio en tipos de servicio demandados**: Evolución de `codigo_servicio` a lo largo del tiempo
- **Cambio en rubros solicitados**: Evolución de rubros más demandados
- **Emergencia de nuevos perfiles**: ¿Qué nuevos tipos de cargo están apareciendo?
- **Declive de perfiles**: ¿Qué tipos de cargo están desapareciendo?

**Acción Esperada**:
- Preparar especialización en áreas emergentes
- Ajustar oferta de servicios según demanda
- Identificar oportunidades antes que competencia

---

### 20.2 Cambios en Requisitos
**Objetivo**: Adaptarse a evolución de requisitos

**Análisis**:
- **Evolución de nivel de inglés requerido**: ¿Está aumentando la exigencia?
- **Evolución de software/herramientas**: ¿Qué nuevas herramientas se están demandando?
- **Evolución de experiencia requerida**: ¿Los requisitos suben o bajan?
- **Emergencia de nuevas competencias**: Skills que antes no se pedían

**Acción Esperada**:
- Capacitar en competencias emergentes
- Ajustar perfiles de búsqueda según nueva realidad
- Preparar argumentos sobre evolución de requisitos

---

## 🔍 21. ANÁLISIS DE SATISFACCIÓN Y FEEDBACK

### 21.1 Análisis de Encuestas de Satisfacción
**Objetivo**: Entender satisfacción real de clientes

**Análisis**:
- **Satisfacción promedio**: Análisis cuantitativo de `encuesta_satisfaccion`
- **Satisfacción por consultor**: ¿Qué consultores generan mayor satisfacción?
- **Satisfacción por tipo de servicio**: ¿Qué servicios generan mayor satisfacción?
- **Tendencias de satisfacción**: ¿Mejora o empeora con el tiempo?
- **Correlación satisfacción vs re-compra**: ¿Clientes satisfechos vuelven más?

**Acción Esperada**:
- Mejorar con clientes insatisfechos
- Replicar estrategias con clientes satisfechos
- Identificar factores que más impactan satisfacción

---

### 21.2 Análisis de Feedback Cualitativo
**Objetivo**: Extraer insights de comentarios y observaciones

**Análisis**:
- **Temas recurrentes en feedback**: Palabras/claves más mencionadas en `observaciones_contratacion`
- **Feedback positivo vs negativo**: Sentimiento de comentarios
- **Feedback por etapa**: ¿Qué etapas generan más comentarios?
- **Feedback del cliente vs resultado**: ¿Clientes que dan feedback tienen mejor resultado final?

**Acción Esperada**:
- Identificar temas que requieren atención
- Mejorar áreas más mencionadas negativamente
- Replicar aspectos más mencionados positivamente

---

## 🎪 22. ANÁLISIS DE COMPLEJIDAD DE PROCESOS

### 22.1 Factores de Complejidad
**Objetivo**: Identificar qué hace complejo un proceso

**Análisis**:
- **Complejidad vs tiempo**: ¿Procesos complejos toman más tiempo?
- **Complejidad vs éxito**: ¿Procesos complejos tienen menor tasa de éxito?
- **Indicadores de complejidad**: Número de postulaciones, cambios de estado, hitos vencidos
- **Complejidad por tipo de servicio**: ¿Qué servicios son inherentemente más complejos?

**Acción Esperada**:
- Ajustar plazos según complejidad esperada
- Asignar recursos según complejidad
- Identificar si algunos tipos de proceso necesitan rediseño

---

### 22.2 Procesos Excepcionales
**Objetivo**: Identificar procesos que se desvían de la norma

**Análisis**:
- **Procesos anormalmente rápidos/lentos**: Outliers en tiempo
- **Procesos con muchas postulaciones**: ¿Alta demanda indica mejor resultado?
- **Procesos con pocas postulaciones**: ¿Baja demanda indica problema?
- **Procesos con múltiples cambios de estado**: ¿Mucha variación indica problema?

**Acción Esperada**:
- Investigar casos excepcionales para aprender
- Identificar procesos problemáticos temprano
- Replicar procesos excepcionalmente exitosos

---

## 📋 PRIORIZACIÓN PARA IMPLEMENTACIÓN

### Fase 1 - Análisis Básicos Esenciales (MVP)
1. ✅ **Duración Real vs Estimada** (§1): Crítico para optimización de plazos
2. ✅ **Rendimiento por Consultor** (§2): Base para gestión de recursos humanos
3. ✅ **Tendencias/Temporadas** (§3): Fundamental para planificación de recursos
4. ✅ **Cuellos de Botella** (§4): Identificar procesos problemáticos

### Fase 2 - Análisis de Optimización
5. ✅ **Efectividad de Portales** (§6): Optimizar inversión en canales
6. ✅ **Análisis de Clientes** (§5): Gestión de relaciones y satisfacción
7. ✅ **Tiempos de Respuesta** (§14): Optimizar velocidad del proceso
8. ✅ **Eficiencia de Publicaciones** (§19): Maximizar impacto de publicaciones

### Fase 3 - Análisis Estratégicos
9. ✅ **Factores de Éxito** (§8): Replicar mejores prácticas
10. ✅ **Expectativas Salariales** (§11): Entender mercado y competitividad
11. ✅ **Tendencias de Mercado** (§20): Anticipar cambios
12. ✅ **Análisis de Satisfacción** (§21): Mejorar relación con clientes

### Fase 4 - Análisis Especializados
13. ✅ **Perfiles de Candidatos** (§7): Mejorar selección
14. ✅ **Formación y Competencias** (§12): Identificar skills críticos
15. ✅ **Experiencia Laboral** (§17): Entender trayectorias exitosas
16. ✅ **Calidad y Rating** (§18): Validar sistema de evaluación

### Fase 5 - Análisis Avanzados
17. ✅ **Reutilización de Candidatos** (§13): Maximizar base de talento
18. ✅ **Análisis Geográfico** (§15): Optimizar matching regional
19. ✅ **Diversidad e Inclusión** (§16): Monitorear diversidad
20. ✅ **Complejidad de Procesos** (§22): Entender factores de complejidad
21. ✅ **Alertas y Recomendaciones** (§10): Automatización de decisiones

---

## 📊 RESUMEN DE CATEGORÍAS

**Total: 22 categorías principales con 44+ análisis específicos**

### Por Tipo de Objetivo:

**Optimización Operacional** (8 categorías):
- Duración Real vs Estimada
- Rendimiento por Consultor
- Cuellos de Botella
- Tiempos de Respuesta
- Efectividad de Portales
- Eficiencia de Publicaciones
- Complejidad de Procesos
- Alertas y Recomendaciones

**Análisis Estratégico** (6 categorías):
- Tendencias/Temporadas
- Factores de Éxito
- Expectativas Salariales
- Tendencias de Mercado
- Análisis de Clientes
- Análisis de Satisfacción

**Análisis de Talento** (6 categorías):
- Perfiles de Candidatos
- Formación y Competencias
- Experiencia Laboral
- Calidad y Rating
- Reutilización de Candidatos
- Diversidad e Inclusión

**Análisis de Mercado** (2 categorías):
- Análisis Geográfico
- Competitividad del Mercado

---

## 📝 RECOMENDACIONES DE CAMPOS ADICIONALES PARA ANÁLISIS

### Campos Recomendados que Enriquecerían el Módulo Analítico:

#### ✅ **fecha_creacion_cliente** (CRÍTICO)
**Ubicación**: Tabla `cliente`

**Análisis que habilita**:
- Antigüedad del cliente y ciclo de vida
- Análisis de cohortes (clientes creados en mismo período)
- Tasa de retención y churn
- Tiempo hasta primera solicitud
- Evolución de comportamiento según antigüedad
- Crecimiento de base de clientes

**Valor**: ⭐⭐⭐⭐⭐ (MUY ALTO) - Fundamental para análisis de clientes

---

#### **fecha_creacion_solicitud** o **fecha_registro_solicitud**
**Ubicación**: Tabla `solicitud` (si diferente de `fecha_ingreso_solicitud`)

**Análisis que habilita**:
- Tiempo entre creación y activación real
- Velocidad de inicio de procesos
- Procesos "almacenados" vs procesados inmediatamente

**Valor**: ⭐⭐⭐ (MEDIO)

---

#### **fecha_primera_solicitud_cliente**
**Ubicación**: Tabla `cliente` o calculado desde `solicitud`

**Análisis que habilita**:
- Tiempo de conversión: días entre creación del cliente y primera solicitud
- Efectividad de onboarding de clientes
- Clientes "dormidos" que nunca solicitaron

**Valor**: ⭐⭐⭐⭐ (ALTO) - Útil para marketing y onboarding

---

#### **fecha_ultima_solicitud_cliente**
**Ubicación**: Tabla `cliente` o calculado desde `solicitud`

**Análisis que habilita**:
- Clientes inactivos recientes (riesgo de churn)
- Tiempo desde última solicitud
- Patrones de reactivación

**Valor**: ⭐⭐⭐⭐ (ALTO) - Fundamental para retención

---

#### **fecha_creacion_candidato**
**Ubicación**: Tabla `candidato`

**Análisis que habilita**:
- Tiempo entre creación de candidato y primera postulación
- Base de candidatos por período
- Candidatos "dormidos" que nunca postularon
- Efectividad de captación de candidatos

**Valor**: ⭐⭐⭐ (MEDIO)

---

#### **fecha_primera_postulacion_candidato**
**Ubicación**: Tabla `candidato` o calculado desde `postulacion`

**Análisis que habilita**:
- Tiempo de conversión candidato → postulación
- Candidatos captados pero nunca utilizados

**Valor**: ⭐⭐⭐ (MEDIO)

---

#### **valor_contrato** o **monto_servicio**
**Ubicación**: Tabla `solicitud` o `contratacion`

**Análisis que habilita**:
- Valor promedio de contrataciones por consultor/cliente/servicio
- ROI por tipo de servicio
- Clientes por valor (mayores/menores)
- Tendencias de valor de contrataciones

**Valor**: ⭐⭐⭐⭐⭐ (MUY ALTO) - Crítico para análisis financiero

---

#### **costo_portal** o **inversion_portal**
**Ubicación**: Tabla `publicacion` o `portal_postulacion`

**Análisis que habilita**:
- ROI real por portal (costo vs resultado)
- Eficiencia de inversión por canal
- Optimización de presupuesto de publicidad

**Valor**: ⭐⭐⭐⭐ (ALTO) - Si se invierte en portales

---

#### **tiempo_respuesta_cliente_promedio** (calculado)
**Ubicación**: Derivado de `fecha_envio` y `fecha_feedback_cliente`

**Análisis que habilita**:
- Clasificación de clientes por velocidad de respuesta
- Impacto de velocidad en satisfacción

**Valor**: ⭐⭐⭐ (MEDIO) - Ya calculable desde datos existentes

---

#### **categoria_cliente** o **segmento_cliente**
**Ubicación**: Tabla `cliente`

**Análisis que habilita**:
- Análisis por segmento (ej: Pyme, Corporativo, Startup)
- Estrategias diferenciadas por segmento

**Valor**: ⭐⭐⭐⭐ (ALTO) - Si se segmenta clientes

---

#### **fuente_cliente** o **origen_cliente**
**Ubicación**: Tabla `cliente`

**Análisis que habilita**:
- Efectividad de canales de adquisición
- ROI de marketing/sales
- Mejores fuentes de clientes

**Valor**: ⭐⭐⭐⭐ (ALTO) - Si se trackea origen

---

### Priorización de Campos a Agregar:

**Prioridad 1 (Agregar cuanto antes)**:
1. ✅ `fecha_creacion_cliente` - Habilitaría análisis completos de ciclo de vida
2. ✅ `fecha_ultima_solicitud_cliente` - Fundamental para churn y retención
3. ✅ `valor_contrato` - Si hay información de valor/monto

**Prioridad 2 (Muy útiles)**:
4. ✅ `fecha_primera_solicitud_cliente` - Para análisis de conversión
5. ✅ `categoria_cliente` - Para segmentación
6. ✅ `fuente_cliente` - Para análisis de adquisición

**Prioridad 3 (Nice to have)**:
7. ✅ `costo_portal` - Si se invierte en publicidad
8. ✅ `fecha_creacion_candidato` - Para análisis de base de candidatos

---

## 🔬 ANÁLISIS ESPECÍFICOS CON CAMPOS ADICIONALES

### Con fecha_creacion_cliente y fecha_ultima_solicitud_cliente

---

## 📊 ANÁLISIS 1: COMPORTAMIENTO DE CLIENTES POR ANTIGÜEDAD

**Pregunta de negocio:**
"¿Los clientes nuevos o antiguos tienen mejor comportamiento (más solicitudes, mayor tasa de éxito)?"

**Análisis de comportamiento por antigüedad del cliente**

```sql
WITH clientes_antiguedad AS (
    SELECT 
        c.id_cliente,
        c.nombre_cliente,
        c.fecha_creacion_cliente,
        c.fecha_ultima_solicitud_cliente,
        -- Calcular antigüedad en meses
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) * 12 + 
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) as meses_antiguedad,
        -- Clasificar por antigüedad
        CASE 
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) < 1 THEN 'Nuevo (0-11 meses)'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) < 2 THEN 'Joven (1-2 años)'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) < 5 THEN 'Establecido (2-5 años)'
            ELSE 'Veterano (5+ años)'
        END as categoria_antiguedad,
        -- Calcular meses desde última solicitud
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_ultima_solicitud_cliente)) * 12 + 
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.fecha_ultima_solicitud_cliente)) as meses_desde_ultima_solicitud
    FROM cliente c
    WHERE c.fecha_creacion_cliente IS NOT NULL
),
solicitudes_cliente AS (
    SELECT 
        ca.id_cliente,
        ca.categoria_antiguedad,
        COUNT(DISTINCT s.id_solicitud) as total_solicitudes,
        COUNT(DISTINCT CASE WHEN s.id_etapa_solicitud = 'completado' THEN s.id_solicitud END) as solicitudes_completadas,
        COUNT(DISTINCT c.id_contratacion) as total_contrataciones,
        AVG(EXTRACT(DAY FROM (s.plazo_maximo_solicitud - s.fecha_ingreso_solicitud))) as duracion_promedio_dias
    FROM clientes_antiguedad ca
    LEFT JOIN solicitud s ON s.id_contacto IN (
        SELECT id_contacto FROM contacto WHERE id_cliente = ca.id_cliente
    )
    LEFT JOIN contratacion c ON c.id_postulacion IN (
        SELECT id_postulacion FROM postulacion WHERE id_solicitud = s.id_solicitud
    )
    GROUP BY ca.id_cliente, ca.categoria_antiguedad
)
SELECT 
    ca.categoria_antiguedad,
    COUNT(DISTINCT ca.id_cliente) as total_clientes,
    -- Métricas de volumen
    ROUND(AVG(sc.total_solicitudes), 2) as solicitudes_promedio,
    SUM(sc.total_solicitudes) as total_solicitudes,
    -- Métricas de éxito
    ROUND(
        SUM(sc.total_contrataciones)::DECIMAL / 
        NULLIF(SUM(sc.total_solicitudes), 0) * 100, 
        2
    ) as tasa_exito_pct,
    -- Métricas de actividad
    ROUND(AVG(ca.meses_desde_ultima_solicitud), 1) as meses_desde_ultima_solicitud_promedio,
    COUNT(DISTINCT CASE WHEN ca.meses_desde_ultima_solicitud > 12 THEN ca.id_cliente END) as clientes_inactivos_12_meses,
    -- Tasa de actividad
    ROUND(
        COUNT(DISTINCT CASE WHEN ca.meses_desde_ultima_solicitud <= 6 THEN ca.id_cliente END)::DECIMAL /
        NULLIF(COUNT(DISTINCT ca.id_cliente), 0) * 100,
        2
    ) as tasa_clientes_activos_6_meses_pct
FROM clientes_antiguedad ca
LEFT JOIN solicitudes_cliente sc ON sc.id_cliente = ca.id_cliente
GROUP BY ca.categoria_antiguedad
ORDER BY 
    CASE ca.categoria_antiguedad
        WHEN 'Nuevo (0-11 meses)' THEN 1
        WHEN 'Joven (1-2 años)' THEN 2
        WHEN 'Establecido (2-5 años)' THEN 3
        ELSE 4
    END;
```

**Resultados esperados:**

| categoria_antiguedad | clientes | solicitudes_promedio | tasa_exito_pct | meses_desde_ultima | inactivos_12m | activos_6m_pct |
|----------------------|----------|----------------------|----------------|--------------------|---------------|----------------|
| Nuevo (0-11 meses) | 45 | 2.3 | 68.5% | 1.2 | 2 | 88.9% ⭐ |
| Joven (1-2 años) | 120 | 4.1 | 72.3% | 2.8 | 15 | 75.0% |
| Establecido (2-5 años) | 85 | 6.2 | 75.8% ⭐ | 4.5 | 18 | 65.0% |
| Veterano (5+ años) | 30 | 8.5 ⭐ | 78.2% ⭐ | 8.2 | 12 | 45.0% |

**Insights:**
- Clientes nuevos tienen alta actividad pero menor volumen total
- Clientes establecidos tienen mejor tasa de éxito
- Veteranos tienen mayor volumen pero menor actividad reciente (riesgo de churn)

---

## 📊 ANÁLISIS 2: TASA DE CONVERSIÓN: CREACIÓN → PRIMERA SOLICITUD

**Pregunta de negocio:**
"¿Cuánto tiempo tardan los clientes en hacer su primera solicitud después de registrarse? ¿Qué % nunca solicita?"

**Análisis de tiempo hasta primera solicitud**

```sql
WITH primera_solicitud AS (
    SELECT 
        c.id_cliente,
        c.nombre_cliente,
        c.fecha_creacion_cliente,
        MIN(s.fecha_ingreso_solicitud) as fecha_primera_solicitud,
        EXTRACT(DAY FROM (MIN(s.fecha_ingreso_solicitud) - c.fecha_creacion_cliente)) as dias_hasta_primera_solicitud
    FROM cliente c
    LEFT JOIN contacto co ON co.id_cliente = c.id_cliente
    LEFT JOIN solicitud s ON s.id_contacto = co.id_contacto
    WHERE c.fecha_creacion_cliente IS NOT NULL
    GROUP BY c.id_cliente, c.nombre_cliente, c.fecha_creacion_cliente
)
SELECT 
    CASE 
        WHEN ps.fecha_primera_solicitud IS NULL THEN 'Nunca solicitó'
        WHEN ps.dias_hasta_primera_solicitud <= 7 THEN 'Inmediato (0-7 días)'
        WHEN ps.dias_hasta_primera_solicitud <= 30 THEN 'Rápido (8-30 días)'
        WHEN ps.dias_hasta_primera_solicitud <= 90 THEN 'Moderado (31-90 días)'
        WHEN ps.dias_hasta_primera_solicitud <= 180 THEN 'Lento (91-180 días)'
        ELSE 'Muy lento (181+ días)'
    END as categoria_conversion,
    COUNT(*) as total_clientes,
    ROUND(COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM primera_solicitud) * 100, 2) as porcentaje_pct,
    ROUND(AVG(ps.dias_hasta_primera_solicitud), 1) as dias_promedio,
    -- Para los que solicitaron, calcular promedio
    ROUND(AVG(CASE WHEN ps.fecha_primera_solicitud IS NOT NULL THEN ps.dias_hasta_primera_solicitud END), 1) as dias_promedio_solicitaron
FROM primera_solicitud ps
GROUP BY 
    CASE 
        WHEN ps.fecha_primera_solicitud IS NULL THEN 'Nunca solicitó'
        WHEN ps.dias_hasta_primera_solicitud <= 7 THEN 'Inmediato (0-7 días)'
        WHEN ps.dias_hasta_primera_solicitud <= 30 THEN 'Rápido (8-30 días)'
        WHEN ps.dias_hasta_primera_solicitud <= 90 THEN 'Moderado (31-90 días)'
        WHEN ps.dias_hasta_primera_solicitud <= 180 THEN 'Lento (91-180 días)'
        ELSE 'Muy lento (181+ días)'
    END
ORDER BY 
    CASE 
        WHEN 'Nunca solicitó' THEN 6
        WHEN 'Inmediato (0-7 días)' THEN 1
        WHEN 'Rápido (8-30 días)' THEN 2
        WHEN 'Moderado (31-90 días)' THEN 3
        WHEN 'Lento (91-180 días)' THEN 4
        ELSE 5
    END;
```

**Resultados esperados:**

| categoria_conversion | clientes | porcentaje_pct | dias_promedio |
|----------------------|-----------|----------------|---------------|
| Inmediato (0-7 días) | 85 | 30.4% ⭐ | 3.2 |
| Rápido (8-30 días) | 95 | 34.0% ⭐ | 18.5 |
| Moderado (31-90 días) | 45 | 16.1% | 58.3 |
| Lento (91-180 días) | 25 | 8.9% | 125.8 |
| Muy lento (181+ días) | 15 | 5.4% | 245.2 |
| Nunca solicitó | 25 | 8.9% | NULL ⚠️ |

**Insights:**
- 64.4% de clientes solicitan en los primeros 30 días (crítico)
- 8.9% nunca solicita (oportunidad de reactivación)
- Clientela con conversión rápida representa mayoría del negocio

---

## 📊 ANÁLISIS 3: CLIENTES EN RIESGO DE CHURN

**Pregunta de negocio:**
"¿Qué clientes están en riesgo de abandonar? ¿Cuáles son las señales tempranas?"

**Análisis de riesgo de churn por antigüedad y actividad**

```sql
WITH clientes_actividad AS (
    SELECT 
        c.id_cliente,
        c.nombre_cliente,
        c.fecha_creacion_cliente,
        c.fecha_ultima_solicitud_cliente,
        -- Antigüedad en meses
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) * 12 + 
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) as meses_antiguedad,
        -- Meses desde última solicitud
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_ultima_solicitud_cliente)) * 12 + 
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.fecha_ultima_solicitud_cliente)) as meses_inactivo,
        -- Historial de solicitudes
        (SELECT COUNT(*) FROM solicitud s 
         JOIN contacto co ON co.id_contacto = s.id_contacto 
         WHERE co.id_cliente = c.id_cliente) as total_solicitudes_historico,
        -- Solicitudes últimos 12 meses
        (SELECT COUNT(*) FROM solicitud s 
         JOIN contacto co ON co.id_contacto = s.id_contacto 
         WHERE co.id_cliente = c.id_cliente 
         AND s.fecha_ingreso_solicitud >= CURRENT_DATE - INTERVAL '12 months') as solicitudes_ultimo_anio,
        -- Tasa de éxito histórica
        (SELECT COUNT(DISTINCT c2.id_contratacion)::DECIMAL / 
                NULLIF(COUNT(DISTINCT s2.id_solicitud), 0) * 100
         FROM solicitud s2
         JOIN contacto co2 ON co2.id_contacto = s2.id_contacto
         LEFT JOIN postulacion p2 ON p2.id_solicitud = s2.id_solicitud
         LEFT JOIN contratacion c2 ON c2.id_postulacion = p2.id_postulacion
         WHERE co2.id_cliente = c.id_cliente) as tasa_exito_historica_pct
    FROM cliente c
    WHERE c.fecha_creacion_cliente IS NOT NULL
    AND c.fecha_ultima_solicitud_cliente IS NOT NULL
)
SELECT 
    CASE 
        WHEN ca.meses_inactivo <= 3 THEN 'Activo (0-3 meses)'
        WHEN ca.meses_inactivo <= 6 THEN 'En observación (4-6 meses)'
        WHEN ca.meses_inactivo <= 12 THEN 'Riesgo bajo (7-12 meses)'
        WHEN ca.meses_inactivo <= 18 THEN 'Riesgo medio (13-18 meses)'
        ELSE 'Riesgo alto (19+ meses) ⚠️'
    END as nivel_riesgo,
    COUNT(*) as total_clientes,
    -- Perfil promedio
    ROUND(AVG(ca.meses_antiguedad), 1) as antiguedad_promedio_meses,
    ROUND(AVG(ca.total_solicitudes_historico), 1) as solicitudes_promedio_historico,
    ROUND(AVG(ca.solicitudes_ultimo_anio), 1) as solicitudes_promedio_ultimo_anio,
    ROUND(AVG(ca.tasa_exito_historica_pct), 1) as tasa_exito_promedio_pct,
    -- Señales de riesgo
    COUNT(CASE WHEN ca.total_solicitudes_historico > 5 AND ca.solicitudes_ultimo_anio = 0 THEN 1 END) as clientes_vip_sin_actividad
FROM clientes_actividad ca
GROUP BY 
    CASE 
        WHEN ca.meses_inactivo <= 3 THEN 'Activo (0-3 meses)'
        WHEN ca.meses_inactivo <= 6 THEN 'En observación (4-6 meses)'
        WHEN ca.meses_inactivo <= 12 THEN 'Riesgo bajo (7-12 meses)'
        WHEN ca.meses_inactivo <= 18 THEN 'Riesgo medio (13-18 meses)'
        ELSE 'Riesgo alto (19+ meses) ⚠️'
    END
ORDER BY 
    CASE 
        WHEN 'Activo (0-3 meses)' THEN 1
        WHEN 'En observación (4-6 meses)' THEN 2
        WHEN 'Riesgo bajo (7-12 meses)' THEN 3
        WHEN 'Riesgo medio (13-18 meses)' THEN 4
        ELSE 5
    END;
```

**Resultados esperados:**

| nivel_riesgo | clientes | antiguedad_prom | solicitudes_hist | solicitudes_año | tasa_exito | vip_inactivos |
|--------------|----------|-----------------|------------------|-----------------|------------|---------------|
| Activo (0-3 meses) | 180 | 24.5 | 6.8 | 3.2 | 72.5% | 0 |
| En observación (4-6 meses) | 45 | 36.2 | 8.5 | 1.1 | 68.3% | 2 |
| Riesgo bajo (7-12 meses) | 35 | 42.8 | 7.2 | 0.3 | 65.1% | 5 |
| Riesgo medio (13-18 meses) | 18 | 55.3 | 9.1 | 0.0 | 70.2% | 8 ⚠️ |
| Riesgo alto (19+ meses) ⚠️ | 12 | 48.5 | 8.8 | 0.0 | 68.5% | 10 ⚠️ |

**Insights:**
- 12 clientes con alto riesgo (19+ meses inactivos)
- 10 de esos son VIP (más de 5 solicitudes históricas) - prioridad alta
- Clientes en riesgo medio tienen buena tasa de éxito histórica - oportunidad de reactivación

---

## 📊 ANÁLISIS 4: EVOLUCIÓN DE COMPORTAMIENTO SEGÚN ANTIGÜEDAD

**Pregunta de negocio:**
"¿Cómo evoluciona el comportamiento de los clientes conforme pasan los años? ¿Mejoran o empeoran?"

**Análisis de tendencia de comportamiento por antigüedad**

```sql
WITH clientes_cohorte AS (
    SELECT 
        c.id_cliente,
        DATE_TRUNC('year', c.fecha_creacion_cliente) as anio_creacion,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_creacion_cliente)) as anos_antiguedad,
        c.fecha_ultima_solicitud_cliente,
        -- Solicitudes año de creación
        (SELECT COUNT(*) FROM solicitud s
         JOIN contacto co ON co.id_contacto = s.id_contacto
         WHERE co.id_cliente = c.id_cliente
         AND DATE_TRUNC('year', s.fecha_ingreso_solicitud) = DATE_TRUNC('year', c.fecha_creacion_cliente)
        ) as solicitudes_anio_creacion,
        -- Solicitudes año actual
        (SELECT COUNT(*) FROM solicitud s
         JOIN contacto co ON co.id_contacto = s.id_contacto
         WHERE co.id_cliente = c.id_cliente
         AND DATE_TRUNC('year', s.fecha_ingreso_solicitud) = DATE_TRUNC('year', CURRENT_DATE)
        ) as solicitudes_anio_actual,
        -- Total histórico
        (SELECT COUNT(*) FROM solicitud s
         JOIN contacto co ON co.id_contacto = s.id_contacto
         WHERE co.id_cliente = c.id_cliente
        ) as total_solicitudes_historico,
        -- Tasa de éxito histórico
        (SELECT COUNT(DISTINCT c2.id_contratacion)::DECIMAL / 
                NULLIF(COUNT(DISTINCT s2.id_solicitud), 0) * 100
         FROM solicitud s2
         JOIN contacto co2 ON co2.id_contacto = s2.id_contacto
         LEFT JOIN postulacion p2 ON p2.id_solicitud = s2.id_solicitud
         LEFT JOIN contratacion c2 ON c2.id_postulacion = p2.id_postulacion
         WHERE co2.id_cliente = c.id_cliente) as tasa_exito_pct
    FROM cliente c
    WHERE c.fecha_creacion_cliente IS NOT NULL
    AND c.fecha_creacion_cliente >= CURRENT_DATE - INTERVAL '5 years' -- Últimos 5 años
)
SELECT 
    cc.anio_creacion as cohorte,
    COUNT(DISTINCT cc.id_cliente) as total_clientes_cohorte,
    -- Comportamiento año de creación
    ROUND(AVG(cc.solicitudes_anio_creacion), 2) as solicitudes_promedio_anio_creacion,
    -- Comportamiento actual
    ROUND(AVG(cc.solicitudes_anio_actual), 2) as solicitudes_promedio_anio_actual,
    ROUND(AVG(cc.total_solicitudes_historico), 2) as solicitudes_promedio_historico,
    ROUND(AVG(cc.tasa_exito_pct), 2) as tasa_exito_promedio_pct,
    -- Clientes activos este año
    COUNT(DISTINCT CASE WHEN cc.solicitudes_anio_actual > 0 THEN cc.id_cliente END) as clientes_activos_anio_actual,
    ROUND(
        COUNT(DISTINCT CASE WHEN cc.solicitudes_anio_actual > 0 THEN cc.id_cliente END)::DECIMAL /
        NULLIF(COUNT(DISTINCT cc.id_cliente), 0) * 100,
        2
    ) as tasa_actividad_anio_actual_pct
FROM clientes_cohorte cc
GROUP BY cc.anio_creacion
ORDER BY cc.anio_creacion DESC;
```

**Resultados esperados:**

| cohorte | clientes | solicitudes_creacion | solicitudes_actual | solicitudes_hist | tasa_exito | activos_actual_pct |
|---------|----------|----------------------|-------------------|------------------|------------|-------------------|
| 2024 | 45 | 2.3 | 2.1 | 2.3 | 68.5% | 88.9% ⭐ |
| 2023 | 38 | 3.1 | 1.8 | 5.2 | 72.3% | 76.3% |
| 2022 | 32 | 2.8 | 0.9 | 8.5 | 75.8% | 59.4% |
| 2021 | 28 | 3.2 | 0.4 | 12.1 | 78.2% | 42.9% |
| 2020 | 25 | 2.9 | 0.2 | 15.3 | 80.1% | 28.0% |

**Insights:**
- Clientes nuevos (2024) tienen alta actividad y tasa de actividad (88.9%)
- Cohortes más antiguas muestran caída en actividad pero mantienen alta tasa de éxito
- Cohortes de 2020-2021 tienen baja actividad actual (oportunidad de reactivación)

---

## 📊 ANÁLISIS 5: PERFIL DE CLIENTES DORMIDOS (NUNCA SOLICITARON)

**Pregunta de negocio:**
"¿Qué clientes fueron creados pero nunca solicitaron un servicio? ¿Cuánto tiempo llevan sin actividad?"

**Análisis de clientes inactivos desde creación**

```sql
SELECT 
    CASE 
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 30 THEN 'Reciente (0-30 días)'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 90 THEN 'Nuevo (31-90 días)'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 180 THEN 'Inactivo (91-180 días)'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 365 THEN 'Inactivo (6-12 meses)'
        ELSE 'Muy inactivo (1+ año) ⚠️'
    END as categoria_inactividad,
    COUNT(*) as total_clientes,
    ROUND(AVG(EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente))), 1) as dias_promedio_inactivos,
    MIN(EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente))) as dias_minimo,
    MAX(EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente))) as dias_maximo
FROM cliente c
WHERE c.fecha_creacion_cliente IS NOT NULL
AND c.fecha_ultima_solicitud_cliente IS NULL -- Nunca ha solicitado
GROUP BY 
    CASE 
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 30 THEN 'Reciente (0-30 días)'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 90 THEN 'Nuevo (31-90 días)'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 180 THEN 'Inactivo (91-180 días)'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - c.fecha_creacion_cliente)) <= 365 THEN 'Inactivo (6-12 meses)'
        ELSE 'Muy inactivo (1+ año) ⚠️'
    END
ORDER BY 
    CASE 
        WHEN 'Reciente (0-30 días)' THEN 1
        WHEN 'Nuevo (31-90 días)' THEN 2
        WHEN 'Inactivo (91-180 días)' THEN 3
        WHEN 'Inactivo (6-12 meses)' THEN 4
        ELSE 5
    END;
```

**Resultados esperados:**

| categoria_inactividad | clientes | dias_promedio | dias_min | dias_max |
|-----------------------|----------|---------------|----------|----------|
| Reciente (0-30 días) | 15 | 12.5 | 2 | 28 |
| Nuevo (31-90 días) | 8 | 58.3 | 35 | 85 |
| Inactivo (91-180 días) | 5 | 125.4 | 95 | 165 |
| Inactivo (6-12 meses) | 4 | 285.2 | 195 | 340 |
| Muy inactivo (1+ año) ⚠️ | 3 | 485.7 | 380 | 620 |

**Insights:**
- 32 clientes nunca han solicitado (oportunidad de reactivación)
- 7 clientes llevan más de 6 meses sin actividad (prioridad media)
- 3 clientes muy antiguos sin actividad (investigar si son válidos o eliminar)

---

## 🎯 RESUMEN DE ANÁLISIS HABILITADOS

Con `fecha_creacion_cliente` y `fecha_ultima_solicitud_cliente` puedes hacer:

1. ✅ **Análisis de ciclo de vida completo** del cliente
2. ✅ **Detección temprana de churn** (clientes en riesgo)
3. ✅ **Análisis de cohortes** (comportamiento por año de creación)
4. ✅ **Medición de conversión** (tiempo hasta primera solicitud)
5. ✅ **Segmentación por antigüedad** (nuevos, jóvenes, establecidos, veteranos)
6. ✅ **Identificación de clientes dormidos** (nunca solicitaron)
7. ✅ **Evolución temporal** del comportamiento por antigüedad
8. ✅ **Priorización de reactivación** (clientes VIP en riesgo)

**Valor estratégico**: ⭐⭐⭐⭐⭐ Muy alto - Fundamental para retención y crecimiento

---

*Este módulo transforma datos históricos en decisiones informadas y acciones concretas.*
