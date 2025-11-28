import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { getCurrentUser, getUserProfile } from '@/lib/auth/server'
import { HomePricingSection } from '@/components/home/pricing-section'
import { FeatureTabs } from '@/components/home/feature-tabs'
import { ComparisonTable } from '@/components/home/comparison-table'
import { ScrollAnimation } from '@/components/ui/scroll-animation'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { 
  BookOpen, PenTool, TrendingUp, MessageCircle, Newspaper, Smartphone, 
  Check, X, Twitter, Facebook, Instagram, Linkedin, Users, Award, 
  Target, Clock, Star, ChevronDown, Shield, Zap, BarChart3, Brain,
  GraduationCap, FileText, Calendar, Trophy, Mail, ArrowRight
} from 'lucide-react'

export default async function Home() {
  const user = await getCurrentUser()
  
  // Don't auto-redirect authenticated users anymore
  // Let them see the landing page and pricing
  // They can navigate to dashboard via header menu

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <Header />
      
      {/* Hero Section - Modern Centered */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px] animate-pulse"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-8 hover:scale-105 transition-transform cursor-default">
            ✨ #1 Platform for RRB Preparation
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-foreground drop-shadow-sm">
            Master Your competitive exam with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Data-Driven Practice
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. Start improving. Our platform tracks your weak topics, 
            monitors your streaks, and helps you focus on what actually matters for RRB.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-12 px-8 text-base rounded-full shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-1">
              <Link href="/signup">
                Start Free Practice <ArrowRight className="ml-2 w-4 h-4 animate-bounce-x" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-2 hover:bg-muted/50 transition-all hover:-translate-y-1">
              <Link href="#pricing">
                View Plans
              </Link>
            </Button>
          </div>

          {/* Floating Stats Strip */}
          <div className="mt-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
            <div className="bg-card border shadow-2xl shadow-primary/5 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-20 hover:shadow-primary/10 transition-shadow duration-500">
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-primary">50k+</div>
                <div className="text-sm text-muted-foreground font-medium">Active Students</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground font-medium">Questions</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-primary">5k+</div>
                <div className="text-sm text-muted-foreground font-medium">Success Stories</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-primary">4.8</div>
                <div className="text-sm text-muted-foreground font-medium">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section - "Inside the Platform" */}
      <ScrollAnimation animation="slide-up">
        <FeatureTabs />
      </ScrollAnimation>

      {/* Comparison Table */}
      <ScrollAnimation animation="zoom-in" delay={200}>
        <ComparisonTable />
      </ScrollAnimation>

      {/* Features Section - Real Features Only */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="slide-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No fluff. Just the tools you need to clear RRB NTPC.
              </p>
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="slide-up" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                <CardHeader>
                  <BookOpen className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Topic-Wise Practice</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Practice specific topics like Algebra or Current Affairs separately to build strength.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                <CardHeader>
                  <PenTool className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Full Mock Tests</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Simulate the real exam environment with timed tests and negative marking.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                <CardHeader>
                  <TrendingUp className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Performance Reports</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Get detailed reports after every test showing your speed, accuracy, and rank.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                <CardHeader>
                  <Award className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Achievements</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Earn badges and points as you complete milestones. Make learning fun.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                <CardHeader>
                  <Smartphone className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Mobile Friendly</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Our website works perfectly on your phone. Practice during your commute.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                <CardHeader>
                  <Clock className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">Study Planner</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Get smart recommendations on when to review based on your schedule.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Exams Section - Clean & Focused */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="slide-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Focused Preparation</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We specialize in RRB NTPC. Here is what we cover.
              </p>
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="zoom-in" delay={200}>
            <div className="max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative border-none bg-card shadow-xl overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-transparent">
                      <Badge className="w-fit mb-4 bg-green-500 hover:bg-green-600">Available Now</Badge>
                      <h3 className="text-3xl font-bold mb-2">RRB NTPC</h3>
                      <p className="text-muted-foreground mb-6">Complete syllabus coverage for CBT 1 & CBT 2.</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm">🧮</div>
                          <div>
                            <div className="font-semibold">Mathematics</div>
                            <div className="text-xs text-muted-foreground">Number System, Algebra, Geometry</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm">🧠</div>
                          <div>
                            <div className="font-semibold">General Intelligence</div>
                            <div className="text-xs text-muted-foreground">Analogies, Coding, Puzzles</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm">🌍</div>
                          <div>
                            <div className="font-semibold">General Awareness</div>
                            <div className="text-xs text-muted-foreground">Current Events, History, Science</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8">
                        <Button asChild className="w-fit rounded-full">
                          <Link href="/signup">Start Preparing</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-8 md:p-12 flex flex-col justify-center items-center text-center border-l border-border/50">
                      <div className="text-6xl mb-4">🚂</div>
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {['SSC CGL', 'Bank PO', 'SSC CHSL', 'Group D'].map((exam) => (
                            <Badge key={exam} variant="outline" className="bg-background/50">{exam}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* How It Works - Vertical Timeline */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="slide-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Your journey to success in 3 simple steps</p>
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="slide-up" delay={200}>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { step: '01', title: 'Create Account', desc: 'Sign up for free and access your dashboard.' },
                { step: '02', title: 'Practice Daily', desc: 'Take topic tests or full mocks to build streaks.' },
                { step: '03', title: 'Track Growth', desc: 'Watch your accuracy improve with our analytics.' }
              ].map((item, i) => (
                <div key={i} className="relative p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
                  <div className="text-6xl font-bold text-muted/20 mb-4 group-hover:text-primary/10 transition-colors">{item.step}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Pricing Section */}
      <HomePricingSection />

      {/* Testimonials - Carousel Slider */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="slide-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Student Success Stories</h2>
              <p className="text-lg text-muted-foreground">Don't just take our word for it</p>
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="zoom-in" delay={200}>
            <div className="flex justify-center">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-5xl"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {[
                    { name: 'Priya Sharma', role: 'RRB NTPC 2024', text: 'The mock tests were exactly like the real exam. Cleared in first attempt!' },
                    { name: 'Rahul Verma', role: 'RRB NTPC 2024', text: 'Detailed analytics helped me find my weak spots in Math. Highly recommended.' },
                    { name: 'Amit Kumar', role: 'RRB NTPC 2024', text: 'Best platform for Railway exams. The study material is top-notch.' },
                    { name: 'Sneha Gupta', role: 'RRB NTPC 2024', text: 'I loved the streak feature! It kept me motivated to practice every single day.' },
                    { name: 'Vikram Singh', role: 'RRB NTPC 2024', text: 'The General Awareness section is very well curated. Helped me score high.' },
                  ].map((t, i) => (
                    <CarouselItem key={i} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="p-1 h-full">
                        <Card className="bg-card border-none shadow-sm p-6 h-full hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                          <div className="flex gap-1 mb-4">
                            {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-primary text-primary" />)}
                          </div>
                          <p className="text-muted-foreground mb-6 leading-relaxed">"{t.text}"</p>
                          <div className="flex items-center gap-3 mt-auto">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {t.name[0]}
                            </div>
                            <div>
                              <div className="font-semibold">{t.name}</div>
                              <div className="text-xs text-muted-foreground">{t.role}</div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="-left-12" />
                  <CarouselNext className="-right-12" />
                </div>
              </Carousel>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* FAQ Section - Clean Accordion */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <ScrollAnimation animation="slide-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Common questions about our platform and RRB NTPC prep.</p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="slide-up" delay={200}>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'What exams do you cover?', a: 'Currently, we focus exclusively on RRB NTPC (CBT 1 & CBT 2). We plan to add SSC CGL and Group D soon.' },
                { q: 'Is there a free trial?', a: 'Yes! You can sign up for free and access daily practice sets and one full mock test without paying anything.' },
                { q: 'How are the questions created?', a: 'Our questions are curated by exam experts and include previous year questions (PYQ) to ensure they match the real exam pattern.' },
                { q: 'Can I reattempt the mock tests?', a: 'To simulate the real exam environment, mock tests can currently be taken only once. You can review your score anytime.' },
                { q: 'Do you provide detailed solutions?', a: 'We provide the correct answer key immediately after the test. Detailed explanations are currently in development.' },
                { q: 'Can I use it on mobile?', a: 'Yes, our platform is fully responsive. You can practice on your phone, tablet, or computer seamlessly.' },
                { q: 'How does the streak system work?', a: 'To maintain a streak, you need to complete at least one practice set or test every day. It helps you stay consistent!' },
                { q: 'How do I contact support?', a: 'You can email us at support@examprepplus.com. We usually respond within 24 hours.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-lg text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollAnimation>
        </div>
      </section>

      {/* Footer - Clean */}
      <footer className="border-t bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="font-bold text-xl mb-4">ExamPrep<span className="text-primary">+</span></div>
            <p className="text-muted-foreground max-w-xs">
              The #1 platform for RRB NTPC preparation. Data-driven practice to help you succeed.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@examprepplus.com" className="hover:text-primary">support@examprepplus.com</a>
              </li>
              <li className="flex gap-4 mt-4">
                <a href="#" className="hover:text-primary"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary"><Instagram className="w-5 h-5" /></a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 ExamPrepPlus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
