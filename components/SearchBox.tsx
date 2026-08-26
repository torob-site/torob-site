// ─── SearchBox.tsx ───
"use client";

import { useGetAutoComplete } from "@/lib/apis";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type Suggestion = {
  type: "text" | "shop";
  text: string;
  logo?: string;
  is_history: boolean;
};

type SearchBoxProps = {
  children: (props: {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    isDirty: boolean;
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    suggestions: Suggestion[];
    isPending: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearch: () => void;
    selectSuggestion: (text: string) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    selectedIndex: number;
    resetSelectedIndex: () => void;
    wrapperRef: React.RefObject<HTMLDivElement | null>;
  }) => React.ReactNode;
};

export default function SearchBox({ children }: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // فقط وقتی کاربر تایپ کرده باشه درخواست autocomplete بره
  const { data: suggestions = [], isPending } = useGetAutoComplete(
    isDirty ? query : ""
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log(file);
  }

  function resetSelectedIndex() {
    setSelectedIndex(-1);
  }

  // تابع کمکی برای ناوبری هوشمند
  function navigateToSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;
    
    const trimmedQuery = searchQuery.trim();
    const currentQuery = searchParams.get("query");
    
    // اگر در صفحه جستجو هستیم و query یکسان است، هیچ کاری نکن
    if (pathname === "/search" && currentQuery === trimmedQuery) {
      setOpen(false);
      return;
    }
    
    const searchUrl = `/search?query=${encodeURIComponent(trimmedQuery)}`;
    
    // اگر در صفحه جستجو هستیم، از router.push استفاده کن
    if (pathname === "/search") {
      router.push(searchUrl);
    } else {
      // در غیر این صورت از window.location استفاده کن
      window.location.href = searchUrl;
    }
    
    setOpen(false);
  }

  function selectSuggestion(text: string) {
    if (!text.trim()) return;
    navigateToSearch(text);
  }

  function handleSearch() {
    if (!query.trim()) return;
    navigateToSearch(query);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (!suggestions.length) return;
      event.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      if (!suggestions.length) return;
      event.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (open && selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex].text);
      } else {
        handleSearch();
      }
    }
  }

  return children({
    query,
    setQuery,
    isDirty,
    setIsDirty,
    open,
    setOpen,
    suggestions,
    isPending,
    fileInputRef,
    handleFileChange,
    handleSearch,
    selectSuggestion,
    handleKeyDown,
    selectedIndex,
    resetSelectedIndex,
    wrapperRef,
  });
}