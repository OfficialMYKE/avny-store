"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Mail, User } from "lucide-react";

interface InterestedUser {
  id: string;
  user_email: string | null;
  created_at: string;
}

export const InterestedUsers = ({
  productId,
  productTitle,
  currentPrice,
}: {
  productId: string;
  productTitle: string;
  currentPrice: number;
}) => {
  const [users, setUsers] = useState<InterestedUser[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      // Traemos solo los que tienen email
      const { data } = await supabase
        .from("product_favorites")
        .select("*")
        .eq("product_id", productId)
        .not("user_email", "is", null); // Filtramos vacíos

      if (data) setUsers(data);
    };

    fetchUsers();
  }, [productId]);

  const sendEmail = (email: string) => {
    const subject = `¡Oferta en ${productTitle}!`;
    const body = `Hola, \n\nEl producto "${productTitle}" que guardaste en favoritos ha bajado de precio a $${currentPrice}. \n\n¡Aprovecha antes de que se agote!`;
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };

  if (users.length === 0)
    return (
      <div className="mt-8 p-6 bg-zinc-50 border border-dashed rounded-lg text-center text-muted-foreground">
        <p>No hay alertas de correo configuradas para este producto.</p>
      </div>
    );

  return (
    <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-100 rounded-lg animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-lg font-black italic mb-4 flex items-center gap-2 text-blue-900">
        ALERTAS DE CORREO ({users.length})
        <span className="text-xs font-normal text-blue-700 not-italic">
          (Se enviarán automáticamente al bajar el precio)
        </span>
      </h3>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-white p-3 rounded border border-blue-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User size={16} className="text-blue-700" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-zinc-800">{user.user_email}</p>
                <p className="text-[10px] text-muted-foreground">
                  Registrado: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8"
              onClick={() => sendEmail(user.user_email!)}
              title="Enviar correo manual"
            >
              <Mail size={14} className="mr-2" /> Manual
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
