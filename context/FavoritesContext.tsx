"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

type FavoriteItem = {
  id: string;
  title: string;
  image: string;
  price: number;
  category: string;
  color: string; // Guardamos color referencial
  size: string; // Guardamos talla referencial
};

type UserContact = {
  email?: string;
  whatsapp?: string;
};

interface FavoritesContextType {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  favoritesCount: number;
  userContact: UserContact | null;
  saveUserContact: (data: UserContact) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [userContact, setUserContact] = useState<UserContact | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Cargar datos de LocalStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem("avnyc-favorites");
    const storedContact = localStorage.getItem("avnyc-contact");

    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedContact) setUserContact(JSON.parse(storedContact));

    setIsInitialized(true);
  }, []);

  // 2. Guardar cambios en LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("avnyc-favorites", JSON.stringify(favorites));
    }
  }, [favorites, isInitialized]);

  useEffect(() => {
    if (isInitialized && userContact) {
      localStorage.setItem("avnyc-contact", JSON.stringify(userContact));
    }
  }, [userContact, isInitialized]);

  const saveUserContact = (data: UserContact) => {
    setUserContact(data);
    // Aquí podrías enviar estos datos a Supabase en el futuro para marketing real
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
      toast.info("Eliminado de favoritos");
    } else {
      setFavorites((prev) => [...prev, item]);
      toast.success("¡Guardado en favoritos!", {
        description: "Te avisaremos si baja de precio.",
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
        userContact,
        saveUserContact,
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
