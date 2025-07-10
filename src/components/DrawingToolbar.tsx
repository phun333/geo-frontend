'use client';

import { MousePointer, Milestone, Shapes, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CoordinateType } from '@/lib/types';

export type DrawingMode = CoordinateType | 'off';

interface DrawingToolbarProps {
  drawingMode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
}

const tools = [
  { mode: CoordinateType.Point, icon: MousePointer, label: 'Nokta Çiz' },
  { mode: CoordinateType.Line, icon: Milestone, label: 'Çizgi Çiz' },
  { mode: CoordinateType.Polygon, icon: Shapes, label: 'Alan Çiz' },
];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({ drawingMode, setDrawingMode }) => {
  return (
    <Card className="p-0 inline-block">
      <CardContent className="p-2 flex flex-row items-center space-x-2">
        {tools.map((tool) => (
          <Button
            key={tool.mode}
            variant="ghost"
            size="icon"
            className={cn('h-10 w-10', drawingMode === tool.mode && 'bg-primary text-primary-foreground')}
            onClick={() => setDrawingMode(tool.mode)}
            title={tool.label}
          >
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}
        {drawingMode !== 'off' && (
          <>
            <div className="border-l h-6 mx-2" />
            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10"
              onClick={() => setDrawingMode('off')}
              title="Çizimi İptal Et"
            >
              <Ban className="h-5 w-5" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 