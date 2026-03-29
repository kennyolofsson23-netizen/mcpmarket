"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  value: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ trigger, children, isOpen, onToggle, value }: AccordionItemProps) {
  const contentId = `accordion-content-${value}`;
  const triggerId = `accordion-trigger-${value}`;
  return (
    <div className="border-b border-border">
      <h3>
        <button
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          className="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:underline"
        >
          {trigger}
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className={cn("overflow-hidden text-sm", isOpen ? "pb-4" : "")}
      >
        {isOpen && children}
      </div>
    </div>
  );
}

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
  defaultValue?: string;
}

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: new Set(),
  toggle: () => {},
});

function Accordion({ type = "single", collapsible = true, className, children, defaultValue }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(
    defaultValue ? new Set([defaultValue]) : new Set()
  );

  const toggle = React.useCallback((value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        if (collapsible || next.size > 1) next.delete(value);
      } else {
        if (type === "single") next.clear();
        next.add(value);
      }
      return next;
    });
  }, [type, collapsible]);

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("divide-y divide-border rounded-md border border-border", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItemWrapper({ value, trigger, children }: { value: string; trigger: React.ReactNode; children: React.ReactNode }) {
  const { openItems, toggle } = React.useContext(AccordionContext);
  return (
    <AccordionItem
      value={value}
      trigger={trigger}
      isOpen={openItems.has(value)}
      onToggle={() => toggle(value)}
    >
      {children}
    </AccordionItem>
  );
}

export { Accordion, AccordionItemWrapper as AccordionItem };
