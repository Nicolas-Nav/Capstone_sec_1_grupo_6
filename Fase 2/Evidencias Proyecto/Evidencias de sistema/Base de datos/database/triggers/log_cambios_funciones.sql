-- ===========================================
-- FUNCIONES PARA GENERAR DETALLE_CAMBIO AUTOMÁTICO
-- ===========================================

-- Función genérica para generar detalle de cambio para INSERT
CREATE OR REPLACE FUNCTION generar_detalle_insert(
    p_tabla TEXT,
    p_nombre_campo TEXT,
    p_valor TEXT
) RETURNS TEXT AS $$
BEGIN
    -- Obtener nombre legible de la tabla
    CASE p_tabla
        WHEN 'solicitud' THEN
            RETURN 'Nueva solicitud creada';
        WHEN 'hito_solicitud' THEN
            RETURN 'Hito "' || p_valor || '" creado';
        WHEN 'usuario' THEN
            RETURN 'Usuario "' || p_valor || '" creado';
        WHEN 'cliente' THEN
            RETURN 'Cliente "' || p_valor || '" creado';
        WHEN 'contacto' THEN
            RETURN 'Contacto "' || p_valor || '" creado';
        WHEN 'candidato' THEN
            RETURN 'Candidato "' || p_valor || '" creado';
        WHEN 'postulacion' THEN
            RETURN 'Postulación creada';
        WHEN 'descripcion_cargo' THEN
            RETURN 'Descripción de cargo creada';
        WHEN 'publicacion' THEN
            RETURN 'Publicación creada';
        WHEN 'contratacion' THEN
            RETURN 'Contratación creada';
        ELSE
            RETURN 'Registro creado en ' || p_tabla;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función genérica para generar detalle de cambio para UPDATE
CREATE OR REPLACE FUNCTION generar_detalle_update(
    p_tabla TEXT,
    p_campos_cambiados TEXT[]
) RETURNS TEXT AS $$
DECLARE
    v_detalle TEXT := '';
    v_campo TEXT;
BEGIN
    -- Para cada campo cambiado, agregar descripción
    FOREACH v_campo IN ARRAY p_campos_cambiados
    LOOP
        IF v_detalle != '' THEN
            v_detalle := v_detalle || ', ';
        END IF;
        
        -- Descripciones específicas por campo y tabla
        CASE p_tabla
            WHEN 'solicitud' THEN
                CASE v_campo
                    WHEN 'id_etapa_solicitud' THEN
                        v_detalle := v_detalle || 'Etapa actualizada';
                    WHEN 'plazo_maximo_solicitud' THEN
                        v_detalle := v_detalle || 'Plazo máximo modificado';
                    WHEN 'codigo_servicio' THEN
                        v_detalle := v_detalle || 'Tipo de servicio cambiado';
                    WHEN 'rut_usuario' THEN
                        v_detalle := v_detalle || 'Consultor asignado modificado';
                    ELSE
                        v_detalle := v_detalle || 'Campo ' || v_campo || ' actualizado';
                END CASE;
                
            WHEN 'hito_solicitud' THEN
                CASE v_campo
                    WHEN 'fecha_base' THEN
                        v_detalle := v_detalle || 'Fecha de inicio establecida';
                    WHEN 'fecha_limite' THEN
                        v_detalle := v_detalle || 'Fecha límite modificada';
                    WHEN 'fecha_cumplimiento' THEN
                        v_detalle := v_detalle || 'Hito completado';
                    WHEN 'nombre_hito' THEN
                        v_detalle := v_detalle || 'Nombre del hito modificado';
                    WHEN 'duracion_dias' THEN
                        v_detalle := v_detalle || 'Duración modificada';
                    ELSE
                        v_detalle := v_detalle || 'Campo ' || v_campo || ' actualizado';
                END CASE;
                
            WHEN 'usuario' THEN
                CASE v_campo
                    WHEN 'estado_usuario' THEN
                        v_detalle := v_detalle || 'Estado del usuario cambiado';
                    WHEN 'rol_usuario' THEN
                        v_detalle := v_detalle || 'Rol del usuario modificado';
                    WHEN 'nombre_usuario' THEN
                        v_detalle := v_detalle || 'Nombre actualizado';
                    ELSE
                        v_detalle := v_detalle || 'Campo ' || v_campo || ' actualizado';
                END CASE;
                
            WHEN 'cliente' THEN
                CASE v_campo
                    WHEN 'nombre_cliente' THEN
                        v_detalle := v_detalle || 'Nombre del cliente modificado';
                    ELSE
                        v_detalle := v_detalle || 'Campo ' || v_campo || ' actualizado';
                END CASE;
                
            WHEN 'contacto' THEN
                CASE v_campo
                    WHEN 'nombre_contacto' THEN
                        v_detalle := v_detalle || 'Nombre del contacto modificado';
                    WHEN 'email_contacto' THEN
                        v_detalle := v_detalle || 'Email actualizado';
                    WHEN 'telefono_contacto' THEN
                        v_detalle := v_detalle || 'Teléfono actualizado';
                    ELSE
                        v_detalle := v_detalle || 'Campo ' || v_campo || ' actualizado';
                END CASE;
                
            WHEN 'candidato' THEN
                CASE v_campo
                    WHEN 'nombre_candidato' THEN
                        v_detalle := v_detalle || 'Nombre del candidato modificado';
                    WHEN 'email_candidato' THEN
                        v_detalle := v_detalle || 'Email del candidato actualizado';
                    ELSE
                        v_detalle := v_detalle || 'Campo ' || v_campo || ' actualizado';
                END CASE;
                
            WHEN 'postulacion' THEN
                CASE v_campo
                    WHEN 'motivacion' THEN
                        v_detalle := v_detalle || 'Motivación actualizada';
                    WHEN 'expectativa_renta' THEN
                        v_detalle := v_detalle || 'Expectativa de renta modificada';
                    WHEN 'disponibilidad_postulacion' THEN
                        v_detalle := v_detalle || 'Disponibilidad actualizada';
                    ELSE
                        v_detalle := v_detalle || 'Campo ' || v_campo || ' actualizado';
                END CASE;
                
            ELSE
                -- Tabla genérica
                IF array_length(p_campos_cambiados, 1) = 1 THEN
                    v_detalle := 'Campo ' || v_campo || ' actualizado';
                ELSE
                    v_detalle := array_length(p_campos_cambiados, 1)::TEXT || ' campos actualizados';
                    RETURN v_detalle;
                END IF;
        END CASE;
    END LOOP;
    
    RETURN v_detalle;
