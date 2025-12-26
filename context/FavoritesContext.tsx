"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

// Definimos qué guardamos de cada favorito
type FavoriteItem = {
  id: string;
  title: string;
  image: string;
  price: number;
  category: string;
  slug?: string; // Opcional, por si usas urls amigables
};

interface FavoritesContextType {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Cargar favoritos de LocalStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("avnyc-favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
    setIsInitialized(true);
  }, []);

  // 2. Guardar en LocalStorage cada vez que cambien
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("avnyc-favorites", JSON.stringify(favorites));
    }
  }, [favorites, isInitialized]);

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      // Si ya existe, lo quitamos
      setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
      toast.info("Eliminado de favoritos", { duration: 2000 });
    } else {
      // Si no existe, lo agregamos
      setFavorites((prev) => [...prev, item]);
      toast.success("¡Agregado a favoritos!", {
        description: "Guardado en tu lista de deseos.",
        duration: 2000,
      });
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return context;
};
