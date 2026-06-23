// src/components/flow/EdgeOptionsPanel.tsx
import { useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EdgeOptionsPanelProps {
  edgeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EdgeOptionsPanel({
  edgeId,
  open,
  onOpenChange,
}: EdgeOptionsPanelProps) {
  const { getEdge, setEdges } = useReactFlow();
  const edge = edgeId ? getEdge(edgeId) : null;

  if (!edge) return null;

  /**
   * Update the edge type (curve style)
   */
  const updateEdgeType = (type: string) => {
    setEdges((edges) =>
      edges.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              type: type as "default" | "smoothstep" | "step" | "straight",
            }
          : e,
      ),
    );
  };

  /**
   * Toggle edge animation
   */
  const toggleAnimation = (animated: boolean) => {
    setEdges((edges) =>
      edges.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              animated,
            }
          : e,
      ),
    );
  };

  /**
   * Delete the selected edge and close the panel
   */
  const handleDeleteEdge = () => {
    setEdges((edges) => edges.filter((e) => e.id !== edgeId));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>تنظیمات اتصال</DialogTitle>
          <DialogDescription>
            تنظیمات ظاهری و رفتار اتصال انتخاب شده را تغییر دهید
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Edge Type Selector */}
          <div className="grid gap-2">
            <Label htmlFor="edge-type">نوع اتصال</Label>
            <Select
              value={edge.type || "default"}
              onValueChange={updateEdgeType}
            >
              <SelectTrigger id="edge-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">منحنی (Bezier)</SelectItem>
                <SelectItem value="smoothstep">پله‌ای نرم</SelectItem>
                <SelectItem value="step">پله‌ای</SelectItem>
                <SelectItem value="straight">مستقیم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animation Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="edge-animation">انیمیشن</Label>
              <p className="text-sm text-muted-foreground">
                فعال‌سازی انیمیشن حرکتی روی خط اتصال
              </p>
            </div>
            <Switch
              id="edge-animation"
              checked={edge.animated || false}
              onCheckedChange={toggleAnimation}
            />
          </div>

          {/* Edge Info (optional display) */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>
              <span className="font-medium">شناسه:</span> {edge.id}
            </p>
            <p>
              <span className="font-medium">مبدا:</span> {edge.source}
            </p>
            <p>
              <span className="font-medium">مقصد:</span> {edge.target}
            </p>
          </div>
        </div>

        {/* Footer with Delete button */}
        <DialogFooter className="flex-row-reverse gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteEdge}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            حذف اتصال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
