"use client";

import {
  MenuIcon,
  Search,
  PackageSearch,
  Tag,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";

// IMPORTAR EL CARRITO Y FAVORITOS
import { CartSheet } from "../CartSheet";
import { FavoritesSheet } from "@/components/FavoritesSheet";

interface NavbarProps {
  onSearchChange?: (term: string) => void;
  cartCount?: number;
}

export const Navbar5 = ({ onSearchChange, cartCount = 0 }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. CATEGORÍAS PRINCIPALES
  // 'value' debe coincidir con lo que tienes en la base de datos (columna 'gender')
  const mainCategories = [
    {
      title: "Hombres",
      value: "Hombre",
      href: "/shop/hombre",
      description: "Colección vintage masculina.",
    },
    {
      title: "Mujeres",
      value: "Mujer",
      href: "/shop/mujer",
      description: "Moda y estilo femenino.",
    },
    {
      title: "Niños",
      value: "Niños",
      href: "/shop/niños",
      description: "Ropa para los pequeños.",
    },
  ];

  // 2. TIPOS DE PRENDA (Subcategorías)
  const productTypes = [
    {
      title: "Hoodies & Sweatshirts",
      description: "Sudaderas Nike, Champion.",
      href: "/shop/hoodies",
    },
    {
      title: "Jackets & Coats",
      description: "Chaquetas y abrigos.",
      href: "/shop/jackets",
    },
    {
      title: "T-Shirts Graphic",
      description: "Camisetas estampadas 90s.",
      href: "/shop/camisetas",
    },
    {
      title: "Pants & Denim",
      description: "Jeans Levi's y cargo.",
      href: "/shop/pantalones",
    },
    {
      title: "Shoes & Sneakers",
      description: "Jordans y botas.",
      href: "/shop/zapatos",
    },
    {
      title: "Accessories",
      description: "Gorras y bolsos.",
      href: "/shop/accesorios",
    },
  ];

  return (
    <section className="py-4 bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-2xl font-black tracking-tighter italic">
              AVNYC.
            </span>
          </Link>

          {/* --- MENÚ DE ESCRITORIO --- */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              {/* Dropdowns: Hombres, Mujeres, Niños */}
              {mainCategories.map((mainCat) => (
                <NavigationMenuItem key={mainCat.href}>
                  <NavigationMenuTrigger>{mainCat.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {/* Opción Principal: Ver todo (Ej: Todo Hombre) */}
                      <li className="col-span-2">
                        <Link
                          href={mainCat.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer bg-zinc-50 border"
                        >
                          <div className="text-sm font-bold leading-none flex items-center">
                            Ver todo {mainCat.title}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                            {mainCat.description}
                          </p>
                        </Link>
                      </li>

                      {/* Subcategorías con Filtro de Género */}
                      {productTypes.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            // AQUÍ ESTÁ LA CLAVE: Agregamos ?gender=Hombre (o Mujer/Niños)
                            href={`${sub.href}?gender=${mainCat.value}`}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                          >
                            <div className="text-sm font-medium leading-none">
                              {sub.title}
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                              {sub.description}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              {/* Link: Nuevos Drops */}
              <NavigationMenuItem>
                <Link href="/shop/new" className={navigationMenuTriggerStyle()}>
                  Nuevos Drops
                </Link>
              </NavigationMenuItem>

              {/* Botón: Descuentos */}
              <NavigationMenuItem>
                <Link
                  href="/shop/ofertas"
                  className={`${navigationMenuTriggerStyle()} text-black font-black hover:text-black hover:bg-zinc-100 cursor-pointer`}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Descuentos
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* --- DERECHA: ICONOS --- */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar prenda..."
                className="pl-8 h-9 bg-zinc-50"
                onChange={(e) =>
                  onSearchChange && onSearchChange(e.target.value)
                }
              />
            </div>

            {/* BOTONES DE ACCIÓN */}
            <FavoritesSheet />
            <CartSheet />

            <Button variant="default" size="sm" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
          </div>

          {/* --- MENÚ MÓVIL (SHEET) --- */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] overflow-auto"
            >
              <SheetHeader>
                <SheetTitle className="text-left font-black italic text-xl">
                  AVNYC.
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col mt-6">
                {/* Buscador Móvil */}
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar..."
                    className="pl-8"
                    onChange={(e) =>
                      onSearchChange && onSearchChange(e.target.value)
                    }
                  />
                </div>

                {/* Enlace Móvil: VER OFERTAS */}
                <Link
                  href="/shop/ofertas"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 text-base font-bold border-b text-left hover:text-muted-foreground transition-colors"
                >
                  Ver Ofertas
                </Link>

                {/* Acordeón de Categorías */}
                <Accordion type="single" collapsible className="w-full">
                  {mainCategories.map((mainCat, index) => (
                    <AccordionItem
                      key={index}
                      value={mainCat.href}
                      className="border-b"
                    >
                      <AccordionTrigger className="text-base font-bold hover:no-underline py-4">
                        {mainCat.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-1 pl-4 border-l-2 border-zinc-100 ml-1 mb-2">
                          <Link
                            href={mainCat.href}
                            onClick={() => setIsOpen(false)}
                            className="text-left py-2 text-sm font-bold text-black hover:text-muted-foreground transition-colors"
                          >
                            Ver todo {mainCat.title}
                          </Link>

                          {/* Subcategorías Móvil con Filtro de Género */}
                          {productTypes.map((sub, idx) => (
                            <Link
                              key={idx}
                              // AQUÍ TAMBIÉN AGREGAMOS EL GÉNERO
                              href={`${sub.href}?gender=${mainCat.value}`}
                              onClick={() => setIsOpen(false)}
                              className="text-left py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-4">
                  <Link
                    href="/login"
                    className="py-2 hover:underline text-muted-foreground text-sm"
                  >
                    Acceso Admin
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};
