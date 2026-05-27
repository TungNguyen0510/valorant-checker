import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Valorant Checker",
    short_name: "ValChecker",
    description: "Check your daily Valorant store, Night Market, and inventory details.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1923",
    theme_color: "#FF4655",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
