"use client";
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Button from '../../ui/button';

export interface Asset {
  id: string;
  name: string;
  url: string;
}

interface AssetPickerProps {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
  onUpload?: (file: File) => void;
}

export default function AssetPicker({ assets, onSelect, onUpload }: AssetPickerProps) {
  const [query, setQuery] = useState('');

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
      e.target.value = '';
    }
  };

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search assets..."
          className="border rounded px-2 py-1 flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {onUpload && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <Button variant="secondary">Upload</Button>
          </label>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {filtered.map((asset) => (
          <button
            key={asset.id}
            className="border rounded p-1 flex flex-col items-center text-xs hover:bg-subtle"
            onClick={() => onSelect(asset)}
          >
            <img
              src={asset.url}
              alt={asset.name}
              className="w-full h-20 object-cover mb-1"
            />
            <span className="truncate w-full text-center">{asset.name}</span>
          </button>
        ))}
        {!filtered.length && (
          <p className="text-muted text-sm">No assets found</p>
        )}
      </div>
    </div>
  );
}

