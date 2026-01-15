import { useAppSelector } from "@/redux/hooks";
import type { User } from "@/types/auth";

/**
 * Hook para verificar permisos del usuario
 */
export const usePermissions = (moduleName?: string | string[]) => {
  const { user } = useAppSelector((state) => state.auth);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string | string[]): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    const permissions = Array.isArray(permission) ? permission : [permission];

    return permissions.some((perm) => user.permissions.includes(perm));
  };

  /**
   * Verifica si el usuario tiene permiso para crear
   */
  const canCreate = (): boolean => {
    if (!moduleName) return false;
    const modules = Array.isArray(moduleName) ? moduleName : [moduleName];
    return modules.some((mod) => hasPermission(`create_${mod}`) || hasPermission(`all_${mod}`));
  };

  /**
   * Verifica si el usuario tiene permiso para ver/leer
   */
  const canRead = (): boolean => {
    if (!moduleName) return false;
    const modules = Array.isArray(moduleName) ? moduleName : [moduleName];
    return modules.some((mod) => hasPermission(`view_${mod}`) || hasPermission(`all_${mod}`));
  };

  /**
   * Verifica si el usuario tiene permiso para editar
   */
  const canEdit = (): boolean => {
    if (!moduleName) return false;
    const modules = Array.isArray(moduleName) ? moduleName : [moduleName];
    return modules.some((mod) => hasPermission(`update_${mod}`) || hasPermission(`all_${mod}`));
  };

  /**
   * Verifica si el usuario tiene permiso para eliminar
   */
  const canDelete = (): boolean => {
    if (!moduleName) return false;
    const modules = Array.isArray(moduleName) ? moduleName : [moduleName];
    return modules.some((mod) => hasPermission(`delete_${mod}`) || hasPermission(`all_${mod}`));
  };

  /**
   * Verifica si el usuario tiene acceso al módulo
   */
  const hasModuleAccess = (): boolean => {
    if (!moduleName) return false;
    const modules = Array.isArray(moduleName) ? moduleName : [moduleName];
    return modules.some((mod) => hasPermission(mod) || hasPermission(`all_${mod}`));
  };

  return {
    hasPermission,
    canCreate,
    canRead,
    canEdit,
    canDelete,
    hasModuleAccess,
  };
};

/**
 * Función helper para verificar permisos (sin hook)
 * Útil para usar fuera de componentes
 */
export const hasPermissionFunction = (user: User | null, permission: string | string[]): boolean => {
  if (!user || !user.permissions) {
    return false;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((perm) => user.permissions.includes(perm));
};
