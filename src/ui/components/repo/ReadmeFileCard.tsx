"use client";
import Button from "@ui/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

export interface ReadmeFileCardProps {
  name: string;
  size: number; // bytes
  updatedAt: Date | string;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function ReadmeFileCard({
  name,
  size,
  updatedAt,
  onPreview,
  onEdit,
  onDelete,
}: ReadmeFileCardProps) {
  const date = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
  return (
    <div className="flex items-center justify-between p-3 rounded border shadow-1 hover:bg-subtle">
      <div className="space-y-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted">
          {formatSize(size)} • {date.toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onPreview} aria-label="Preview README">
          <Eye className="w-4 h-4 mr-1" /> Preview
        </Button>
        <Button variant="outline" onClick={onEdit} aria-label="Edit README">
          <Pencil className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          onClick={onDelete}
          aria-label="Delete README"
        >
          <Trash2 className="w-4 h-4 mr-1 text-danger" /> Delete
        </Button>
      </div>
    </div>
  );
}
