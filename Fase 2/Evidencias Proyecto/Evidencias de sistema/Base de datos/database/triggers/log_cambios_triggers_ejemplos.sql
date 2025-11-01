-- ===========================================
-- EJEMPLOS DE TRIGGERS PARA LOG_CAMBIOS
-- Con detalle_cambio automático
-- ===========================================

-- ===========================================
-- TRIGGER PARA TABLA: solicitud
-- ===========================================

-- Función trigger para solicitud
CREATE OR REPLACE FUNCTION trigger_log_solicitud()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle TEXT;
    v_id_registro TEXT;
    v_usuario TEXT;
BEGIN
    -- Obtener usuario actual (puede venir de una variable de sesión o función de aplicación)
    v_usuario := COALESCE(
        current_setting('app.current_user', true),
        current_user,
        'system'
    );
    
    -- Determinar ID del registro
    v_id_registro := COALESCE(NEW.id_solicitud::TEXT, OLD.id_solicitud::TEXT);
    
    -- Generar detalle según la acción
    IF TG_OP = 'INSERT' THEN
        v_detalle := 'Nueva solicitud #' || NEW.id_solicitud::TEXT || ' creada';
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Detectar cambios específicos
        IF OLD.id_etapa_solicitud IS DISTINCT FROM NEW.id_etapa_solicitud THEN
            -- Obtener nombre de etapa (opcional, requiere JOIN)
            v_detalle := 'Etapa de solicitud modificada (de etapa ' || 
                        OLD.id_etapa_solicitud || ' a ' || NEW.id_etapa_solicitud || ')';
        ELSIF OLD.plazo_maximo_solicitud IS DISTINCT FROM NEW.plazo_maximo_solicitud THEN
            v_detalle := 'Plazo máximo modificado (de ' || 
                        TO_CHAR(OLD.plazo_maximo_solicitud, 'DD/MM/YYYY') || ' a ' ||
                        TO_CHAR(NEW.plazo_maximo_solicitud, 'DD/MM/YYYY') || ')';
        ELSIF OLD.rut_usuario IS DISTINCT FROM NEW.rut_usuario THEN
            v_detalle := 'Consultor asignado modificado';
        ELSIF OLD.codigo_servicio IS DISTINCT FROM NEW.codigo_servicio THEN
            v_detalle := 'Tipo de servicio cambiado (de ' || OLD.codigo_servicio || ' a ' || NEW.codigo_servicio || ')';
        ELSE
            v_detalle := 'Datos de solicitud #' || NEW.id_solicitud::TEXT || ' actualizados';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_detalle := 'Solicitud #' || OLD.id_solicitud::TEXT || ' eliminada';
    END IF;
    
    -- Asegurar que el detalle no exceda 100 caracteres
    v_detalle := LEFT(v_detalle, 100);
    
    -- Insertar en log_cambios
    INSERT INTO log_cambios (
        tabla_afectada,
        id_registro,
        accion,
        detalle_cambio,
        usuario_responsable,
        fecha_cambio
    ) VALUES (
        TG_TABLE_NAME,
        v_id_registro,
        TG_OP,
        v_detalle,
        v_usuario,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trg_log_solicitud ON solicitud;
CREATE TRIGGER trg_log_solicitud
    AFTER INSERT OR UPDATE OR DELETE ON solicitud
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_solicitud();

-- ===========================================
-- TRIGGER PARA TABLA: hito_solicitud
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_log_hito_solicitud()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle TEXT;
    v_id_registro TEXT;
    v_usuario TEXT;
BEGIN
    v_usuario := COALESCE(
        current_setting('app.current_user', true),
        current_user,
        'system'
    );
    
    v_id_registro := COALESCE(NEW.id_hito_solicitud::TEXT, OLD.id_hito_solicitud::TEXT);
    
    IF TG_OP = 'INSERT' THEN
        v_detalle := 'Hito "' || NEW.nombre_hito || '" creado';
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Detectar cambios importantes
        IF OLD.fecha_cumplimiento IS NULL AND NEW.fecha_cumplimiento IS NOT NULL THEN
            v_detalle := 'Hito "' || NEW.nombre_hito || '" completado';
        ELSIF OLD.fecha_base IS NULL AND NEW.fecha_base IS NOT NULL THEN
            v_detalle := 'Hito "' || NEW.nombre_hito || '" activado';
        ELSIF OLD.fecha_limite IS DISTINCT FROM NEW.fecha_limite THEN
            v_detalle := 'Fecha límite del hito "' || NEW.nombre_hito || '" modificada';
        ELSIF OLD.duracion_dias IS DISTINCT FROM NEW.duracion_dias THEN
            v_detalle := 'Duración del hito "' || NEW.nombre_hito || '" modificada';
        ELSIF OLD.nombre_hito IS DISTINCT FROM NEW.nombre_hito THEN
            v_detalle := 'Nombre del hito modificado (de "' || OLD.nombre_hito || '" a "' || NEW.nombre_hito || '")';
        ELSE
            v_detalle := 'Hito "' || NEW.nombre_hito || '" actualizado';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_detalle := 'Hito "' || OLD.nombre_hito || '" eliminado';
    END IF;
    
    v_detalle := LEFT(v_detalle, 100);
    
    INSERT INTO log_cambios (
        tabla_afectada,
        id_registro,
        accion,
        detalle_cambio,
        usuario_responsable,
        fecha_cambio
    ) VALUES (
        TG_TABLE_NAME,
        v_id_registro,
        TG_OP,
        v_detalle,
        v_usuario,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_hito_solicitud ON hito_solicitud;
CREATE TRIGGER trg_log_hito_solicitud
    AFTER INSERT OR UPDATE OR DELETE ON hito_solicitud
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_hito_solicitud();

-- ===========================================
-- TRIGGER PARA TABLA: usuario
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_log_usuario()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle TEXT;
    v_id_registro TEXT;
    v_usuario TEXT;
    v_nombre_completo TEXT;
BEGIN
    v_usuario := COALESCE(
        current_setting('app.current_user', true),
        current_user,
        'system'
    );
    
    v_id_registro := COALESCE(NEW.rut_usuario, OLD.rut_usuario);
    
    IF TG_OP = 'INSERT' THEN
        v_nombre_completo := COALESCE(NEW.nombre_usuario, 'Usuario') || ' ' || 
                           COALESCE(NEW.apellido_paterno_usuario, '');
        v_detalle := 'Usuario "' || v_nombre_completo || '" creado';
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.estado_usuario IS DISTINCT FROM NEW.estado_usuario THEN
            v_detalle := 'Estado del usuario modificado (de ' || 
                        OLD.estado_usuario || ' a ' || NEW.estado_usuario || ')';
        ELSIF OLD.rol_usuario IS DISTINCT FROM NEW.rol_usuario THEN
            v_detalle := 'Rol del usuario modificado';
        ELSIF OLD.nombre_usuario IS DISTINCT FROM NEW.nombre_usuario THEN
            v_detalle := 'Nombre del usuario modificado';
        ELSE
            v_detalle := 'Datos del usuario actualizados';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_nombre_completo := COALESCE(OLD.nombre_usuario, 'Usuario') || ' ' || 
                           COALESCE(OLD.apellido_paterno_usuario, '');
        v_detalle := 'Usuario "' || v_nombre_completo || '" eliminado';
    END IF;
    
    v_detalle := LEFT(v_detalle, 100);
    
    INSERT INTO log_cambios (
        tabla_afectada,
        id_registro,
        accion,
        detalle_cambio,
        usuario_responsable,
        fecha_cambio
    ) VALUES (
        TG_TABLE_NAME,
        v_id_registro,
        TG_OP,
        v_detalle,
        v_usuario,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_usuario ON usuario;
CREATE TRIGGER trg_log_usuario
    AFTER INSERT OR UPDATE OR DELETE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_usuario();

-- ===========================================
-- TRIGGER PARA TABLA: cliente
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_log_cliente()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle TEXT;
    v_id_registro TEXT;
    v_usuario TEXT;
BEGIN
    v_usuario := COALESCE(
        current_setting('app.current_user', true),
        current_user,
        'system'
    );
    
    v_id_registro := COALESCE(NEW.id_cliente::TEXT, OLD.id_cliente::TEXT);
    
    IF TG_OP = 'INSERT' THEN
        v_detalle := 'Cliente "' || NEW.nombre_cliente || '" creado';
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.nombre_cliente IS DISTINCT FROM NEW.nombre_cliente THEN
            v_detalle := 'Nombre del cliente modificado (de "' || 
                        OLD.nombre_cliente || '" a "' || NEW.nombre_cliente || '")';
        ELSE
            v_detalle := 'Datos del cliente "' || NEW.nombre_cliente || '" actualizados';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_detalle := 'Cliente "' || OLD.nombre_cliente || '" eliminado';
    END IF;
    
    v_detalle := LEFT(v_detalle, 100);
    
    INSERT INTO log_cambios (
        tabla_afectada,
        id_registro,
        accion,
        detalle_cambio,
        usuario_responsable,
        fecha_cambio
    ) VALUES (
        TG_TABLE_NAME,
        v_id_registro,
        TG_OP,
        v_detalle,
        v_usuario,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_cliente ON cliente;
CREATE TRIGGER trg_log_cliente
    AFTER INSERT OR UPDATE OR DELETE ON cliente
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_cliente();

-- ===========================================
-- TRIGGER PARA TABLA: contacto
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_log_contacto()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle TEXT;
    v_id_registro TEXT;
    v_usuario TEXT;
BEGIN
    v_usuario := COALESCE(
        current_setting('app.current_user', true),
        current_user,
        'system'
    );
    
    v_id_registro := COALESCE(NEW.id_contacto::TEXT, OLD.id_contacto::TEXT);
    
    IF TG_OP = 'INSERT' THEN
        v_detalle := 'Contacto "' || NEW.nombre_contacto || '" creado';
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.nombre_contacto IS DISTINCT FROM NEW.nombre_contacto THEN
            v_detalle := 'Nombre del contacto modificado';
        ELSIF OLD.email_contacto IS DISTINCT FROM NEW.email_contacto THEN
            v_detalle := 'Email del contacto actualizado';
        ELSIF OLD.telefono_contacto IS DISTINCT FROM NEW.telefono_contacto THEN
            v_detalle := 'Teléfono del contacto actualizado';
        ELSE
            v_detalle := 'Datos del contacto "' || NEW.nombre_contacto || '" actualizados';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_detalle := 'Contacto "' || OLD.nombre_contacto || '" eliminado';
    END IF;
    
    v_detalle := LEFT(v_detalle, 100);
    
    INSERT INTO log_cambios (
        tabla_afectada,
        id_registro,
        accion,
        detalle_cambio,
        usuario_responsable,
        fecha_cambio
    ) VALUES (
        TG_TABLE_NAME,
        v_id_registro,
        TG_OP,
        v_detalle,
        v_usuario,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_contacto ON contacto;
CREATE TRIGGER trg_log_contacto
    AFTER INSERT OR UPDATE OR DELETE ON contacto
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_contacto();

-- ===========================================
-- TRIGGER PARA TABLA: candidato
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_log_candidato()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle TEXT;
    v_id_registro TEXT;
    v_usuario TEXT;
    v_nombre_completo TEXT;
BEGIN
    v_usuario := COALESCE(
        current_setting('app.current_user', true),
        current_user,
        'system'
    );
    
    v_id_registro := COALESCE(NEW.id_candidato::TEXT, OLD.id_candidato::TEXT);
    
    IF TG_OP = 'INSERT' THEN
        v_nombre_completo := NEW.nombre_candidato || ' ' || 
                           COALESCE(NEW.primer_apellido_candidato, '');
        v_detalle := 'Candidato "' || v_nombre_completo || '" creado';
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.nombre_candidato IS DISTINCT FROM NEW.nombre_candidato THEN
            v_detalle := 'Nombre del candidato modificado';
        ELSIF OLD.email_candidato IS DISTINCT FROM NEW.email_candidato THEN
            v_detalle := 'Email del candidato actualizado';
        ELSIF OLD.telefono_candidato IS DISTINCT FROM NEW.telefono_candidato THEN
            v_detalle := 'Teléfono del candidato actualizado';
        ELSE
            v_detalle := 'Datos del candidato actualizados';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_nombre_completo := OLD.nombre_candidato || ' ' || 
                           COALESCE(OLD.primer_apellido_candidato, '');
        v_detalle := 'Candidato "' || v_nombre_completo || '" eliminado';
    END IF;
    
    v_detalle := LEFT(v_detalle, 100);
    
    INSERT INTO log_cambios (
        tabla_afectada,
        id_registro,
        accion,
        detalle_cambio,
        usuario_responsable,
        fecha_cambio
    ) VALUES (
        TG_TABLE_NAME,
        v_id_registro,
        TG_OP,
        v_detalle,
        v_usuario,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_candidato ON candidato;
CREATE TRIGGER trg_log_candidato
    AFTER INSERT OR UPDATE OR DELETE ON candidato
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_candidato();

-- ===========================================
-- TRIGGER PARA TABLA: postulacion
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_log_postulacion()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle TEXT;
    v_id_registro TEXT;
    v_usuario TEXT;
BEGIN
    v_usuario := COALESCE(
        current_setting('app.current_user', true),
        current_user,
        'system'
    );
    
    v_id_registro := COALESCE(NEW.id_postulacion::TEXT, OLD.id_postulacion::TEXT);
    
    IF TG_OP = 'INSERT' THEN
        v_detalle := 'Nueva postulación #' || NEW.id_postulacion::TEXT || ' creada';
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Detectar cambios importantes
        IF OLD.id_estado_candidato IS DISTINCT FROM NEW.id_estado_candidato THEN
            v_detalle := 'Estado de postulación modificado (de estado ' || 
                        COALESCE(OLD.id_estado_candidato::TEXT, 'N/A') || ' a ' ||
                        COALESCE(NEW.id_estado_candidato::TEXT, 'N/A') || ')';
        ELSIF OLD.valoracion IS DISTINCT FROM NEW.valoracion AND NEW.valoracion IS NOT NULL THEN
            v_detalle := 'Valoración de postulación actualizada (a ' || NEW.valoracion::TEXT || ' estrellas)';
        ELSIF OLD.expectativa_renta IS DISTINCT FROM NEW.expectativa_renta THEN
            v_detalle := 'Expectativa de renta modificada';
        ELSIF OLD.fecha_envio IS NULL AND NEW.fecha_envio IS NOT NULL THEN
            v_detalle := 'Postulación #' || NEW.id_postulacion::TEXT || ' enviada';
        ELSIF OLD.fecha_feedback_cliente IS NULL AND NEW.fecha_feedback_cliente IS NOT NULL THEN
            v_detalle := 'Feedback del cliente registrado para postulación #' || NEW.id_postulacion::TEXT;
        ELSIF OLD.motivacion IS DISTINCT FROM NEW.motivacion THEN
            v_detalle := 'Motivación de postulación actualizada';
        ELSIF OLD.disponibilidad_postulacion IS DISTINCT FROM NEW.disponibilidad_postulacion THEN
            v_detalle := 'Disponibilidad de postulación actualizada';
        ELSIF OLD.cv_postulacion IS NULL AND NEW.cv_postulacion IS NOT NULL THEN
            v_detalle := 'CV agregado a postulación #' || NEW.id_postulacion::TEXT;
        ELSE
            v_detalle := 'Datos de postulación #' || NEW.id_postulacion::TEXT || ' actualizados';
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_detalle := 'Postulación #' || OLD.id_postulacion::TEXT || ' eliminada';
    END IF;
    
    v_detalle := LEFT(v_detalle, 100);
    
    INSERT INTO log_cambios (
        tabla_afectada,
        id_registro,
        accion,
        detalle_cambio,
        usuario_responsable,
        fecha_cambio
    ) VALUES (
        TG_TABLE_NAME,
        v_id_registro,
        TG_OP,
        v_detalle,
        v_usuario,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_postulacion ON postulacion;
CREATE TRIGGER trg_log_postulacion
    AFTER INSERT OR UPDATE OR DELETE ON postulacion
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_postulacion();

