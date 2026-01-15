"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, CircularProgress, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, PersonOutline, LockOutlined } from "@mui/icons-material";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess, setLoading } from "@/redux/slices/authSlice";
import { useFetch } from "@/lib/hooks/useFetch";
import { showError, showSuccess } from "@/lib/utils/swalConfig";
import type { SubgerenciaType } from "@/lib/constants";
import type { LoginResponse } from "@/types/auth";

interface LoginFormProps {
  subgerencia: SubgerenciaType;
  color: string;
  subgerenciaName: string;
}

const validationSchema = Yup.object({
  username: Yup.string().required("El usuario es requerido"),
  password: Yup.string().required("La contraseña es requerida"),
});

export default function LoginForm({ subgerencia, color, subgerenciaName }: LoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { postData } = useFetch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        dispatch(setLoading(true));

        // Realizar login
        const response: LoginResponse = await postData("/auth/login", {
          ...values,
          subgerencia,
        });

        // Guardar en Redux
        dispatch(
          loginSuccess({
            token: response.token,
            user: response.user,
          })
        );

        // Guardar token en cookies para el middleware
        if (typeof document !== "undefined") {
          document.cookie = `auth_token=${response.token}; path=/; max-age=86400; SameSite=Strict`;
        }

        showSuccess("Bienvenido", `Hola ${response.user.fullName}`);

        // Redirigir al dashboard de la subgerencia
        router.push(`/${subgerencia}`);
      } catch (error: any) {
        console.error("Error en login:", error);
        showError(
          "Error al iniciar sesión",
          error.response?.data?.message || "Usuario o contraseña incorrectos"
        );
      } finally {
        setIsLoading(false);
        dispatch(setLoading(false));
      }
    },
  });

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
      {/* Título */}
      <h2
        className="text-2xl md:text-3xl font-bold text-center mb-6 leading-tight"
        style={{ color }}
      >
        {subgerenciaName}
      </h2>

      {/* Formulario */}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Campo Usuario */}
        <TextField
          fullWidth
          id="username"
          name="username"
          label="Usuario"
          variant="outlined"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutline />
              </InputAdornment>
            ),
          }}
        />

        {/* Campo Contraseña */}
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Botón de submit */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            backgroundColor: color,
            "&:hover": {
              backgroundColor: color,
              filter: "brightness(0.9)",
            },
            textTransform: "none",
            fontSize: "1.1rem",
            fontWeight: "bold",
            py: 1.5,
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "INICIAR SESIÓN"}
        </Button>
      </form>

      {/* Enlaces adicionales */}
      <div className="mt-4 flex justify-between text-sm">
        <button
          type="button"
          className="text-gray-600 hover:text-gray-800 transition-colors"
          onClick={() => showError("Función no disponible", "Contacta al administrador del sistema")}
        >
          Olvidé mi contraseña
        </button>
        <button
          type="button"
          className="text-gray-600 hover:text-gray-800 transition-colors"
          onClick={() => showError("Función no disponible", "Contacta al administrador del sistema")}
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
