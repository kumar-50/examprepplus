'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionCoverageProps {
  sections: Array<{
    sectionId: string;
    sectionName: string;
    accuracy: number;
    questionsAttempted: number;
    status: 'mastered' | 'proficient' | 'developing' | 'needs-work' | 'not-attempted';
  }>;
}

export function SectionCoverageMap({ sections }: SectionCoverageProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'mastered':
        return { icon: '✅', label: 'Mastered', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'proficient':
        return { icon: '🟢', label: 'Proficient', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'developing':
        return {
          icon: '🟡',
          label: 'Developing',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      case 'needs-work':
        return { icon: '🔴', label: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'not-attempted':
        return {
          icon: '⚪',
          label: 'Not Attempted',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
      default:
        return { icon: '⚪', label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const attemptedSections = sections.filter((s) => s.status !== 'not-attempted').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Coverage</CardTitle>
        <CardDescription>
          {attemptedSections} of {sections.length} sections practiced
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sections.map((section) => {
            const statusInfo = getStatusInfo(section.status);
            return (
              <div
                key={section.sectionId}
                className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{statusInfo.icon}</span>
                  <div>
                    <p className="font-medium">{section.sectionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.questionsAttempted > 0 ? (
                        <>
                          {Number(section.accuracy).toFixed(0)}% accuracy • {section.questionsAttempted}{' '}
                          questions
                        </>
                      ) : (
                        'Not attempted yet'
                      )}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Coverage</span>
            <span className="font-medium">
              {Math.round((attemptedSections / sections.length) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${(attemptedSections / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
