"use client";

import { scrape } from "@/lib/actions";
import { FormEvent, useState } from "react";

const SearchBar = () => {
  const isValidAmazonLink = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      if (
        hostname.includes("amazon.com") ||
        hostname.includes("amazon.") ||
        hostname.endsWith("amazon")
      ) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };
  const [searchPrompt, setSearchPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidLink = isValidAmazonLink(searchPrompt);
    if (!isValidLink) return alert("Please Enter a valid amazon link");
    try {
      setLoading(true);
    await scrape(searchPrompt)
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        className="searchbar-input"
        placeholder="Enter Product Link"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
      />
      <button
        type="submit"
        disabled={searchPrompt === "" ? true : false}
        className="searchbar-btn"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;
