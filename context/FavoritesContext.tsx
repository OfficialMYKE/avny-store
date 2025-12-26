"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { createClient } from "../app/lib/supabase";

type FavoriteItem = {
  id: string;
  title: string;
  image: string;
  price: number;
  category: string;
  color: string;
  size: string;
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
  const supabase = createClient();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [userContact, setUserContact] = useState<UserContact | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Cargar de LocalStorage al inicio
  useEffect(() => {
    const storedFavs = localStorage.getItem("avnyc-favorites");
    const storedContact = localStorage.getItem("avnyc-contact");

    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedContact) setUserContact(JSON.parse(storedContact));

    setIsInitialized(true);
  }, []);

  // 2. Sincronizar LocalStorage
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
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  // --- LÓGICA DE GUARDADO EN NUBE ---
  const saveFavoriteToCloud = async (
    item: FavoriteItem,
    contact: UserContact
  ) => {
    if (!contact.email && !contact.whatsapp) return;

    try {
      // Insertamos en la tabla que creamos en Supabase
      const { error } = await supabase.from("product_favorites").insert({
        product_id: item.id,
        product_title: item.title,
        user_email: contact.email || null,
        user_whatsapp: contact.whatsapp || null,
      });

      if (error) console.error("Error guardando lead:", error);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
      toast.info("Eliminado de favoritos");
      // Opcional: Podrías borrarlo también de Supabase si quisieras
    } else {
      setFavorites((prev) => [...prev, item]);
      toast.success("¡Guardado!", {
        description: "Te avisaremos si hay ofertas.",
      });

      // SI YA TENEMOS CONTACTO, GUARDAMOS EL LEAD EN LA NUBE
      if (userContact) {
        saveFavoriteToCloud(item, userContact);
      }
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
        // Al guardar contacto nuevo, intentamos sincronizar favoritos pendientes si quisieras
        saveUserContact: (contact) => {
          saveUserContact(contact);
          // Aquí podrías iterar sobre los favoritos actuales y subirlos a Supabase
          // para asegurar que se guarden los que dio like antes de poner su email.
          favorites.forEach((fav) => saveFavoriteToCloud(fav, contact));
        },
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
