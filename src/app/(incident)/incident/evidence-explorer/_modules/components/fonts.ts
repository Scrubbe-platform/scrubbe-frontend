import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

// Matches the blueprint's --display / --sans / --mono font stack exactly.
export const displayFont = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });
export const sansFont = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
export const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"] });
