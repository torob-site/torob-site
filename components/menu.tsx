import MenuClient from "@/components/menu-client";

export type ApiCategory = {
  id: string;
  title: string;
  url: string;
  children?: ApiCategory[];
};

async function getCategories(): Promise<ApiCategory[]> {
  const response = await fetch(`http://localhost:3001/categories`, {
    next: {
      revalidate: 3600,
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