END;
$$ LANGUAGE plpgsql;

-- Función específica para detectar campos cambiados en UPDATE
CREATE OR REPLACE FUNCTION obtener_campos_cambiados(
    p_record_new RECORD,
    p_record_old RECORD
) RETURNS TEXT[] AS $$
DECLARE
    v_campos TEXT[] := ARRAY[]::TEXT[];
    v_field TEXT;
    v_value_new TEXT;
    v_value_old TEXT;
BEGIN
    -- Iterar sobre todas las columnas del registro
    FOR v_field IN SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name = quote_ident(TG_TABLE_NAME::TEXT)
                   AND table_schema = TG_TABLE_SCHEMA::TEXT
    LOOP
        -- Obtener valores usando dynamic SQL (simplificado)
        -- En PostgreSQL, usar hstore o jsonb para comparar
        EXECUTE format('SELECT ($1).%I, ($2).%I', v_field, v_field)
        INTO v_value_new, v_value_old
        USING p_record_new, p_record_old;
        
        -- Comparar valores (considerando NULL)
        IF (v_value_new IS DISTINCT FROM v_value_old) THEN
            v_campos := array_append(v_campos, v_field);
        END IF;
    END LOOP;
    
    RETURN v_campos;
END;
$$ LANGUAGE plpgsql;

-- Función genérica para generar detalle de cambio para DELETE
CREATE OR REPLACE FUNCTION generar_detalle_delete(
    p_tabla TEXT,
    p_identificador TEXT
) RETURNS TEXT AS $$
BEGIN
    CASE p_tabla
        WHEN 'solicitud' THEN
            RETURN 'Solicitud eliminada';
        WHEN 'hito_solicitud' THEN
            RETURN 'Hito "' || p_identificador || '" eliminado';
        WHEN 'usuario' THEN
            RETURN 'Usuario "' || p_identificador || '" eliminado';
        WHEN 'cliente' THEN
            RETURN 'Cliente "' || p_identificador || '" eliminado';
        WHEN 'contacto' THEN
            RETURN 'Contacto "' || p_identificador || '" eliminado';
        WHEN 'candidato' THEN
            RETURN 'Candidato "' || p_identificador || '" eliminado';
        WHEN 'postulacion' THEN
            RETURN 'Postulación eliminada';
        ELSE
            RETURN 'Registro eliminado de ' || p_tabla;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada y simplificada para generar detalle (versión más práctica)
