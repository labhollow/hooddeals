import { Progress } from "@/components/ui/progress";

interface DealProgressProps {
  current: number;
  target: number;
}

export default function DealProgress({ current, target }: DealProgressProps) {
  const progress = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{current} joined</span>
        <span>{remaining} more needed</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-center">
        {remaining === 0 ? (
          <span className="text-green-600 font-medium">Deal activated!</span>
        ) : (
          <span>
            {remaining} more {remaining === 1 ? 'person' : 'people'} needed to activate the deal
          </span>
        )}
      </p>
    </div>
  );
}
