"use client";

import {
  MenuIcon,
  Search,
  Tag,
  ChevronRight,
  User,
  ArrowRight,
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
  NavigationMenuLink,
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

  // Función para cerrar el menú móvil
  const closeMenu = () => setIsOpen(false);

  // --- CATEGORÍAS MEJORADAS (En Español y Agrupadas) ---
  const nestedCategories = [
    {
      title: "Hombre",
      value: "Hombre",
      href: "/shop/hombre",
      columns: [
        {
          heading: "ROPA SUPERIOR",
          items: [
            { name: "Chaquetas y Abrigos", href: "/shop/chaquetas" },
            { name: "Camisetas y Polos", href: "/shop/camisetas" },
            { name: "Sudaderas (Hoodies)", href: "/shop/hoodies" },
            { name: "Camisas y Franelas", href: "/shop/camisas" },
            { name: "Jerseys Deportivos", href: "/shop/jerseys" },
          ],
        },
        {
          heading: "ROPA INFERIOR",
          items: [
            { name: "Jeans Vintage", href: "/shop/jeans" },
            { name: "Pantalones Cargo & Trabajo", href: "/shop/pantalones" },
            { name: "Joggers", href: "/shop/joggers" },
            { name: "Shorts y Bermudas", href: "/shop/shorts" },
          ],
        },
        {
          heading: "CALZADO",
          items: [
            { name: "Sneakers & Retro", href: "/shop/sneakers" },
            { name: "Botas", href: "/shop/botas" },
            { name: "Sandalias", href: "/shop/sandalias" },
          ],
        },
      ],
    },
    {
      title: "Mujer",
      value: "Mujer",
      href: "/shop/mujer",
      columns: [
        {
          heading: "ROPA SUPERIOR",
          items: [
            { name: "Tops y Corsets", href: "/shop/tops" },
            { name: "Camisetas Gráficas", href: "/shop/camisetas" },
            { name: "Sudaderas y Buzos", href: "/shop/sudaderas" },
            { name: "Chaquetas y Abrigos", href: "/shop/chaquetas" },
          ],
        },
        {
          heading: "ROPA INFERIOR",
          items: [
            { name: "Jeans y Pantalones", href: "/shop/jeans" },
            { name: "Faldas (Mini/Maxi)", href: "/shop/faldas" },
            { name: "Shorts", href: "/shop/shorts" },
            { name: "Vestidos y Conjuntos", href: "/shop/vestidos" },
          ],
        },
        {
          heading: "CALZADO",
          items: [
            { name: "Deportivos", href: "/shop/sneakers" },
            { name: "Botas y Plataformas", href: "/shop/botas" },
            { name: "Sandalias", href: "/shop/sandalias" },
          ],
        },
      ],
    },
    {
      title: "Niños",
      value: "Niños",
      href: "/shop/ninos",
      columns: [
        {
          heading: "ROPA",
          items: [
            { name: "Camisetas y Polos", href: "/shop/camisetas" },
            { name: "Abrigos y Chompas", href: "/shop/abrigos" },
            { name: "Pantalones y Jeans", href: "/shop/pantalones" },
            { name: "Conjuntos", href: "/shop/conjuntos" },
          ],
        },
        {
          heading: "CALZADO Y ACCESORIOS",
          items: [
            { name: "Zapatos", href: "/shop/zapatos" },
            { name: "Gorras y Mochilas", href: "/shop/accesorios" },
            { name: "Ropa de Bebé (0-24m)", href: "/shop/bebe" },
          ],
        },
      ],
    },
    {
      title: "Accesorios",
      value: "Unisex",
      href: "/shop/accesorios",
      columns: [
        {
          heading: "CABEZA",
          items: [
            { name: "Gorras (Snapbacks/Trucker)", href: "/shop/gorras" },
            { name: "Gorros (Beanies)", href: "/shop/beanies" },
            { name: "Sombreros (Bucket Hats)", href: "/shop/bucket-hats" },
          ],
        },
        {
          heading: "EQUIPAJE",
          items: [
            { name: "Mochilas", href: "/shop/mochilas" },
            { name: "Bolsos y Totes", href: "/shop/bolsos" },
            { name: "Cangureras", href: "/shop/cangureras" },
          ],
        },
        {
          heading: "OTROS",
          items: [
            { name: "Gafas de Sol", href: "/shop/gafas" },
            { name: "Cinturones", href: "/shop/cinturones" },
            { name: "Bufandas", href: "/shop/bufandas" },
          ],
        },
      ],
    },
  ];

  return (
    // CAMBIO IMPORTANTE: z-100 para asegurar que esté encima de la barra negra (que tiene z-50)
    <header className="sticky top-0 z-[100] w-full bg-white border-b font-sans shadow-sm">
      <div className="bg-black text-white text-[10px] py-1.5 text-center font-bold tracking-widest uppercase">
        Envíos Gratis a todo Ecuador en compras sobre $80
      </div>

      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group z-50 relative"
          >
            <span className="text-3xl font-black tracking-tighter italic group-hover:opacity-70 transition-opacity">
              AVNYC.
            </span>
          </Link>

          {/* --- MENÚ ESCRITORIO --- */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              {nestedCategories.map((category) => (
                <NavigationMenuItem key={category.title}>
                  <NavigationMenuTrigger className="font-bold uppercase text-xs tracking-[0.15em] bg-transparent hover:bg-zinc-100 data-[state=open]:bg-zinc-100">
                    {category.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] lg:w-[800px] p-8 bg-white shadow-xl">
                      <div className="flex justify-between items-start mb-6 border-b border-zinc-100 pb-4">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                          Colección {category.title}
                        </h3>
                        <NavigationMenuLink asChild>
                          <Link
                            href={category.href}
                            className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors flex items-center gap-1"
                          >
                            Ver Todo <ChevronRight size={12} />
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <div
                        className={`grid ${
                          category.columns.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                        } gap-8`}
                      >
                        {category.columns.map((col, idx) => (
                          <div key={idx} className="flex flex-col gap-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-black border-l-2 border-black pl-3">
                              {col.heading}
                            </h4>
                            <ul className="space-y-2.5">
                              {col.items.map((item) => (
                                <li key={item.name}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      href={`${item.href}?gender=${category.value}`}
                                      className="text-xs font-medium text-zinc-500 hover:text-black hover:underline decoration-1 underline-offset-4 transition-all block"
                                    >
                                      {item.name}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <Link
                  href="/shop/new"
                  className={`${navigationMenuTriggerStyle()} font-bold uppercase text-xs tracking-[0.15em]`}
                >
                  Nuevos
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/shop/ofertas"
                  className={`${navigationMenuTriggerStyle()} font-bold uppercase text-xs tracking-[0.15em] text-red-600 hover:text-red-700 hover:bg-red-50`}
                >
                  Ofertas
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* --- ICONOS Y ACCIONES --- */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-10 h-10 w-[200px] text-xs font-medium bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 focus:w-[280px] transition-all duration-300 rounded-full"
                onChange={(e) =>
                  onSearchChange && onSearchChange(e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <FavoritesSheet />
              <CartSheet />
              <Link href="/login" className="ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-zinc-100"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* --- MENÚ MÓVIL --- */}
          <div className="flex lg:hidden items-center gap-2">
            <CartSheet />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 text-black"
                >
                  <MenuIcon className="h-7 w-7" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:w-[400px] p-0 flex flex-col bg-white border-none shadow-2xl h-full z-[999]"
              >
                <SheetHeader className="px-6 py-5 border-b border-zinc-100 flex flex-row items-center justify-between sticky top-0 bg-white z-20">
                  <SheetTitle className="text-3xl font-black italic tracking-tighter m-0">
                    AVNYC.
                  </SheetTitle>
                </SheetHeader>

                <div className="px-6 py-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                      type="search"
                      placeholder="Buscar productos..."
                      className="pl-12 h-14 bg-zinc-100 border-transparent rounded-full text-base focus:bg-white focus:border-black focus:ring-0 transition-all shadow-sm"
                      onChange={(e) =>
                        onSearchChange && onSearchChange(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-20">
                  <div className="flex flex-col gap-2 mb-6">
                    <Link
                      href="/shop/new"
                      onClick={closeMenu}
                      className="group flex items-center justify-between py-4 border-b border-zinc-100"
                    >
                      <span className="text-sm font-bold uppercase tracking-widest group-hover:text-zinc-600 transition-colors">
                        Nuevos Ingresos
                      </span>
                      <ArrowRight
                        size={16}
                        className="text-black group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                    <Link
                      href="/shop/ofertas"
                      onClick={closeMenu}
                      className="group flex items-center justify-between py-4 border-b border-zinc-100"
                    >
                      <span className="text-sm font-bold uppercase tracking-widest text-red-600 group-hover:text-red-700 transition-colors">
                        Ofertas
                      </span>
                      <Tag size={16} className="text-red-600" />
                    </Link>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full border-none"
                  >
                    {nestedCategories.map((category) => (
                      <AccordionItem
                        key={category.title}
                        value={category.title}
                        className="border-b border-zinc-100 last:border-none"
                      >
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-widest py-5 hover:no-underline hover:text-zinc-600 transition-colors">
                          {category.title}
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                          <div className="flex flex-col gap-6 pl-2">
                            <Link
                              href={category.href}
                              onClick={closeMenu}
                              className="text-xs font-bold underline decoration-2 underline-offset-4 block uppercase"
                            >
                              VER TODO {category.title}
                            </Link>
                            {category.columns.map((col, idx) => (
                              <div key={idx}>
                                <h5 className="text-[10px] font-bold uppercase text-zinc-400 mb-3 tracking-[0.2em]">
                                  {col.heading}
                                </h5>
                                <div className="flex flex-col gap-3 pl-4 border-l border-zinc-200">
                                  {col.items.map((item) => (
                                    <Link
                                      key={item.name}
                                      href={`${item.href}?gender=${category.value}`}
                                      onClick={closeMenu}
                                      className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-zinc-100 z-20">
                  <Link href="/login" onClick={closeMenu}>
                    <Button className="w-full h-14 text-sm font-bold uppercase tracking-widest bg-black text-white hover:bg-zinc-800 rounded-full shadow-lg">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};