CREATE OR REPLACE FUNCTION generar_detalle_cambio_automatico(
    p_tabla TEXT,
    p_accion TEXT,
    p_record_new RECORD DEFAULT NULL,
    p_record_old RECORD DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_detalle TEXT := '';
    v_id_registro TEXT;
    v_nombre_registro TEXT := '';
BEGIN
    -- Obtener ID del registro
    IF p_record_new IS NOT NULL THEN
        EXECUTE format('SELECT (%s).id_%s::TEXT', quote_literal(p_record_new), p_tabla) INTO v_id_registro;
        -- Intentar obtener nombre identificable
        CASE p_tabla
            WHEN 'solicitud' THEN
                EXECUTE format('SELECT ''Solicitud #'' || (%s).id_solicitud::TEXT', quote_literal(p_record_new)) INTO v_nombre_registro;
            WHEN 'usuario' THEN
                EXECUTE format('SELECT COALESCE((%s).nombre_usuario, ''Usuario #'' || (%s).rut_usuario)', quote_literal(p_record_new), quote_literal(p_record_new)) INTO v_nombre_registro;
            WHEN 'cliente' THEN
                EXECUTE format('SELECT (%s).nombre_cliente::TEXT', quote_literal(p_record_new)) INTO v_nombre_registro;
            WHEN 'contacto' THEN
                EXECUTE format('SELECT (%s).nombre_contacto::TEXT', quote_literal(p_record_new)) INTO v_nombre_registro;
            WHEN 'hito_solicitud' THEN
                EXECUTE format('SELECT (%s).nombre_hito::TEXT', quote_literal(p_record_new)) INTO v_nombre_registro;
            WHEN 'candidato' THEN
                EXECUTE format('SELECT (%s).nombre_candidato || '' '' || COALESCE((%s).primer_apellido_candidato, '''')', quote_literal(p_record_new), quote_literal(p_record_new)) INTO v_nombre_registro;
            WHEN 'postulacion' THEN
                EXECUTE format('SELECT (%s).id_postulacion::TEXT', quote_literal(p_record_new)) INTO v_nombre_registro;
        END CASE;
    ELSIF p_record_old IS NOT NULL THEN
        EXECUTE format('SELECT (%s).id_%s::TEXT', quote_literal(p_record_old), p_tabla) INTO v_id_registro;
    END IF;
    
    -- Generar mensaje según acción
    CASE p_accion
        WHEN 'INSERT' THEN
            CASE p_tabla
                WHEN 'solicitud' THEN
                    v_detalle := 'Nueva solicitud creada';
                WHEN 'hito_solicitud' THEN
                    v_detalle := 'Hito "' || COALESCE(v_nombre_registro, 'nuevo') || '" creado';
                WHEN 'usuario' THEN
                    v_detalle := 'Usuario "' || COALESCE(v_nombre_registro, 'nuevo') || '" creado';
                WHEN 'cliente' THEN
                    v_detalle := 'Cliente "' || COALESCE(v_nombre_registro, 'nuevo') || '" creado';
                WHEN 'contacto' THEN
                    v_detalle := 'Contacto "' || COALESCE(v_nombre_registro, 'nuevo') || '" creado';
                WHEN 'candidato' THEN
                    v_detalle := 'Candidato "' || COALESCE(v_nombre_registro, 'nuevo') || '" creado';
                WHEN 'postulacion' THEN
                    v_detalle := 'Nueva postulación #' || COALESCE(v_nombre_registro, 'nuevo') || ' creada';
                ELSE
                    v_detalle := 'Registro creado en ' || p_tabla;
            END CASE;
            
        WHEN 'UPDATE' THEN
            -- Detectar campos específicos importantes que cambiaron
            IF p_record_old IS NOT NULL AND p_record_new IS NOT NULL THEN
                CASE p_tabla
                    WHEN 'solicitud' THEN
                        IF (p_record_old.id_etapa_solicitud IS DISTINCT FROM p_record_new.id_etapa_solicitud) THEN
                            v_detalle := 'Etapa de solicitud modificada';
                        ELSIF (p_record_old.plazo_maximo_solicitud IS DISTINCT FROM p_record_new.plazo_maximo_solicitud) THEN
                            v_detalle := 'Plazo máximo modificado';
                        ELSIF (p_record_old.rut_usuario IS DISTINCT FROM p_record_new.rut_usuario) THEN
                            v_detalle := 'Consultor asignado modificado';
                        ELSE
                            v_detalle := 'Datos de solicitud actualizados';
                        END IF;
                        
                    WHEN 'hito_solicitud' THEN
                        IF (p_record_old.fecha_cumplimiento IS DISTINCT FROM p_record_new.fecha_cumplimiento) 
                           AND p_record_new.fecha_cumplimiento IS NOT NULL THEN
                            v_detalle := 'Hito "' || COALESCE(v_nombre_registro, '') || '" completado';
                        ELSIF (p_record_old.fecha_limite IS DISTINCT FROM p_record_new.fecha_limite) THEN
                            v_detalle := 'Fecha límite del hito modificada';
                        ELSIF (p_record_old.fecha_base IS DISTINCT FROM p_record_new.fecha_base) 
                              AND p_record_new.fecha_base IS NOT NULL THEN
                            v_detalle := 'Hito "' || COALESCE(v_nombre_registro, '') || '" activado';
                        ELSE
                            v_detalle := 'Hito "' || COALESCE(v_nombre_registro, '') || '" actualizado';
                        END IF;
                        
                    WHEN 'usuario' THEN
                        IF (p_record_old.estado_usuario IS DISTINCT FROM p_record_new.estado_usuario) THEN
                            v_detalle := 'Estado del usuario modificado';
                        ELSIF (p_record_old.rol_usuario IS DISTINCT FROM p_record_new.rol_usuario) THEN
                            v_detalle := 'Rol del usuario modificado';
                        ELSE
                            v_detalle := 'Datos del usuario actualizados';
                        END IF;
                        
                    WHEN 'postulacion' THEN
                        IF (p_record_old.id_estado_candidato IS DISTINCT FROM p_record_new.id_estado_candidato) THEN
                            v_detalle := 'Estado de postulación modificado';
                        ELSIF (p_record_old.valoracion IS DISTINCT FROM p_record_new.valoracion) 
                              AND p_record_new.valoracion IS NOT NULL THEN
                            v_detalle := 'Valoración de postulación actualizada';
                        ELSIF (p_record_old.expectativa_renta IS DISTINCT FROM p_record_new.expectativa_renta) THEN
                            v_detalle := 'Expectativa de renta modificada';
                        ELSIF (p_record_old.fecha_envio IS DISTINCT FROM p_record_new.fecha_envio) 
                              AND p_record_new.fecha_envio IS NOT NULL THEN
                            v_detalle := 'Postulación enviada';
                        ELSE
                            v_detalle := 'Datos de postulación actualizados';
                        END IF;
                        
                    ELSE
                        v_detalle := 'Registro en ' || p_tabla || ' actualizado';
                END CASE;
            ELSE
                v_detalle := 'Registro en ' || p_tabla || ' actualizado';
            END IF;
            
        WHEN 'DELETE' THEN
            CASE p_tabla
                WHEN 'solicitud' THEN
                    v_detalle := 'Solicitud eliminada';
                WHEN 'hito_solicitud' THEN
                    v_detalle := 'Hito "' || COALESCE(v_nombre_registro, '') || '" eliminado';
                WHEN 'usuario' THEN
                    v_detalle := 'Usuario "' || COALESCE(v_nombre_registro, '') || '" eliminado';
                WHEN 'cliente' THEN
                    v_detalle := 'Cliente "' || COALESCE(v_nombre_registro, '') || '" eliminado';
                WHEN 'contacto' THEN
                    v_detalle := 'Contacto "' || COALESCE(v_nombre_registro, '') || '" eliminado';
                WHEN 'candidato' THEN
                    v_detalle := 'Candidato "' || COALESCE(v_nombre_registro, '') || '" eliminado';
                WHEN 'postulacion' THEN
                    v_detalle := 'Postulación #' || COALESCE(v_id_registro, '') || ' eliminada';
                ELSE
                    v_detalle := 'Registro eliminado de ' || p_tabla;
            END CASE;
            
        ELSE
            v_detalle := 'Operación ' || p_accion || ' en ' || p_tabla;
    END CASE;
    
    RETURN LEFT(v_detalle, 100); -- Asegurar que no exceda el límite de 100 caracteres
END;
$$ LANGUAGE plpgsql;

