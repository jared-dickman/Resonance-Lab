import { Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PRO_TIPS = [
  'Start slow and gradually increase BPM as you get comfortable',
  'Practice chord transitions separately before playing the full progression',
  'Try different strumming patterns to change the feel',
  'Use the Build tab to customize progressions and create your own variations',
];

export function ProTipsCard(): JSX.Element {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Pro Tips for Jamming
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {PRO_TIPS.map(tip => (
          <div key={tip} className="flex gap-2">
            <span className="text-primary">•</span>
            <p>{tip}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
