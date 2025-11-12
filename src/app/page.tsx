import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { getCurrentUser, getUserProfile } from '@/lib/auth/server'
import { BookOpen, PenTool, TrendingUp, MessageCircle, Newspaper, Smartphone, Check, X, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react'

export default async function Home() {
  const user = await getCurrentUser()
  
  if (user) {
    const profile = await getUserProfile(user.id)
    
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative px-4 py-12 sm:py-16 lg:py-20 xl:py-24 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--brand-light)] to-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <Badge variant="secondary" className="bg-[var(--brand-light)] text-[var(--brand-primary)] hover:bg-[var(--brand-light)] border-none px-4 py-2 text-sm">
                Your Success Story Starts Here
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight text-[var(--heading)]">
                Ace Your Government Exams with{' '}
                <span className="text-[var(--brand-primary)]">Confidence.</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-[var(--body-text)] max-w-xl">
                Join thousands of aspirants preparing with our mock tests, live classes, and expert-curated content. Your dream job is closer than you think.
              </p>
              
              <div className="pt-2">
                <Button asChild size="lg" className="bg-[var(--warning)] hover:bg-[var(--warning)]/90 text-white text-base px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Link href="/signup">
                    Start Free Trial →
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative aspect-square w-full max-w-2xl mx-auto lg:ml-auto">
                <Image
                  src="/hero.png"
                  alt="Students studying together with educational materials"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-[var(--heading)]">Why Choose ExamPrepPlus?</h2>
            <p className="text-base sm:text-lg text-[var(--body-text)] max-w-2xl mx-auto px-4">
              Everything you need to succeed, all in one place. We provide the tools, you bring the ambition.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-[var(--borders)] bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--brand-light)] flex items-center justify-center mb-3 sm:mb-4">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--brand-primary)]" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-[var(--heading)]">Comprehensive Study Material</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">
                  Access a vast library of notes, e-books, and video lectures updated with the latest syllabus.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[var(--borders)] bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-50 flex items-center justify-center mb-3 sm:mb-4">
                  <PenTool className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--warning)]" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-[var(--heading)]">Realistic Mock Tests</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">
                  Simulate the real exam environment with full-length mock tests and get detailed performance analysis.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[var(--borders)] bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--brand-light)] flex items-center justify-center mb-3 sm:mb-4">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--brand-primary)]" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-[var(--heading)]">Personalized Study Plans</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">
                  Our AI-powered engine creates a customized learning path based on your strengths and weaknesses.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[var(--borders)] bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-50 flex items-center justify-center mb-3 sm:mb-4">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--warning)]" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-[var(--heading)]">Doubt Clearing Sessions</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">
                  Get your questions answered by expert educators in live doubt-clearing sessions and forums.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[var(--borders)] bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--brand-light)] flex items-center justify-center mb-3 sm:mb-4">
                  <Newspaper className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--brand-primary)]" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-[var(--heading)]">Current Affairs Updates</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">
                  Stay ahead with daily and weekly updates on current affairs, crucial for every government exam.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[var(--borders)] bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-50 flex items-center justify-center mb-3 sm:mb-4">
                  <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--warning)]" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-[var(--heading)]">Learn On The Go</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">
                  Our platform is fully responsive. Study anytime, anywhere, on any device without hassle.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-[var(--heading)]">Get Started in 3 Simple Steps</h2>
            <p className="text-base sm:text-lg text-[var(--body-text)] px-4">
              Your journey to success is just a few clicks away. Follow our simple process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold px-4 text-[var(--heading)]">Create Your Account</h3>
              <p className="text-sm sm:text-base text-[var(--body-text)] px-4">
                Sign up for free and tell us which exam you're preparing for to personalize your experience.
              </p>
            </div>

            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold px-4 text-[var(--heading)]">Choose Your Plan</h3>
              <p className="text-sm sm:text-base text-[var(--body-text)] px-4">
                Select a plan that fits your needs. Start with a free plan or unlock all features with Pro.
              </p>
            </div>

            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold px-4 text-[var(--heading)]">Start Acing It!</h3>
              <p className="text-sm sm:text-base text-[var(--body-text)] px-4">
                Dive into our resources, follow your study plan, and start your journey towards success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4 text-[var(--heading)]">Choose Your Plan</h2>
            <p className="text-base sm:text-lg text-[var(--body-text)] px-4">
              Simple, transparent pricing for every aspirant.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8">
            {/* Basic Plan */}
            <Card className="relative md:scale-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Basic</CardTitle>
                <CardDescription className="text-sm sm:text-base">For a quick start.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold">
                    ₹499<span className="text-base font-normal text-muted-foreground"> / 3 months</span>
                  </div>
                </div>
                
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">10 Full Mock Tests</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">Basic Performance Analytics</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">500+ Practice Questions</span>
                  </li>
                </ul>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/signup">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-[var(--brand-primary)] shadow-lg md:scale-105 hover:shadow-xl transition-shadow bg-[var(--bg-primary)]">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-[var(--brand-primary)] text-white px-3 sm:px-4 py-1 text-xs sm:text-sm whitespace-nowrap">Most Popular</Badge>
              </div>
              <CardHeader className="pt-6 sm:pt-8">
                <CardTitle className="text-xl sm:text-2xl text-[var(--brand-primary)]">Pro</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">For comprehensive prep.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-[var(--heading)]">
                    ₹999<span className="text-base font-normal text-[var(--muted-text)]"> / 6 months</span>
                  </div>
                </div>
                
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">25 Full Mock Tests</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">Advanced Performance Analytics</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">2000+ Practice Questions</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">Topic-wise Tests</span>
                  </li>
                </ul>

                <Button className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-dark)]" asChild>
                  <Link href="/signup">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative md:scale-100 hover:shadow-lg transition-shadow border-[var(--borders)] bg-[var(--bg-primary)]">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-[var(--heading)]">Premium</CardTitle>
                <CardDescription className="text-sm sm:text-base text-[var(--body-text)]">For ultimate mastery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-[var(--heading)]">
                    ₹1499<span className="text-base font-normal text-[var(--muted-text)]"> / 12 months</span>
                  </div>
                </div>
                
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">50 Full Mock Tests</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">All Pro Features</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--body-text)]">Doubt Solving Sessions</span>
                  </li>
                </ul>

                <Button variant="outline" className="w-full border-[var(--borders)]" asChild>
                  <Link href="/signup">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-8 sm:py-16 lg:py-20 sm:px-6 lg:px-8 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[var(--heading)] rounded-2xl lg:rounded-3xl px-6 sm:px-12 lg:px-16 py-12 sm:py-16 lg:py-20 text-center text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Start Your Success Story?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              Join thousands of other aspirants and take the first step towards your dream government job today. Your preparation journey starts here.
            </p>
            <Button asChild size="lg" className="bg-[var(--success)] hover:bg-[var(--success)]/90 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Link href="/signup">
                Start a free trail 🚀
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1a1d2e] text-white px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 mb-6 sm:mb-8">
            {/* Brand */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-bold text-xl sm:text-2xl">
                <span className="text-white">ExamPrep</span>
                <span className="text-secondary">+</span>
              </h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Your partner in success for government examinations.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row - Copyright & Social Media */}
          <div className="border-t border-gray-700 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              {/* Copyright */}
              <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                © 2025 ExamPrepPlus. All rights reserved.
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-3 sm:gap-4">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700/50 hover:bg-gray-600 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700/50 hover:bg-gray-600 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700/50 hover:bg-gray-600 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700/50 hover:bg-gray-600 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
