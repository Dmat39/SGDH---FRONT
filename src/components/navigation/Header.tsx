"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";
import { showConfirm } from "@/lib/utils/swalConfig";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  color: string;
}

export default function Header({ onMenuClick, title, color }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const result = await showConfirm(
      "¿Cerrar sesión?",
      "¿Estás seguro de que deseas cerrar sesión?"
    );

    if (result.isConfirmed) {
      // Eliminar cookie de token
      if (typeof document !== "undefined") {
        document.cookie = "auth_token=; path=/; max-age=0";
      }

      dispatch(logout());
      router.push("/");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: color,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/* Botón de menú */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Título */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* Notificaciones */}
        <IconButton color="inherit" sx={{ mr: 1 }}>
          <Notifications />
        </IconButton>

        {/* Usuario */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
            {user?.fullName || "Usuario"}
          </Typography>
          <IconButton onClick={handleMenuOpen} color="inherit">
            {user?.avatar ? (
              <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>

        {/* Menú de usuario */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {}}>
            <AccountCircle sx={{ mr: 1 }} fontSize="small" />
            Mi Perfil
          </MenuItem>
          <MenuItem onClick={() => {}}>
            <Settings sx={{ mr: 1 }} fontSize="small" />
            Configuración
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} fontSize="small" />
            Cerrar Sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
