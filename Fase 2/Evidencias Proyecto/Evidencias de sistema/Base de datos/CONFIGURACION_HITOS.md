# Sistema de Hitos y Alertas - Configuración Actualizada

## Resumen de Hitos por Tipo de Proceso

### 1. **Proceso Completo** (15 días hábiles aprox)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Publicación de cargo | Inicio proceso | 1 día hábil | 0 días |
| 2 | Presentación de terna inicial | Hito anterior | 5 días hábiles | 2 días |
| 3 | Entrevistas con candidatos aprobados | Hito anterior | 5 días hábiles | 2 días |
| 4 | Presentación de terna final con informe | Hito anterior | 10 días hábiles | 5, 3, 1, 0 días |

**Total: ~21 días hábiles**

---

### 2. **Hunting** (30 días hábiles aprox)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Publicación de cargo | Inicio proceso | 1 día hábil | 0 días |
| 2 | Presentación de terna inicial | Hito anterior | 15 días hábiles | 5 días |
| 3 | Entrevistas con candidatos aprobados | Hito anterior | 5 días hábiles | 2 días |
| 4 | Presentación de terna final con informe | Hito anterior | 5 días hábiles | 5, 3, 1, 0 días |

**Total: ~26 días hábiles**

---

### 3. **Evaluación Psicolaboral y Remota** (2 días hábiles)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Agendar entrevista | Inicio proceso | 4 horas (mismo día) | 0 |
| 2 | Envío de informe | Fecha de entrevista | 2 días hábiles | 1 día |

**Ejemplo:** Si la entrevista es viernes → Informe el martes

---

### 4. **Evaluación Potencial** (4 días hábiles)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Agendar entrevista | Inicio proceso | 4 horas (mismo día) | 0 |
| 2 | Envío de informe | Fecha de entrevista | 4 días hábiles | 2 días |

**Ejemplo:** Si la entrevista es viernes → Informe el jueves

---

### 5. **Test Psicolaboral** (1 día hábil)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Agendar test | Inicio proceso | 4 horas (mismo día) | 0 |
| 2 | Entrega de resultado | Fecha de aplicación | 1 día hábil | 0 |

---

### 6. **Long List** (10 días hábiles)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Publicación de cargo | Inicio proceso | 1 día hábil | 0 |
| 2 | Presentación de candidatos | Hito anterior | 10 días hábiles | 5, 3, 2, 1, 0 días |

**Alertas progresivas:** Día 5, Día 3, Día 2, Día 1, El mismo día

---

### 7. **Filtro Inteligente** (8 días hábiles)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Publicación de cargo | Inicio proceso | 1 día hábil | 0 |
| 2 | Presentación de candidatos | Hito anterior | 8 días hábiles | 5, 3, 2, 1, 0 días |

**Alertas progresivas:** Día 5, Día 3, Día 2, Día 1, El mismo día

---

### 8. **Target Recruitment** (10 días hábiles - proceso abierto)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Publicación de cargo | Inicio proceso | 1 día hábil | 0 |
| 2 | Presentación de terna final con informe | Hito anterior | 10 días hábiles | 5, 3, 1, 0 días |

**Nota:** Este proceso queda siempre abierto

---

### 9. **Publicación en Portales** (5 días hábiles)

| # | Hito | Inicio | Duración | Avisar antes |
|---|------|--------|----------|--------------|
| 1 | Publicación de cargo | Inicio proceso | 1 día hábil | 0 |
| 2 | Entrega de perfiles y cierre | Hito anterior | 5 días hábiles | 2 días |

---

## Códigos de Servicio en Base de Datos

```sql
'COMPLETO'          -- Proceso completo
'HUNTING'           -- Hunting
'EVAL_PSICO'        -- Evaluación psicolaboral y remota
'EVAL_POTENCIAL'    -- Evaluación potencial
'TEST_PSICO'        -- Test psicolaboral
'LONGLIST'          -- Long list
'FILTRO_INTELIGENTE' -- Filtro inteligente
'TARGET'            -- Target recruitment
'PUBLICACION'       -- Publicación en portales
```

