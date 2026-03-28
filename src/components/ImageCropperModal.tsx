import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  imageUrl: string;
  onCrop: (base64Image: string) => void;
  onCancel: () => void;
}

export function ImageCropperModal({ imageUrl, onCrop, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      // Auto-scale to fit nicely
      const minScale = Math.max(200 / img.width, 200 / img.height);
      setScale(Math.max(1, minScale));
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 200, 200);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 200, 200);

    const w = image.width * scale;
    const h = image.height * scale;
    const x = (200 - w) / 2 + position.x;
    const y = (200 - h) / 2 + position.y;

    ctx.drawImage(image, x, y, w, h);
  }, [image, scale, position]);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/webp", 0.8);
      onCrop(dataUrl);
    }
  };

  return (
    <div class="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-2xl border border-foreground/10 bg-background p-lg shadow-xl">
        <h2 class="mb-md text-lg font-semibold text-foreground">调整图标</h2>

        <div class="mb-md flex flex-col items-center gap-md">
          <div class="relative size-[200px] overflow-hidden rounded-full border-2 border-primary/50">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              class="cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div class="w-full px-lg">
            <label class="mb-sm block text-sm text-muted">缩放</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat((e.target as HTMLInputElement).value))}
              class="w-full accent-primary"
            />
          </div>
        </div>

        <div class="flex justify-end gap-sm">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
          >
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  );
}
