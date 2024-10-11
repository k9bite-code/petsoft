"use client";

import { createContext, useState } from "react";

type SearchContextProviderProps = {
  children: React.ReactNode;
};

type SearchConextType = {
  searchText: string;
  handleChangeSearchText: (id: string) => void;
};

export const SearchContext = createContext<SearchConextType | null>(null);

export default function SearchContextProvider({
  children,
}: SearchContextProviderProps) {
  const [searchText, setSearchText] = useState("");

  function handleChangeSearchText(text: string) {
    setSearchText(text);
  }

  return (
    <SearchContext.Provider
      value={{
        searchText,
        handleChangeSearchText,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
