"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Zap, Trophy, ArrowRight, CheckCircle2, XCircle, TrendingUp, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function FeatureTabs() {
  const [activeTab, setActiveTab] = useState(0)

  const features = [
    {
      id: "weak-topics",
      title: "Weak Topic Detection",
      description: "Our system analyzes every answer. If you're struggling with \"Algebra\" or \"Coding-Decoding\", we'll flag it and recommend specific practice sets.",
      icon: Target,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      ui: (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Performance Analysis</h4>
            <Badge variant="outline">Last 7 Days</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-medium">Trigonometry</span>
                </div>
                <span className="text-xs font-bold text-red-500">42% Accuracy</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "42%" }}></div>
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-red-500">
                  Practice Now <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">Blood Relations</span>
                </div>
                <span className="text-xs font-bold text-yellow-600">58% Accuracy</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: "58%" }}></div>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium">Number System</span>
                </div>
                <span className="text-xs font-bold text-green-600">85% Accuracy</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "streaks",
      title: "Streak & Consistency",
      description: "Success is about habit. Track your daily study streaks, earn badges, and stay motivated with our gamified progress system.",
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      ui: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">🔥</div>
              <div>
                <div className="font-bold text-lg">7 Day Streak!</div>
                <div className="text-xs text-muted-foreground">You're on fire! Keep it up.</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-600">Top 5%</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">This Week</div>
            <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs border",
                    i < 5 ? "bg-green-500 text-white border-green-600" : 
                    i === 5 ? "bg-background border-dashed border-muted-foreground text-muted-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < 5 ? <CheckCircle2 className="w-4 h-4" /> : i === 5 ? "Today" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-card text-center">
              <div className="text-2xl font-bold mb-1">450</div>
              <div className="text-xs text-muted-foreground">Questions Solved</div>
            </div>
            <div className="p-3 rounded-lg border bg-card text-center">
              <div className="text-2xl font-bold mb-1">12h</div>
              <div className="text-xs text-muted-foreground">Study Time</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "goals",
      title: "Smart Goal Setting",
      description: "Set your own deadlines. Whether it's \"50 questions a day\" or \"Complete Geometry by Friday\", we help you stay on track.",
      icon: Trophy,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      ui: (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Daily Goals</h4>
            <span className="text-xs text-muted-foreground">Resets in 4h 12m</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Solve 50 Questions</span>
                <span className="font-bold text-primary">35/50</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: "70%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Complete 1 Mock Test</span>
                <span className="font-bold text-muted-foreground">0/1</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-0"></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">RRB NTPC Exam</div>
                <div className="text-xs text-muted-foreground">Dec 15, 2025 • 18 Days Left</div>
              </div>
            </div>
            <Button className="w-full" variant="outline">Edit Goals</Button>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Performance</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We don't just give you questions. We give you a system to master them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Tabs */}
          <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "group relative p-6 rounded-2xl transition-all duration-300 cursor-pointer border-2",
                  activeTab === index 
                    ? "bg-background border-primary shadow-lg scale-[1.02]" 
                    : "bg-transparent border-transparent hover:bg-background/50 hover:border-border/50"
                )}
              >
                <div className="flex gap-4 items-start">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
                    activeTab === index ? feature.bgColor : "bg-muted"
                  )}>
                    <feature.icon className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      activeTab === index ? feature.color : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold mb-2 transition-colors duration-300",
                      activeTab === index ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Dynamic Preview */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
            <Card className="relative border shadow-2xl bg-card/95 backdrop-blur overflow-hidden min-h-[400px]">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">dashboard.examprepplus.com</div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {features[activeTab]?.ui}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
