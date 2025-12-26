"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
// Ajusta esta ruta según donde tengas tu carpeta lib (tú dijiste ../app/lib/supabase)
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
  // MODIFICACIÓN: Ahora acepta un segundo parámetro opcional
  toggleFavorite: (item: FavoriteItem, manualContact?: UserContact) => void;
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

  useEffect(() => {
    const storedFavs = localStorage.getItem("avnyc-favorites");
    const storedContact = localStorage.getItem("avnyc-contact");
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedContact) setUserContact(JSON.parse(storedContact));
    setIsInitialized(true);
  }, []);

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

  // --- FUNCIÓN DE GUARDADO EN NUBE ---
  const saveFavoriteToCloud = async (
    item: FavoriteItem,
    contact: UserContact
  ) => {
    console.log("INTENTANDO GUARDAR EN NUBE:", item.title);

    if (!contact.email && !contact.whatsapp) return;

    try {
      const { error } = await supabase.from("product_favorites").insert({
        product_id: item.id,
        product_title: item.title,
        user_email: contact.email || null,
        user_whatsapp: contact.whatsapp || null,
      });

      if (error) {
        console.error("Error Supabase:", error.message);
      } else {
        console.log("¡GUARDADO EN SUPABASE!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = (item: FavoriteItem, manualContact?: UserContact) => {
    // TRUCO: Usamos el contacto manual si existe, si no, usamos el de la memoria
    const contactToUse = manualContact || userContact;

    if (isFavorite(item.id)) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
      toast.info("Eliminado de favoritos");
    } else {
      setFavorites((prev) => [...prev, item]);
      toast.success("¡Guardado!", {
        description: "Te avisaremos si hay ofertas.",
      });

      // Si tenemos un contacto válido (manual o memoria), guardamos en la nube
      if (contactToUse) {
        saveFavoriteToCloud(item, contactToUse);
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
