import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string | null | undefined;
  maxLength?: number;
  className?: string;
}

export function TruncatedText({
  text,
  maxLength = 50,
  className = "",
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text === "-") {
    return <span className={className}>-</span>;
  }

  const shouldTruncate = text.length > maxLength;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  const truncatedText = text.substring(0, maxLength);

  if (isExpanded) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <span>{text}</span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 w-fit text-primary text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
        >
          Show less
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="truncate">{truncatedText}...</span>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 flex-shrink-0 text-primary text-xs whitespace-nowrap"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        Show more
      </Button>
    </div>
  );
}

