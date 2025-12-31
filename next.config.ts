// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "djvganjsojcmdjmwsapb.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "logos-world.net" },
    ],
  },
};
export default nextConfig;
