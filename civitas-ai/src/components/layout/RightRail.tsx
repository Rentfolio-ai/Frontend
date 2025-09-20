import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Target, FileText, BarChart3, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RightRailProps {
  className?: string
}

export function RightRail({ className }: RightRailProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (isCollapsed) {
    return (
      <div className={cn("w-12 bg-surface border-l flex flex-col items-center py-4", className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="w-8 h-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <aside className={cn("layout-right-rail bg-surface border-l flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-h2 font-semibold text-foreground">Context</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="w-8 h-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Next Best Action */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Next Best Action</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-foreground">
                Analyze Property Metrics
              </p>
              <p className="text-xs text-text-muted mt-1">
                Upload property documents to get detailed ROI analysis
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-success" />
              <span>KPIs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="text-center p-2 sm:p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="text-base sm:text-lg font-bold text-success">8.2%</div>
                <div className="text-xs text-text-muted">Avg ROI</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-base sm:text-lg font-bold text-primary">$2.4M</div>
                <div className="text-xs text-text-muted">Portfolio</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="text-center p-2 sm:p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="text-base sm:text-lg font-bold text-warning">12</div>
                <div className="text-xs text-text-muted">Properties</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-accent-from/5 border border-accent-from/20">
                <div className="text-base sm:text-lg font-bold" style={{ color: 'hsl(var(--accent-from))' }}>
                  $8.2K
                </div>
                <div className="text-xs text-text-muted">Monthly</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <FileText className="w-4 h-4 text-accent-from" />
              <span>Quick Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <TrendingUp className="w-3 h-3 mr-2" />
              Market Analysis
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <DollarSign className="w-3 h-3 mr-2" />
              ROI Breakdown
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <BarChart3 className="w-3 h-3 mr-2" />
              Performance Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}