"use server";

import { createClient } from "../lib/supabase";
const nodemailer = require("nodemailer");

export async function notifyPriceDrop(
  productId: string,
  productTitle: string,
  newPrice: number,
  imageUrl: string
) {
  try {
    const supabase = createClient();

    // 1. Buscamos a los interesados
    const { data: users } = await supabase
      .from("product_favorites")
      .select("user_email")
      .eq("product_id", productId)
      .not("user_email", "is", null);

    if (!users || users.length === 0) return { success: true, count: 0 };

    const emails = users.map((u) => u.user_email).filter(Boolean) as string[];
    if (emails.length === 0) return { success: true, count: 0 };

    // 2. Configurar Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // --- CONFIGURACIÓN DEL LINK ---
    // El botón llevará a tu tienda. Si tienes una página de producto específica,
    // puedes cambiar esto por: `https://avny-store.vercel.app/product/${productId}`
    const shopLink = "https://avny-store.vercel.app/";

    // 3. Diseño Editorial (Más texto, más elegante, botón funcional)
    const mailOptions = {
      from: `"AVNYC Store" <${process.env.GMAIL_USER}>`,
      bcc: emails,
      subject: `Invitación Exclusiva: Nuevo precio en ${productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #000000;">
            
            <div style="max-width: 600px; margin: 0 auto; padding: 0px;">
                
                <div style="padding: 40px 20px; text-align: center; border-bottom: 1px solid #000000;">
                    <p style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
                        AUTHENTIC VINTAGE NYC
                    </p>
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; margin-top: 10px; color: #666;">
                        Curated Collection
                    </p>
                </div>

                <div style="padding: 60px 40px;">
                    <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; color: #000;">
                        Actualización de Lista de Deseos
                    </p>

                    <h1 style="font-family: 'Playfair Display', serif; font-size: 38px; line-height: 1.1; font-weight: 400; margin: 0 0 30px 0;">
                        El estilo que define tu esencia, ahora más cerca.
                    </h1>

                    <p style="font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 40px; max-width: 480px;">
                        Notamos que tienes un ojo excepcional para las piezas únicas. El artículo que guardaste en tu selección personal ha recibido una actualización de precio exclusiva.
                        <br><br>
                        En AVNYC creemos que la moda vintage no es solo ropa, es historia. Esta es tu oportunidad para adquirir una pieza atemporal antes de que pase a manos de otro coleccionista.
                    </p>

                    <div style="border: 1px solid #f0f0f0; padding: 0;">
                        <img src="${imageUrl}" style="width: 100%; height: auto; display: block; filter: contrast(1.1);" />
                        
                        <div style="padding: 30px; display: flex; justify-content: space-between; align-items: center; background-color: #fafafa;">
                            <div>
                                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 5px 0;">
                                    Pieza Seleccionada
                                </p>
                                <p style="font-family: 'Playfair Display', serif; font-size: 20px; margin: 0; font-weight: 700;">
                                    ${productTitle}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <p style="text-decoration: line-through; color: #999; font-size: 14px; margin: 0;">Anterior</p>
                                <p style="font-size: 28px; font-weight: 600; margin: 0; color: #000;">$${newPrice}</p>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 50px;">
                        <a href="${shopLink}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 20px 50px; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; transition: all 0.3s;">
                            Acceder a la Tienda
                        </a>
                        <p style="font-size: 12px; color: #888; margin-top: 20px; font-style: italic;">
                            Disponibilidad sujeta a stock. Piezas únicas.
                        </p>
                    </div>
                </div>

                <div style="background-color: #000000; color: #ffffff; padding: 40px 20px; text-align: center;">
                    <p style="font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 20px;">AVNYC</p>
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin: 0;">
                        New York • Vintage • Timeless
                    </p>
                    <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                        <p style="font-size: 10px; color: #444;">
                            Recibes este correo porque te suscribiste a alertas de precio en nuestra tienda.<br>
                            Si ya no deseas recibir estas notificaciones, ignora este mensaje.
                        </p>
                    </div>
                </div>

            </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, count: emails.length };
  } catch (error) {
    console.error("Error enviando correos con Gmail:", error);
    return { success: false, error };
  }
}
