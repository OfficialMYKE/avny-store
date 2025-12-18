"use client";

import { MenuIcon, Search, PackageSearch, Tag } from "lucide-react";
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
} from "./navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";

interface NavbarProps {
  onCategoryChange: (category: string) => void;
  onSearchChange: (term: string) => void;
  cartCount?: number;
}

export const Navbar5 = ({
  onCategoryChange,
  onSearchChange,
  cartCount = 0,
}: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // CATEGORÍAS
  const categories = [
    {
      title: "Hombres",
      description: "Colección vintage masculina.",
      value: "Hombre",
    },
    {
      title: "Mujeres",
      description: "Moda y estilo femenino.",
      value: "Mujer",
    },
    { title: "Niños", description: "Ropa para los pequeños.", value: "Niños" },
    {
      title: "Hoodies & Sweatshirts",
      description: "Sudaderas vintage Nike, Champion y más.",
      value: "Hoodies",
    },
    {
      title: "Jackets & Coats",
      description: "Chaquetas universitarias y abrigo.",
      value: "Jackets",
    },
    {
      title: "T-Shirts Graphic",
      description: "Camisetas estampadas de los 90s y 2000s.",
      value: "T-Shirts",
    },
    {
      title: "Pants & Denim",
      description: "Jeans Levi's, Dickies y pantalones cargo.",
      value: "Pants",
    },
    {
      title: "Shoes & Sneakers",
      description: "Jordans, Nike SB, botas y calzado vintage.",
      value: "Shoes",
    },
    {
      title: "Accessories",
      description: "Gorras y bolsos para complementar.",
      value: "Accessories",
    },
    {
      title: "Ver Todo",
      description: "Explora el catálogo completo.",
      value: "Todos",
    },
  ];

  const handleCategoryClick = (val: string) => {
    let filterValue = val;
    if (val === "T-Shirts") filterValue = "Camisetas";
    if (val === "Pants") filterValue = "Pantalones";
    if (val === "Jackets") filterValue = "Chaquetas";
    if (val === "Accessories") filterValue = "Accesorios";
    if (val === "Shoes") filterValue = "Zapatos";

    onCategoryChange(filterValue);
    setIsOpen(false);
  };

  return (
    <section className="py-4 bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onCategoryChange("Todos")}
          >
            <span className="text-2xl font-black tracking-tighter italic">
              AVNYC.
            </span>
          </div>

          {/* MENÚ DE ESCRITORIO */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              {/* Dropdown Catálogo */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Catálogo</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[600px] grid-cols-2 p-3 gap-2">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-zinc-100 cursor-pointer block"
                        onClick={() => handleCategoryClick(cat.value)}
                      >
                        <div>
                          <p className="mb-1 font-semibold text-foreground leading-none">
                            {cat.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Nuevos Drops */}
              <NavigationMenuItem>
                <Link href="#" className={navigationMenuTriggerStyle()}>
                  Nuevos Drops
                </Link>
              </NavigationMenuItem>

              {/* BOTÓN DESCUENTOS (TEXTO NEGRO) */}
              <NavigationMenuItem>
                <button
                  onClick={() => onCategoryChange("Ofertas")}
                  className={`${navigationMenuTriggerStyle()} text-black font-black hover:text-black hover:bg-zinc-100 cursor-pointer`}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Descuentos
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* DERECHA: BUSCADOR, PEDIDOS E INGRESAR */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar prenda..."
                className="pl-8 h-9 bg-zinc-50"
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              asChild
              className="hover:bg-zinc-100 hover:text-black transition-colors"
              title="Solicitar pedido por encargo"
            >
              <a
                href="https://wa.me/593986355332?text=Hola%20AVNY!..."
                target="_blank"
                rel="noopener noreferrer"
              >
                <PackageSearch className="h-5 w-5" />
              </a>
            </Button>

            <Button variant="default" size="sm" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
          </div>

          {/* MENÚ MÓVIL (SHEET) */}
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

              <div className="flex flex-col gap-6 mt-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar..."
                    className="pl-8"
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>

                {/* Enlace Móvil: DESCUENTOS (TEXTO NEGRO) */}
                <button
                  onClick={() => handleCategoryClick("Ofertas")}
                  className="flex items-center justify-center gap-2 text-lg font-black text-black bg-zinc-100 p-3 rounded-md"
                >
                  <Tag className="w-5 h-5" /> Ver Ofertas & Descuentos
                </button>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="categorias" className="border-none">
                    <AccordionTrigger className="text-base font-bold">
                      Categorías
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2 pl-4">
                        {categories.map((cat, index) => (
                          <button
                            key={index}
                            className="text-left py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => handleCategoryClick(cat.value)}
                          >
                            {cat.title}
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex flex-col gap-4 font-medium border-t pt-4">
                  <Link href="#" className="py-2 hover:underline">
                    Nuevos Drops
                  </Link>
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
