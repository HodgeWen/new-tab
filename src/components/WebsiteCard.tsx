import { useState } from "preact/hooks";

import { isSelectionMode, selectedWebsites, toggleSelect } from "@/stores/websitesStore";
import type { Website } from "@/types/persistence";

interface Props {
  website: Website;
  onContextMenu: (e: MouseEvent, website: Website) => void;
  onDragStart: (e: DragEvent, id: string) => void;
  onDragOver: (e: DragEvent, id: string) => void;
  onDrop: (e: DragEvent, id: string) => void;
  isDragging: boolean;
  isDragTarget: boolean;
}

export function WebsiteCard({
  website,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragTarget,
}: Props) {
  const isSelected = selectedWebsites.value.has(website.id);
  const mode = isSelectionMode.value;

  const [imgError, setImgError] = useState(false);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (mode) {
      toggleSelect(website.id);
    } else {
      window.location.href = website.url;
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    if (mode) {
      toggleSelect(website.id);
    } else {
      onContextMenu(e, website);
    }
  };

  const domain = new URL(website.url).hostname;
  const initial = website.name
    ? website.name.charAt(0).toUpperCase()
    : domain.charAt(0).toUpperCase();
  const fallbackColor = `hsl(${(domain.length * 40) % 360}, 60%, 50%)`;

  let iconSrc = website.icon;
  if (!iconSrc || (imgError && iconSrc.startsWith("http"))) {
    // Favicon fallback if custom icon fails or not provided
    iconSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }

  return (
    <div
      class={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl p-2 text-center shadow-sm transition-all duration-200 
      ${isSelected ? "border-2 border-primary bg-primary/10" : "border border-foreground/5 bg-foreground/[0.03] hover:scale-105 hover:bg-foreground/[0.08]"}
      ${isDragging ? "opacity-40" : ""}
      ${isDragTarget ? "border-2 border-dashed border-primary" : ""}
      `}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      draggable={!mode}
      onDragStart={(e) => onDragStart(e, website.id)}
      onDragOver={(e) => onDragOver(e, website.id)}
      onDrop={(e) => onDrop(e, website.id)}
      title={website.name || website.url}
    >
      {mode && (
        <div class="absolute left-2 top-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(website.id)}
            class="size-4 cursor-pointer accent-primary"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div class="mb-2 flex size-12 items-center justify-center overflow-hidden rounded-full bg-background shadow-inner">
        {imgError && !website.icon ? (
          <span
            class="text-xl font-bold text-white"
            style={{
              backgroundColor: fallbackColor,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {initial}
          </span>
        ) : (
          <img
            src={iconSrc}
            alt={website.name}
            class="size-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <span class="w-full truncate px-1 text-xs font-medium text-foreground">
        {website.name || domain}
      </span>
    </div>
  );
}
