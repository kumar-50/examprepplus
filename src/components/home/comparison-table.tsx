import { Check, X, Minus, HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ComparisonTable() {
  const features = [
    {
      name: "Weak Topic Detection",
      description: "AI identifies your weak areas automatically",
      us: true,
      coaching: false,
      others: false,
    },
    {
      name: "Daily Streak Tracking",
      description: "Gamified consistency builder",
      us: true,
      coaching: false,
      others: true,
    },
    {
      name: "Real Exam Interface",
      description: "Exact replica of RRB NTPC screen",
      us: true,
      coaching: false,
      others: true,
    },
    {
      name: "Smart Goal Setting",
      description: "Personalized deadlines & targets",
      us: true,
      coaching: false,
      others: false,
    },
    {
      name: "Affordable Pricing",
      description: "Premium quality at pocket-friendly rates",
      us: true,
      coaching: false,
      others: "Variable",
    },
    {
      name: "Latest Pattern (PYQ)",
      description: "Updated immediately after notifications",
      us: true,
      coaching: "Delayed",
      others: true,
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose ExamPrep+?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how we stack up against traditional coaching and other apps.
          </p>
        </div>

        <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
          {/* Decorative background blur */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-lg opacity-50" />
          
          <Card className="relative border shadow-2xl overflow-hidden bg-card">
            <div className="grid grid-cols-4 divide-x divide-border/50">
              {/* Header Row */}
              <div className="col-span-1 p-4 sm:p-6 flex items-center bg-muted/30">
                <span className="font-semibold text-muted-foreground text-sm sm:text-base">Features</span>
              </div>
              <div className="col-span-1 p-4 sm:p-6 text-center bg-primary/5 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                <h3 className="font-bold text-sm sm:text-xl text-primary">ExamPrep+</h3>
                <div className="text-[10px] sm:text-xs text-primary/80 font-medium mt-1">Best Choice</div>
              </div>
              <div className="col-span-1 p-4 sm:p-6 text-center flex items-center justify-center bg-muted/10">
                <h3 className="font-semibold text-muted-foreground text-xs sm:text-base">Coaching</h3>
              </div>
              <div className="col-span-1 p-4 sm:p-6 text-center flex items-center justify-center bg-muted/10">
                <h3 className="font-semibold text-muted-foreground text-xs sm:text-base">Other Apps</h3>
              </div>

              {/* Feature Rows */}
              {features.map((feature, i) => (
                <div key={i} className="contents group">
                  {/* Feature Name */}
                  <div className="col-span-1 p-4 sm:p-6 flex flex-col justify-center border-t border-border/50 bg-background group-hover:bg-muted/5 transition-colors">
                    <span className="font-semibold text-xs sm:text-base">{feature.name}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block mt-1">{feature.description}</span>
                  </div>

                  {/* Us */}
                  <div className="col-span-1 p-4 sm:p-6 flex items-center justify-center border-t border-border/50 bg-primary/5 group-hover:bg-primary/10 transition-colors relative">
                    {feature.us === true ? (
                      <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm shadow-green-200">
                        <Check className="w-3 h-3 sm:w-6 sm:h-6" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="font-bold text-primary text-xs sm:text-base">{feature.us}</span>
                    )}
                  </div>

                  {/* Coaching */}
                  <div className="col-span-1 p-4 sm:p-6 flex items-center justify-center border-t border-border/50 bg-background group-hover:bg-muted/5 transition-colors">
                    {feature.coaching === false ? (
                      <X className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground/30" />
                    ) : feature.coaching === true ? (
                      <Check className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
                    ) : (
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">{feature.coaching}</span>
                    )}
                  </div>

                  {/* Others */}
                  <div className="col-span-1 p-4 sm:p-6 flex items-center justify-center border-t border-border/50 bg-background group-hover:bg-muted/5 transition-colors">
                    {feature.others === false ? (
                      <X className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground/30" />
                    ) : feature.others === true ? (
                      <Check className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
                    ) : (
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">{feature.others}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
