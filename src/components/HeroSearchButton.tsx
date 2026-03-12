"use client";

import InteractiveHoverButton from "@/components/ui/interactive-hover-button";

export default function HeroSearchButton() {
  const handleSearch = () => {
    document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="mt-2 w-full">
      <InteractiveHoverButton 
        text="Search Fleet" 
        loadingText="Searching..." 
        successText="Found vehicles!" 
        classes="w-full h-14 rounded-xl text-lg font-bold shadow-md"
        onClick={handleSearch}
      />
    </div>
  );
}
