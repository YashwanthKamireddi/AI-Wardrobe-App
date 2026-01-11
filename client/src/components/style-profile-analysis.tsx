import { useState } from "react";
import { Crown, Sparkles, TrendingUp, Palette, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StyleMetric {
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface StyleProfileAnalysisProps {
  wardrobeCount?: number;
  outfitCount?: number;
}

export default function StyleProfileAnalysis({ wardrobeCount = 0, outfitCount = 0 }: StyleProfileAnalysisProps) {
  const metrics: StyleMetric[] = [
    { label: "Style Versatility", value: Math.min(wardrobeCount * 5, 100), icon: <Palette className="h-4 w-4" /> },
    { label: "Outfit Creativity", value: Math.min(outfitCount * 10, 100), icon: <Sparkles className="h-4 w-4" /> },
    { label: "Wardrobe Balance", value: wardrobeCount > 10 ? 75 : wardrobeCount * 7.5, icon: <Target className="h-4 w-4" /> },
  ];

  const styleLevel = wardrobeCount > 20 ? "Expert" : wardrobeCount > 10 ? "Intermediate" : "Beginner";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-xl">Style Profile</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="h-3 w-3 text-primary" />
            {styleLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics */}
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{metric.icon}</span>
                  <span>{metric.label}</span>
                </div>
                <span className="font-medium">{metric.value}%</span>
              </div>
              <Progress value={metric.value} className="h-2" />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-serif text-primary">{wardrobeCount}</p>
            <p className="text-sm text-muted-foreground">Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-primary">{outfitCount}</p>
            <p className="text-sm text-muted-foreground">Outfits</p>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">Style Tip</p>
              <p className="text-sm text-muted-foreground">
                {wardrobeCount < 10 
                  ? "Add more items to your wardrobe to unlock style recommendations."
                  : "Try creating new outfit combinations to maximize your wardrobe potential."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
