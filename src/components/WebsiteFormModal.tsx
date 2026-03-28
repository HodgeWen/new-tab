import { useState } from "preact/hooks";

import { ImageCropperModal } from "./ImageCropperModal";

import { addWebsite, removeWebsite, updateWebsite } from "@/stores/websitesStore";
import type { Website } from "@/types/persistence";

interface Props {
  website: Website | null; // null means not open, empty object means add
  onClose: () => void;
}

export function WebsiteFormModal({ website, onClose }: Props) {
  if (!website) return null;

  const isEdit = !!website.id;
  const [url, setUrl] = useState(website.url || "");
  const [name, setName] = useState(website.name || "");
  const [icon, setIcon] = useState(website.icon || "");
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (isEdit) {
      await updateWebsite(website.id, { url: finalUrl, name: name.trim(), icon });
    } else {
      await addWebsite({ url: finalUrl, name: name.trim(), icon, groupId: null });
    }
    onClose();
  };

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          setCropImageUrl(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = (base64: string) => {
    setIcon(base64);
    setCropImageUrl(null);
  };

  const handleDelete = async () => {
    if (confirm("确定要删除此快捷方式吗？")) {
      await removeWebsite(website.id);
      onClose();
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-lg shadow-xl">
        <h2 class="mb-lg text-xl font-semibold text-foreground">
          {isEdit ? "编辑快捷方式" : "添加快捷方式"}
        </h2>

        <form onSubmit={handleSubmit} class="space-y-md">
          <div>
            <label class="mb-sm block text-sm font-medium text-foreground">网址 URL</label>
            <input
              type="text"
              required
              value={url}
              onInput={(e) => setUrl((e.target as HTMLInputElement).value)}
              placeholder="example.com"
              class="w-full rounded-lg border border-foreground/10 bg-transparent px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label class="mb-sm block text-sm font-medium text-foreground">名称 (选填)</label>
            <input
              type="text"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="自动获取或自定义"
              class="w-full rounded-lg border border-foreground/10 bg-transparent px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label class="mb-sm block text-sm font-medium text-foreground">图标</label>
            <div class="flex items-center gap-md">
              <div class="flex size-12 items-center justify-center overflow-hidden rounded-full bg-secondary">
                {icon ? (
                  <img src={icon} alt="Icon" class="size-full object-cover" />
                ) : (
                  <span class="text-xs text-muted">默认</span>
                )}
              </div>
              <div class="flex flex-col gap-2">
                <label class="cursor-pointer rounded-md bg-foreground/5 px-3 py-1.5 text-sm font-medium hover:bg-foreground/10">
                  上传自定义图标
                  <input type="file" accept="image/*" class="hidden" onChange={handleFileChange} />
                </label>
                {icon && (
                  <button
                    type="button"
                    class="text-left text-sm text-destructive hover:underline"
                    onClick={() => setIcon("")}
                  >
                    使用默认图标
                  </button>
                )}
              </div>
            </div>
          </div>

          <div class="mt-xl flex justify-end gap-sm">
            {isEdit && (
              <button
                type="button"
                class="mr-auto rounded-lg px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                删除
              </button>
            )}
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium hover:bg-foreground/5"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              保存
            </button>
          </div>
        </form>
      </div>

      {cropImageUrl && (
        <ImageCropperModal
          imageUrl={cropImageUrl}
          onCrop={handleCrop}
          onCancel={() => setCropImageUrl(null)}
        />
      )}
    </div>
  );
}
