import Usuario from '@/models/Usuario';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '@/config';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  usuario: {
    rut_usuario: string;
    nombre: string;
    apellido: string,
    rol: string;
    activo: boolean;
  };
}

export const loginUser = async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
  // Buscar usuario por email
  const usuario = await Usuario.findOne({ where: { email_usuario: email } });
  if (!usuario) throw new Error('Usuario no encontrado');

  // Verificar si está activo
  if (!usuario.isActive()) throw new Error('Usuario inactivo');

  // Verificar contraseña
  const isMatch = await bcrypt.compare(password, usuario.contrasena_usuario);
  if (!isMatch) throw new Error('Contraseña incorrecta');

  // Verificar que la secret exista
  if (!config.jwt.secret) throw new Error('JWT secret no definida');

  // Opciones de JWT
  //const signOptions: SignOptions = { expiresIn: config.jwt.expiresIn || '1h' };

  const signOptions: SignOptions = { 
  expiresIn: 3600 // 1 hora en segundos
};

  // Generar token JWT
  const token = jwt.sign(
    {
      id: usuario.rut_usuario,
      email: usuario.email_usuario,
      role: usuario.getRolString(),
      status: usuario.activo_usuario ? 'habilitado' : 'deshabilitado'
    },
    config.jwt.secret as Secret,
    signOptions
  );

  return {
    token,
    usuario: {
      rut_usuario: usuario.rut_usuario,
      nombre: usuario.getNombre(),
      apellido: usuario.getApellido(),
      rol: usuario.getRolString(),
      activo: usuario.isActive()
    }
  };
};
