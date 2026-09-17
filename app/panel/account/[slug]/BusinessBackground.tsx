import { baseURL } from "@/lib/axios";
import BusinessBackgroundClient from "./BusinessBackgroundClient";

export type ApiCategory = {
  id: string;
  title: string;
  url: string;
  children?: ApiCategory[];
};

async function getCategories(): Promise<ApiCategory[]> {
  const response = await fetch(`${baseURL}/categories`, {
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export default async function BusinessBackgroundPage() {
  const categories = await getCategories();

  return <BusinessBackgroundClient categories={categories} />;
}
