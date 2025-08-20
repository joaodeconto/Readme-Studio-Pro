"use client";
import RepoPicker from '@ui/components/data/RepoPicker';
import BranchSelect from '@ui/components/data/BranchSelect';
import Button from '@ui/components/ui/button';
import { Wand2 } from 'lucide-react';

export default function Topbar({
  onSave,
  onPublish,
  onOpenAI,
}: {
  onSave: () => void;
  onPublish: () => void;
  onOpenAI: () => void;
}) {
  return (
    <div className="h-12 border-b flex items-center justify-between px-3">
      <div className="flex items-center gap-2">
        <RepoPicker />
        <BranchSelect />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onSave}>
          Salvar
        </Button>
        <Button onClick={onPublish}>Publicar</Button>
        <Button variant="outline" onClick={onOpenAI}>
          <Wand2 className="mr-1 h-4 w-4" /> AI Assist
        </Button>
      </div>
    </div>
  );
}