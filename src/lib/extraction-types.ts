export type ColorToken = {
  hex: string;
  count: number;
  role: string;
};

export type TypeToken = {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
};

export type ImageToken = {
  src: string;
  alt: string;
};

export type Extraction = {
  url: string;
  source: "web" | "figma";
  title: string;
  description: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  colors: ColorToken[];
  type: TypeToken[];
  images: ImageToken[];
  stats: { stylesheets: number; bytes: number; extractedAt: string };
};
