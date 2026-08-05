import product1 from "@/assets/product-1.jpg";
import product1b from "@/assets/product-1b.jpg";
import product2 from "@/assets/product-2.jpg";
import product2b from "@/assets/product-2b.jpg";
import product3 from "@/assets/product-3.jpg";
import product3b from "@/assets/product-3b.jpg";
import product4 from "@/assets/product-4.jpg";
import product4b from "@/assets/product-4b.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  hoverImage: string;
  tag?: string;
};

export const featured: Product[] = [
  {
    id: "atelier-coat",
    name: "Atelier Belted Coat",
    category: "Outerwear",
    price: "$1,290",
    image: product1,
    hoverImage: product1b,
    tag: "New",
  },
  {
    id: "cloud-knit",
    name: "Cloud Cashmere Knit",
    category: "Knitwear",
    price: "$480",
    image: product2,
    hoverImage: product2b,
  },
  {
    id: "column-trouser",
    name: "Column Wool Trouser",
    category: "Tailoring",
    price: "$390",
    image: product3,
    hoverImage: product3b,
  },
  {
    id: "monolith-trench",
    name: "Monolith Trench",
    category: "Outerwear",
    price: "$1,540",
    image: product4,
    hoverImage: product4b,
    tag: "Limited",
  },
];

export const bestSellers: Product[] = [
  {
    id: "column-trouser-b",
    name: "Column Wool Trouser",
    category: "Tailoring",
    price: "$390",
    image: product3,
    hoverImage: product3b,
  },
  {
    id: "cloud-knit-b",
    name: "Cloud Cashmere Knit",
    category: "Knitwear",
    price: "$480",
    image: product2,
    hoverImage: product2b,
  },
  {
    id: "monolith-trench-b",
    name: "Monolith Trench",
    category: "Outerwear",
    price: "$1,540",
    image: product4,
    hoverImage: product4b,
  },
  {
    id: "atelier-coat-b",
    name: "Atelier Belted Coat",
    category: "Outerwear",
    price: "$1,290",
    image: product1,
    hoverImage: product1b,
  },
];