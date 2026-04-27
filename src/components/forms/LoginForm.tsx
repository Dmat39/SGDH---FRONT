"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, CircularProgress, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, PersonOutline, LockOutlined } from "@mui/icons-material";
import axios from "axios";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess, setLoading } from "@/redux/slices/authSlice";
import { showError, showSuccess } from "@/lib/utils/swalConfig";
import { mapMeResponseToPermissions, mapMeResponseToModuleAbilities, determineSubgerencia, getRoleDisplayName } from "@/lib/utils/authUtils";
import type { SubgerenciaType } from "@/lib/constants";
import type { ApiResponse, LoginResponse, MeResponse, User } from "@/types/auth";

interface LoginFormProps {
  subgerencia: SubgerenciaType;
  color: string;
  subgerenciaName: string;
}

const validationSchema = Yup.object({
  username: Yup.string().required("El usuario es requerido"),
  password: Yup.string().required("La contraseña es requerida"),
});

// Cambiar a "true" solo en desarrollo local sin backend
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Quitar trailing slash para construir URLs con /auth/login, /auth/me, etc.
const API_BASE = (
  process.env.NEXT_PUBLIC_PVL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api"
).replace(/\/$/, "");

// --------------- Demo mode types & helpers ---------------

interface DemoUserData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  permissions: string[];
  subgerencia: SubgerenciaType;
  cargo: string;
}

interface DemoUserEnv {
  password: string;
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  permissions: string[];
  subgerencia: string;
  cargo: string;
}

const parseDemoUsers = (): Record<string, { password: string; user: DemoUserData }> => {
  try {
    const raw = process.env.NEXT_PUBLIC_DEMO_USERS;
    if (!raw) return {};
    const parsed: Record<string, DemoUserEnv> = JSON.parse(raw);
    const result: Record<string, { password: string; user: DemoUserData }> = {};
    for (const [username, data] of Object.entries(parsed)) {
      result[username] = {
        password: data.password,
        user: {
          id: data.id,
          username,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: data.fullName,
          email: data.email,
          permissions: data.permissions,
          subgerencia: data.subgerencia as SubgerenciaType,
          cargo: data.cargo,
        },
      };
    }
    return result;
  } catch {
    console.error("Error parseando NEXT_PUBLIC_DEMO_USERS del .env");
    return {};
  }
};

const DEMO_USERS = parseDemoUsers();

// --------------- Shared redirect logic ---------------

function getRedirectRoute(permissions: string[], userSubgerencia: SubgerenciaType): string {
  const defaultRoute =
    userSubgerencia === "servicios-sociales"
      ? `/${userSubgerencia}/servicios-deporte/participantes`
      : `/${userSubgerencia}/lista-general`;

  if (
    permissions.includes("all") ||
    permissions.includes("all_programas_sociales") ||
    permissions.includes("all_servicios_sociales") ||
    permissions.includes("ule")
  ) {
    return defaultRoute;
  }
  if (permissions.includes("pvl")) return `/${userSubgerencia}/pvl`;
  if (permissions.includes("pantbc")) return `/${userSubgerencia}/pantbc`;
  if (permissions.includes("comedores_populares")) return `/${userSubgerencia}/comedores-populares`;
  if (permissions.includes("ollas_comunes")) return `/${userSubgerencia}/ollas-comunes`;
  if (permissions.includes("omaped")) return `/${userSubgerencia}/omaped`;
  if (permissions.includes("ciam")) return `/${userSubgerencia}/ciam`;
  if (permissions.includes("participacion_ciudadana")) {
    return `/${userSubgerencia}/participacion-ciudadana/dirigentes`;
  }
  if (permissions.includes("servicios_deporte")) {
    return `/${userSubgerencia}/servicios-deporte/participantes`;
  }
  if (permissions.includes("salud")) return `/${userSubgerencia}/salud/compromiso-1`;

  return defaultRoute;
}

// ---------------------------------------------------------

export default function LoginForm({ subgerencia, color, subgerenciaName }: LoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        dispatch(setLoading(true));

        // ── DEMO MODE ──────────────────────────────────────────────
        if (DEMO_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 800));

          const demoAccount = DEMO_USERS[values.username];
          if (!demoAccount || values.password !== demoAccount.password) {
            throw new Error("Usuario o contraseña incorrectos");
          }

          const demoToken = "demo_token_" + Date.now();
          const demoData = demoAccount.user;

          const demoUser: User = {
            id: String(demoData.id),
            username: demoData.username,
            email: demoData.email,
            firstName: demoData.firstName,
            lastName: demoData.lastName,
            fullName: demoData.fullName,
            permissions: demoData.permissions,
            subgerencia: demoData.subgerencia,
            cargo: demoData.cargo,
          };

          dispatch(loginSuccess({ token: demoToken, user: demoUser }));

          if (typeof document !== "undefined") {
            document.cookie = `auth_token=${demoToken}; path=/; max-age=86400; SameSite=Strict`;
          }

          showSuccess("Bienvenido", `Hola ${demoUser.fullName}`);
          router.push(getRedirectRoute(demoUser.permissions, demoUser.subgerencia));
          return;
        }

        // ── PRODUCCIÓN ─────────────────────────────────────────────
        // El ResponseInterceptor envuelve la respuesta: { message, data: { access_token } }
        const loginWrapped: ApiResponse<LoginResponse> = await axios
          .post(`${API_BASE}/auth/login`, {
            username: values.username,
            password: values.password,
          })
          .then((r) => r.data);

        const token = loginWrapped.data.access_token;

        // Obtener datos completos del usuario
        const meWrapped: ApiResponse<MeResponse> = await axios
          .get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((r) => r.data);

        const meRes = meWrapped.data;

        const permissions = mapMeResponseToPermissions(meRes);
        const userSubgerencia = determineSubgerencia(meRes, subgerencia);
        const cargo = getRoleDisplayName(meRes.role);

        const user: User = {
          id: meRes.user.id,
          username: meRes.user.username,
          email: meRes.user.email,
          firstName: meRes.user.name,
          lastName: meRes.user.lastname,
          fullName: `${meRes.user.name} ${meRes.user.lastname}`.trim(),
          permissions,
          subgerencia: userSubgerencia,
          cargo,
          is_super: meRes.is_super,
          role: meRes.role ?? undefined,
          moduleAbilities: mapMeResponseToModuleAbilities(meRes),
        };

        dispatch(loginSuccess({ token, user }));

        if (typeof document !== "undefined") {
          document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
        }

        showSuccess("Bienvenido", `Hola ${user.fullName}`);
        router.push(getRedirectRoute(permissions, userSubgerencia));
      } catch (error: any) {
        console.error("Error en login:", error);
        showError(
          "Error al iniciar sesión",
          error.response?.data?.message || error.message || "Usuario o contraseña incorrectos"
        );
      } finally {
        setIsLoading(false);
        dispatch(setLoading(false));
      }
    },
  });

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
      <h2
        className="text-xl md:text-2xl font-bold text-center mb-8 leading-tight"
        style={{ color }}
      >
        {subgerenciaName}
      </h2>

      <form onSubmit={formik.handleSubmit}>
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
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
        </div>

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
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
        </div>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            backgroundColor: color,
            "&:hover": { backgroundColor: color, filter: "brightness(0.9)" },
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
