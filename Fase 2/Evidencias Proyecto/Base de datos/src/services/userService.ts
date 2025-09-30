// src/services/userService.ts
import Usuario from '@/models/Usuario';

interface CreateUserPayload {
  rut_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  contrasena_usuario: string;
  rol_usuario: number; // 1 = admin, 2 = consultor
  activo_usuario?: boolean; // opcional, por defecto true
}

export const createUser = async (data: CreateUserPayload) => {
  // Crear el usuario, asignando true si no viene activo_usuario
  const usuario = await Usuario.create({
    ...data,
    activo_usuario: data.activo_usuario ?? true
  });

  // Devolver datos limpios (sin contraseña)
  return {
    rut_usuario: usuario.rut_usuario,
    nombre: usuario.getNombreCompleto(),
    email: usuario.email_usuario,
    rol: usuario.getRolString(),
    activo: usuario.activo_usuario
  };
};
