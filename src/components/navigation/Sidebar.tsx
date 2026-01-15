"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
  Collapse,
} from "@mui/material";
import {
  Dashboard,
  ExpandLess,
  ExpandMore,
  LocalDrink,
  Restaurant,
  RestaurantMenu,
  SoupKitchen,
  AssignmentInd,
  Accessible,
  Elderly,
  Groups,
  SportsScore,
  HealthAndSafety,
} from "@mui/icons-material";
import { useState } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { MenuItem } from "@/lib/constants";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  color: string;
}

const DRAWER_WIDTH = 280;

// Mapeo de iconos
const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <Dashboard />,
  LocalDrink: <LocalDrink />,
  Restaurant: <Restaurant />,
  RestaurantMenu: <RestaurantMenu />,
  SoupKitchen: <SoupKitchen />,
  AssignmentInd: <AssignmentInd />,
  Accessible: <Accessible />,
  Elderly: <Elderly />,
  Groups: <Groups />,
  SportsScore: <SportsScore />,
  HealthAndSafety: <HealthAndSafety />,
};

export default function Sidebar({ open, onClose, menuItems, color }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { hasPermission } = usePermissions();

  const handleSubmenuClick = (itemId: string) => {
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.permisos || item.permisos.length === 0) {
      return true;
    }
    return hasPermission(item.permisos);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    if (!hasAccess(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.ruta;
    const isSubmenuOpen = openSubmenu === item.id;

    return (
      <Box key={item.id}>
        <ListItemButton
          onClick={() => {
            if (hasChildren) {
              handleSubmenuClick(item.id);
            } else if (item.ruta) {
              handleNavigate(item.ruta);
            }
          }}
          sx={{
            pl: 2 + level * 2,
            backgroundColor: isActive ? `${color}20` : "transparent",
            borderLeft: isActive ? `4px solid ${color}` : "none",
            "&:hover": {
              backgroundColor: `${color}10`,
            },
          }}
        >
          {item.icono && (
            <ListItemIcon sx={{ color: isActive ? color : "inherit", minWidth: 40 }}>
              {iconMap[item.icono] || <Dashboard />}
            </ListItemIcon>
          )}
          <ListItemText
            primary={item.nombre}
            primaryTypographyProps={{
              fontSize: level > 0 ? "0.9rem" : "1rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? color : "inherit",
            }}
          />
          {hasChildren && (isSubmenuOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawerContent = (
    <Box>
      <Toolbar />
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color, fontWeight: "bold" }}>
          Menú
        </Typography>
      </Box>
      <Divider />
      <List>{menuItems.map((item) => renderMenuItem(item))}</List>
    </Box>
  );

  return (
    <>
      {/* Sidebar permanente para pantallas grandes */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Sidebar temporal para pantallas pequeñas */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móviles
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
