import MenuClient from "@/components/menu-client";
import { baseURL } from "@/lib/axios";

export type ApiCategory = {
  id: string;
  title: string;
  url: string;
  product_count?: number;
  children?: ApiCategory[];
};

async function getCategories(): Promise<ApiCategory[]> {
  const response = await fetch(`${baseURL}/categories`, {
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export default async function Menu() {
  const menus = await getCategories();

  return <MenuClient menus={menus} />;
}
