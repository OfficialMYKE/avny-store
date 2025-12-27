"use client";

import { usePathname } from "next/navigation";
import { Navbar5 } from "./ui/navbar-5"; // Asegúrate de importar tu Navbar original aquí

export const NavbarWrapper = () => {
  const pathname = usePathname();

  // Definimos las rutas donde NO queremos que salga el Navbar
  const isLoginPage = pathname === "/login";

  // Ocultar en cualquier ruta que empiece por "/admin"
  // (esto cubre: panel, crear, editar, etc.)
  const isAdminPage = pathname.startsWith("/admin");

  // Si es login o admin, no renderizamos nada (null)
  if (isLoginPage || isAdminPage) {
    return null;
  }

  // Si es una página normal (tienda), mostramos el Navbar
  return <Navbar5 />;
};
