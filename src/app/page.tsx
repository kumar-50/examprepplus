import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { getCurrentUser, getUserProfile } from '@/lib/auth/server'

export default async function Home() {
  // Check if user is already authenticated
  const user = await getCurrentUser()
  
  if (user) {
    // Get user profile to check role
    const profile = await getUserProfile(user.id)
    
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 min-h-[80vh]">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Master Your Certification Exams
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto sm:text-xl">
            Practice with real-world questions, track your progress, and ace your certification 
            exams with confidence. Built for professionals, by professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth-test">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section aria-labelledby="features-heading" className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 id="features-heading" className="text-3xl font-bold text-center mb-12">Why Choose ExamPrepPlus?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real Exam Questions</CardTitle>
                <CardDescription>Practice with authentic questions from actual certification exams</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our question bank is curated from real certification exams, ensuring you're prepared for what you'll actually face.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Track Your Progress</CardTitle>
                <CardDescription>Monitor your improvement with detailed analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See which topics you've mastered and where you need more practice with comprehensive progress tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timed Practice Tests</CardTitle>
                <CardDescription>Simulate real exam conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Take full-length practice exams under timed conditions to build confidence and test-taking skills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Explanations</CardTitle>
                <CardDescription>Learn from every answer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Each question includes thorough explanations to help you understand the concepts, not just memorize answers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Study Plans</CardTitle>
                <CardDescription>Personalized learning paths</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Focus on your weak areas with AI-driven study recommendations tailored to your performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile & Desktop</CardTitle>
                <CardDescription>Study anywhere, anytime</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access your study materials on any device with our fully responsive platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section aria-labelledby="solution-heading" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 id="solution-heading" className="text-3xl font-bold text-center mb-12">The Smart Way to Study</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-destructive">The Old Way</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-destructive">✗</span>
                  <span>Expensive bootcamps and training courses</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-destructive">✗</span>
                  <span>Outdated study materials and practice tests</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-destructive">✗</span>
                  <span>No way to track progress or weak areas</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-destructive">✗</span>
                  <span>Generic study plans that don't adapt</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-destructive">✗</span>
                  <span>Limited practice questions</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-primary">The ExamPrepPlus Way</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Affordable, pay-as-you-go pricing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Continuously updated question bank</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Advanced analytics and progress tracking</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>AI-powered personalized study recommendations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Unlimited practice with thousands of questions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section aria-labelledby="pricing-heading" className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 id="pricing-heading" className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free, upgrade when you're ready</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Free
                  <Badge variant="secondary">No Credit Card</Badge>
                </CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$0</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>20 practice questions per day</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Basic progress tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Community support</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth-test">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Premium
                  <Badge>Most Popular</Badge>
                </CardTitle>
                <CardDescription>For serious exam prep</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Unlimited practice questions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Full analytics and insights</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Timed practice exams</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Custom study plans</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/auth-test">Upgrade to Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section aria-labelledby="faq-heading" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 id="faq-heading" className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does ExamPrepPlus compare to traditional study materials?</AccordionTrigger>
              <AccordionContent>
                ExamPrepPlus offers interactive practice with immediate feedback, detailed analytics, and personalized study recommendations—features you won't find in traditional books or static study guides. Our question bank is continuously updated to reflect current exam content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
              <AccordionContent>
                Yes! There are no long-term contracts. You can cancel your premium subscription at any time, and you'll continue to have access until the end of your billing period.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>What certifications do you support?</AccordionTrigger>
              <AccordionContent>
                We currently support a wide range of IT certifications including AWS, Azure, CompTIA, CISSP, and many more. Our catalog is constantly expanding based on user demand.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Do you offer a money-back guarantee?</AccordionTrigger>
              <AccordionContent>
                Yes! We offer a 30-day money-back guarantee. If you're not satisfied with ExamPrepPlus within your first month, contact our support team for a full refund.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Can I use ExamPrepPlus on mobile devices?</AccordionTrigger>
              <AccordionContent>
                Absolutely! ExamPrepPlus is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Study anywhere, anytime.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How often are questions updated?</AccordionTrigger>
              <AccordionContent>
                We update our question bank regularly to ensure alignment with the latest exam objectives. Premium members get early access to new questions and content updates.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section aria-labelledby="cta-heading" className="px-4 py-16 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 id="cta-heading" className="text-3xl font-bold">Ready to Ace Your Certification?</h2>
          <p className="text-lg opacity-90">Join thousands of professionals who have passed their exams with ExamPrepPlus</p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth-test">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
