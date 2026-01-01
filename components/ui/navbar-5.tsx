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
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";

// IMPORTAR TUS COMPONENTES
import { CartSheet } from "../CartSheet";
import { FavoritesSheet } from "../FavoritesSheet";

interface NavbarProps {
  onSearchChange?: (term: string) => void;
}

export const Navbar5 = ({ onSearchChange }: NavbarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const closeMenu = () => setIsOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/shop/todos?search=${encodeURIComponent(searchValue)}`);
      closeMenu();
    }
  };

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
    <header className="sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-sm border-b font-sans shadow-sm transition-all">
      <div className="bg-zinc-950 text-white text-[10px] py-2 text-center font-bold tracking-[0.2em] uppercase">
        Envíos Gratis a todo Ecuador en compras sobre $80
      </div>

      <div className="container mx-auto px-4 py-3 md:py-4">
        <nav className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group z-50 relative shrink-0"
          >
            <span className="text-2xl md:text-3xl font-black tracking-tighter italic group-hover:text-zinc-600 transition-colors">
              AVNYC.
            </span>
          </Link>

          <div className="hidden lg:flex items-center justify-center flex-1">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {nestedCategories.map((category) => (
                  <NavigationMenuItem key={category.title}>
                    <NavigationMenuTrigger className="font-bold uppercase text-[11px] tracking-[0.15em] bg-transparent hover:bg-zinc-100 focus:bg-zinc-100 data-[state=open]:bg-zinc-100 h-9 px-4 rounded-full transition-colors">
                      {category.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[600px] lg:w-[800px] p-8 bg-white shadow-xl rounded-b-xl border-t-2 border-black">
                        <div className="flex justify-between items-start mb-8 border-b border-zinc-100 pb-4">
                          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
                            {category.title}
                          </h3>
                          <NavigationMenuLink asChild>
                            <Link
                              href={category.href}
                              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors flex items-center gap-2 group/link"
                            >
                              Ver Todo{" "}
                              <ArrowRight
                                size={14}
                                className="group-hover/link:translate-x-1 transition-transform"
                              />
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div
                          className={`grid ${
                            category.columns.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-3"
                          } gap-10`}
                        >
                          {category.columns.map((col, idx) => (
                            <div key={idx} className="flex flex-col gap-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                {col.heading}
                              </h4>
                              <ul className="space-y-3">
                                {col.items.map((item) => (
                                  <li key={item.name}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        href={`${item.href}?gender=${category.value}`}
                                        className="text-sm font-bold text-zinc-700 hover:text-black hover:underline decoration-1 underline-offset-4 transition-all block"
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

                {/* --- CORRECCIÓN: Uso de asChild para evitar legacyBehavior --- */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/shop/new"
                      className={`${navigationMenuTriggerStyle()} font-bold uppercase text-[11px] tracking-[0.15em] h-9 px-4 rounded-full`}
                    >
                      Nuevos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/shop/ofertas"
                      className={`${navigationMenuTriggerStyle()} font-bold uppercase text-[11px] tracking-[0.15em] text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-4 rounded-full`}
                    >
                      Ofertas
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {/* -------------------------------------------------------- */}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <form onSubmit={handleSearch} className="group relative mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
              <Input
                type="search"
                name="search"
                value={searchValue}
                placeholder="BUSCAR..."
                className="pl-10 pr-4 h-10 w-[180px] text-[11px] font-bold tracking-wider uppercase bg-zinc-50 border-zinc-200 rounded-full focus:bg-white focus:border-black focus:w-[260px] focus:ring-0 transition-all duration-300 placeholder:text-zinc-400"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
              />
            </form>

            <FavoritesSheet />
            <CartSheet />

            <Link href="/login" className="ml-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-100"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-1">
            <CartSheet />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-black hover:bg-transparent"
                >
                  <MenuIcon className="h-7 w-7" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:w-[400px] p-0 flex flex-col bg-white border-r border-zinc-200 z-[150]"
              >
                <SheetHeader className="px-6 py-5 border-b border-zinc-100 flex flex-row items-center justify-between sticky top-0 bg-white z-20">
                  <SheetTitle className="text-3xl font-black italic tracking-tighter m-0">
                    AVNYC.
                  </SheetTitle>
                </SheetHeader>

                <div className="px-6 py-6 border-b border-zinc-100">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="search"
                      value={searchValue}
                      placeholder="BUSCAR PRODUCTOS..."
                      className="pl-11 h-12 bg-zinc-100 border-transparent rounded-lg text-sm font-medium focus:bg-white focus:border-black focus:ring-0 transition-all uppercase placeholder:text-xs placeholder:tracking-widest"
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        if (onSearchChange) onSearchChange(e.target.value);
                      }}
                    />
                  </form>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="flex flex-col gap-1 mb-6">
                    <Link
                      href="/shop/new"
                      onClick={closeMenu}
                      className="flex items-center justify-between py-4 border-b border-zinc-100 group"
                    >
                      <span className="text-sm font-black uppercase tracking-widest group-hover:text-zinc-600 transition-colors">
                        Nuevos Ingresos
                      </span>
                      <ArrowRight
                        size={16}
                        className="text-black -rotate-45 group-hover:rotate-0 transition-transform duration-300"
                      />
                    </Link>
                    <Link
                      href="/shop/ofertas"
                      onClick={closeMenu}
                      className="flex items-center justify-between py-4 border-b border-zinc-100 group"
                    >
                      <span className="text-sm font-black uppercase tracking-widest text-red-600 group-hover:text-red-700 transition-colors">
                        Ofertas
                      </span>
                      <Tag size={16} className="text-red-600" />
                    </Link>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
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
                          <div className="flex flex-col gap-6 pl-2 animate-in slide-in-from-top-2 duration-200">
                            <Link
                              href={category.href}
                              onClick={closeMenu}
                              className="text-xs font-black underline decoration-2 underline-offset-4 block uppercase tracking-widest"
                            >
                              Ver Todo {category.title}
                            </Link>
                            {category.columns.map((col, idx) => (
                              <div key={idx}>
                                <h5 className="text-[10px] font-bold uppercase text-zinc-400 mb-3 tracking-[0.2em]">
                                  {col.heading}
                                </h5>
                                <div className="flex flex-col gap-3 pl-4 border-l-2 border-zinc-100">
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

                <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold uppercase text-zinc-400 tracking-widest">
                      Mi Cuenta
                    </span>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="p-2 bg-white border border-zinc-200 rounded-full hover:bg-black hover:text-white transition-colors"
                    >
                      <User size={18} />
                    </Link>
                  </div>
                  <Link href="/login" onClick={closeMenu}>
                    <Button className="w-full h-12 text-xs font-bold uppercase tracking-[0.2em] bg-black text-white hover:bg-zinc-800 shadow-lg">
                      Iniciar Sesión / Registrarse
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
