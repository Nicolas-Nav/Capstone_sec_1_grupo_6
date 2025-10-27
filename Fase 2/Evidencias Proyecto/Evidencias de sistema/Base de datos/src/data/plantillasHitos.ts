/**
 * Plantillas de hitos para cada tipo de servicio
 * NOTA: Los días hábiles están sujetos a cambios después de reunión
 */

export type TipoAncla = 
  | 'inicio_proceso'
  | 'publicacion'
  | 'primera_presentacion'
  | 'feedback_cliente'
  | 'evaluacion_psicolaboral'
  | 'entrevista'
  | 'test_psicolaboral'
  | 'contratacion'
  | 'filtro_inteligente'
  | 'publicacion_portales'
  | 'evaluacion_potencial';

export interface PlantillaHito {
    nombre_hito: string;
    tipo_ancla: TipoAncla;
    duracion_dias: number;
    avisar_antes_dias: number;
    descripcion: string;
    codigo_servicio: string;
}

export const PLANTILLAS_HITOS: Record<string, PlantillaHito[]> = {
    // PROCESO COMPLETO (PC) - 15 días hábiles
    PC: [
        {
            nombre_hito: "Descripción de cargo",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 0,
            avisar_antes_dias: 0,
            descripcion: "Procesar descripción de cargo subida",
            codigo_servicio: "PC"
        },
        {
            nombre_hito: "Presentación candidatos",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 5,
            avisar_antes_dias: 2,
            descripcion: "Faltan 2 días para la presentación de candidatos a cliente",
            codigo_servicio: "PC"
        },
        {
            nombre_hito: "Presentación candidatos",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 5,
            avisar_antes_dias: 1,
            descripcion: "Falta 1 día para la presentación de candidatos a cliente",
            codigo_servicio: "PC"
        },
        {
            nombre_hito: "Presentación candidatos",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 5,
            avisar_antes_dias: 0,
            descripcion: "Debe mandarse hoy la presentación de candidatos a cliente",
            codigo_servicio: "PC"
        },
        {
            nombre_hito: "Esperar feedback del cliente",
            tipo_ancla: 'primera_presentacion',
            duracion_dias: 2,
            avisar_antes_dias: 1,
            descripcion: "Faltan 1 día para recibir feedback del cliente",
            codigo_servicio: "PC"
        },
        {
            nombre_hito: "Evaluación psicolaboral (Módulo 4)",
            tipo_ancla: 'feedback_cliente',
            duracion_dias: 5,
            avisar_antes_dias: 2,
            descripcion: "Faltan 2 días para completar evaluaciones",
            codigo_servicio: "PC"
        },
        {
            nombre_hito: "Presentar terna final",
            tipo_ancla: 'evaluacion_psicolaboral',
            duracion_dias: 2,
            avisar_antes_dias: 1,
            descripcion: "Faltan 1 día para presentar terna final",
            codigo_servicio: "PC"
        }
    ],

    // HEADHUNTING (HH) - 25 días hábiles
    HH: [
        {
            nombre_hito: "Descripción de cargo",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 0,
            avisar_antes_dias: 0,
            descripcion: "Procesar descripción de cargo subida",
            codigo_servicio: "HH"
        },
        {
            nombre_hito: "Búsqueda dirigida",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 15,
            avisar_antes_dias: 2,
            descripcion: "Faltan 2 días para completar búsqueda dirigida",
            codigo_servicio: "HH"
        },
        {
            nombre_hito: "Búsqueda dirigida",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 15,
            avisar_antes_dias: 1,
            descripcion: "Falta 1 día para completar búsqueda dirigida",
            codigo_servicio: "HH"
        },
        {
            nombre_hito: "Búsqueda dirigida",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 15,
            avisar_antes_dias: 0,
            descripcion: "Debe completarse hoy la búsqueda dirigida",
            codigo_servicio: "HH"
        },
        {
            nombre_hito: "Esperar feedback del cliente",
            tipo_ancla: 'primera_presentacion',
            duracion_dias: 5,
            avisar_antes_dias: 1,
            descripcion: "Faltan 1 día para recibir feedback",
            codigo_servicio: "HH"
        },
        {
            nombre_hito: "Presentar terna final",
            tipo_ancla: 'feedback_cliente',
            duracion_dias: 5,
            avisar_antes_dias: 2,
            descripcion: "Faltan 2 días para terna final",
            codigo_servicio: "HH"
        }
    ],

    // LONG LIST (LL) - 10 días hábiles
    LL: [
        {
            nombre_hito: "Descripción de cargo",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 0,
            avisar_antes_dias: 0,
            descripcion: "Procesar descripción de cargo subida",
            codigo_servicio: "LL"
        },
        {
            nombre_hito: "Crear lista larga",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 7,
            avisar_antes_dias: 2,
            descripcion: "Faltan 2 días para completar lista larga",
            codigo_servicio: "LL"
        },
        {
            nombre_hito: "Crear lista larga",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 7,
            avisar_antes_dias: 1,
            descripcion: "Falta 1 día para completar lista larga",
            codigo_servicio: "LL"
        },
        {
            nombre_hito: "Crear lista larga",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 7,
            avisar_antes_dias: 0,
            descripcion: "Debe completarse hoy la lista larga",
            codigo_servicio: "LL"
        }
    ],

    // TARGET RECRUITMENT (TR) - 10 días hábiles
    TR: [
        {
            nombre_hito: "Descripción de cargo",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 0,
            avisar_antes_dias: 0,
            descripcion: "Procesar descripción de cargo subida",
            codigo_servicio: "TR"
        },
        {
            nombre_hito: "Publicar en portales (Módulo 2)",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 2,
            avisar_antes_dias: 1,
            descripcion: "Faltan 1 día para publicar en portales",
            codigo_servicio: "TR"
        },
        {
            nombre_hito: "Primera presentación (Módulo 3)",
            tipo_ancla: 'publicacion',
            duracion_dias: 5,
            avisar_antes_dias: 2,
            descripcion: "Faltan 2 días para primera presentación",
            codigo_servicio: "TR"
        },
        {
            nombre_hito: "Esperar feedback del cliente",
            tipo_ancla: 'primera_presentacion',
            duracion_dias: 2,
            avisar_antes_dias: 1,
            descripcion: "Faltan 1 día para recibir feedback",
            codigo_servicio: "TR"
        },
        {
            nombre_hito: "Presentar terna final",
            tipo_ancla: 'feedback_cliente',
            duracion_dias: 3,
            avisar_antes_dias: 1,
            descripcion: "Faltan 1 día para presentar terna final",
            codigo_servicio: "TR"
        }
    ],

    // SERVICIOS SIMPLES
    AO: [{
        nombre_hito: "Procesar filtro inteligente",
        tipo_ancla: 'filtro_inteligente',
        duracion_dias: 5,
        avisar_antes_dias: 1,
        descripcion: "Faltan 1 día para completar filtro inteligente",
        codigo_servicio: "AO"
    }],

    PP: [{
        nombre_hito: "Publicar en portales",
        tipo_ancla: 'publicacion_portales',
        duracion_dias: 5,
        avisar_antes_dias: 1,
        descripcion: "Faltan 1 día para completar publicación",
        codigo_servicio: "PP"
    }],

    ES: [
        {
            nombre_hito: "Descripción de cargo",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 0,
            avisar_antes_dias: 0,
            descripcion: "Procesar descripción de cargo subida",
            codigo_servicio: "ES"
        },
        {
            nombre_hito: "Completar evaluación psicolaboral",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 2,
            avisar_antes_dias: 1,
            descripcion: "Faltan 1 día para completar evaluación",
            codigo_servicio: "ES"
        }
    ],

    AP: [{
        nombre_hito: "Completar evaluación de potencial",
        tipo_ancla: 'evaluacion_potencial',
        duracion_dias: 4,
        avisar_antes_dias: 1,
        descripcion: "Faltan 1 día para completar evaluación",
        codigo_servicio: "AP"
    }],

    TS: [
        {
            nombre_hito: "Descripción de cargo",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 0,
            avisar_antes_dias: 0,
            descripcion: "Procesar descripción de cargo subida",
            codigo_servicio: "TS"
        },
        {
            nombre_hito: "Procesar test psicolaboral",
            tipo_ancla: 'inicio_proceso',
            duracion_dias: 1,
            avisar_antes_dias: 0,
            descripcion: "Debe completarse hoy el test",
            codigo_servicio: "TS"
        }
    ]
};

/**
 * Obtiene las plantillas para un código de servicio específico
 * @param codigoServicio - Código del servicio (PC, HH, LL, etc.)
 * @returns Array de plantillas de hitos
 */
export function obtenerPlantillasPorServicio(codigoServicio: string): PlantillaHito[] {
    return PLANTILLAS_HITOS[codigoServicio] || [];
}

/**
 * Obtiene todos los códigos de servicio disponibles
 * @returns Array de códigos de servicio
 */
export function obtenerCodigosServicio(): string[] {
    return Object.keys(PLANTILLAS_HITOS);
}

/**
 * Valida si un código de servicio tiene plantillas definidas
 * @param codigoServicio - Código del servicio a validar
 * @returns true si tiene plantillas, false si no
 */
export function tienePlantillas(codigoServicio: string): boolean {
    return codigoServicio in PLANTILLAS_HITOS && PLANTILLAS_HITOS[codigoServicio].length > 0;
}
