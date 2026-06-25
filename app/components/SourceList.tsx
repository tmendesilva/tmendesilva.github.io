import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Source } from "@/types/about";
import { ChevronRight, FileText } from "lucide-react";

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  return (
    <Card className="p-3 mt-2 w-full max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Sources</span>
        <Badge variant="secondary" className="ml-auto">
          {sources.length}
        </Badge>
      </div>

      <ScrollArea className="h-32 w-full">
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div
              key={source.id || index}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:translate-x-1 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {source.metadata?.title || `Source ${index + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {source.content}
                  </p>
                  {source.score && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Score: {source.score.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
