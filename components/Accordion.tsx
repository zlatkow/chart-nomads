"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Info } from "lucide-react";

interface AccordionProps {
  title: string;
  children: ReactNode;
}

export default function Accordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center h-[35px] justify-between px-5 py-4 rounded-[10px] border border-yellow-500 bg-[#0f0f0f] text-yellow-500 hover:bg-black/40 transition-all duration-300"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 text-sm">
          <Info className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-yellow-500 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div
          ref={contentRef}
          className={`px-5 py-4 bg-[#0f0f0f] text-white text-sm rounded-b-lg ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
