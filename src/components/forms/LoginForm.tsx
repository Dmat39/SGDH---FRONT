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

// Modo demo: Cambiar a false cuando tengas un backend real
const DEMO_MODE = true;

// Credenciales de prueba para modo demo
const DEMO_CREDENTIALS = {
  username: "admin",
  password: "admin",
};

// Usuario de prueba para modo demo
const DEMO_USER = {
  id: 1,
  username: "admin",
  fullName: "Administrador Demo",
  email: "admin@sjl.gob.pe",
  role: "admin",
  permissions: ["all"],
};

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

        // Modo demo: Login sin backend
        if (DEMO_MODE) {
          // Simular delay de red
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Verificar credenciales de demo
          if (values.username === DEMO_CREDENTIALS.username && values.password === DEMO_CREDENTIALS.password) {
            const demoToken = "demo_token_" + Date.now();

            // Guardar en Redux
            dispatch(
              loginSuccess({
                token: demoToken,
                user: DEMO_USER,
              })
            );

            // Guardar token en cookies para el middleware
            if (typeof document !== "undefined") {
              document.cookie = `auth_token=${demoToken}; path=/; max-age=86400; SameSite=Strict`;
            }

            showSuccess("Bienvenido", `Hola ${DEMO_USER.fullName}`);
            router.push(`/${subgerencia}`);
            return;
          } else {
            throw new Error("Usuario o contraseña incorrectos");
          }
        }

        // Modo producción: Login con backend real
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
          error.message || error.response?.data?.message || "Usuario o contraseña incorrectos"
        );
      } finally {
        setIsLoading(false);
        dispatch(setLoading(false));
      }
    },
  });

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
      {/* Título */}
      <h2
        className="text-xl md:text-2xl font-bold text-center mb-8 leading-tight"
        style={{ color }}
      >
        {subgerenciaName}
      </h2>

      {/* Formulario */}
      <form onSubmit={formik.handleSubmit}>
        {/* Campo Usuario */}
        <div className="mb-6">
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
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline sx={{ color: "gray" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
        </div>

        {/* Campo Contraseña */}
        <div className="mb-8">
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
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: "gray" }} />
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
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
        </div>

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
            borderRadius: "12px",
            mt: 2,
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "INICIAR SESIÓN"}
        </Button>
      </form>

      {/* Enlaces adicionales */}
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 transition-colors underline-offset-2 hover:underline"
          onClick={() => showError("Función no disponible", "Contacta al administrador del sistema")}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  );
}
