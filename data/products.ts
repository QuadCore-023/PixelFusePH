export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  description: string;
  category?: string;
  isAvailable?: boolean;
  ribbons?: string;
  autoRibbons?: string[];
  soldCount?: number;
  recentSoldCount?: number;
}

export const products: Product[] = [
  {
    id: "keychain-sm",
    name: "Small Keychain",
    price: 40,
    image: "/mock/small-keychain.jpg",
    description: "Cute pixel art small keychain perfect for keys or bags."
  },
  {
    id: "keychain-md",
    name: "Medium Keychain",
    price: 70,
    image: "/mock/medium-keychain.jpg",
    description: "Detailed medium-sized pixel art keychain."
  },
  {
    id: "keychain-lg",
    name: "Large Keychain",
    price: 95,
    image: "/mock/large-keychain.jpg",
    description: "Statement large pixel art keychain."
  },
  {
    id: "diy-bracelet",
    name: "DIY Bracelet Kit",
    price: 60,
    image: "/mock/diy-bracelet.jpg",
    description: "Everything you need to create your own pixel art bracelet."
  }
];