---

## Sistema de Alertas Progresivas

### Funcionamiento:

Para hitos con múltiples avisos (ej: avisar a los 5, 3, 2, 1 día y el mismo día), el sistema:

1. **Frontend calcula** qué alerta mostrar según días restantes
2. **Backend proporciona** `avisar_antes_dias` (máximo)
3. **Vista de alertas** filtra según urgencia

### Ejemplo: Long List - Presentación de candidatos

```
Fecha límite: 20/11/2025
Avisar antes: 5 días

Día 15/11 (5 días antes):  "Faltan 5 días para presentación" [INFO]
Día 17/11 (3 días antes):  "Faltan 3 días para presentación" [INFO]
Día 18/11 (2 días antes):  "Faltan 2 días para presentación" [WARNING]
Día 19/11 (1 día antes):   "Falta 1 día para presentación"   [WARNING]
Día 20/11 (el mismo día):  "Vence HOY: presentación"          [URGENT]
Día 21/11 (vencido):       "Vencido hace 1 día"               [CRITICAL]
```

---

## Tipos de Ancla

- `'inicio_proceso'`: Se calcula desde fecha de creación de solicitud
- `'hito_anterior'`: Se calcula desde fecha_limite del hito anterior
- `'fecha_evaluacion'`: Se calcula desde fecha de la entrevista/evaluación

---

## Instalación

### 1. Ejecutar plantillas de hitos:
```bash
psql -U usuario -d base_datos -f database/seeds/hitos_plantillas.sql
```

### 2. Ejecutar funciones de alertas:
```bash
psql -U usuario -d base_datos -f database/functions/alertas_progresivas.sql
```

### 3. Verificar instalación:
```sql
-- Ver plantillas creadas
SELECT codigo_servicio, COUNT(*) as total_hitos
FROM hito_solicitud
WHERE id_solicitud IS NULL
GROUP BY codigo_servicio;

-- Ver vistas creadas
SELECT table_name 
FROM information_schema.views 
WHERE table_name LIKE 'v_alertas%';
```

---

## Consultas Útiles

### Ver alertas activas:
```sql
SELECT * FROM v_alertas_hitos
ORDER BY nivel_urgencia DESC, dias_restantes ASC;
```

### Ver alertas por consultor:
```sql
SELECT * FROM v_alertas_por_consultor
ORDER BY alertas_vencidas DESC;
```

### Obtener alerta relevante para un hito:
```sql
SELECT * FROM obtener_alerta_relevante('2025-11-20'::DATE, 5);
```

---

## Integración con Frontend

### Endpoint recomendado:
```typescript
GET /api/alertas
GET /api/alertas/consultor/:rut
GET /api/hitos/:id_solicitud

Response:
{
  id_hito_solicitud: number,
  nombre_hito: string,
  fecha_limite: Date,
  dias_restantes: number,
  mensaje_alerta: string,
  nivel_urgencia: 'normal' | 'info' | 'warning' | 'urgent' | 'critical'
}
```

---

## Manejo de Casos Especiales

### Hitos de 4 horas (Agendar entrevista):
- **Backend:** `duracion_dias = 0`
- **Lógica:** Se debe agendar el mismo día del ingreso
- **Alert:** Se muestra inmediatamente al crear la solicitud

### Target Recruitment (siempre abierto):
- No se cierra automáticamente al vencer
- Queda abierto para seguir recibiendo candidatos
- Dura 10 días hábiles pero puede extenderse

---

## Notas Importantes

1. **Días hábiles:** Todos los cálculos excluyen sábados, domingos y feriados chilenos
2. **Alertas progresivas:** Se calculan en tiempo real en el frontend
3. **Completar hito:** Al marcar `fecha_cumplimiento`, el hito deja de generar alertas
4. **Encadenamiento:** Los hitos con `tipo_ancla='hito_anterior'` se calculan desde el hito previo

---

## Contacto de Soporte

Para dudas sobre la configuración de hitos, contactar al equipo de desarrollo.

