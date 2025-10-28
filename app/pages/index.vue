<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation -->
    <header class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span class="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold">Canvasly</h1>
              <p class="text-xs text-muted-foreground">Portfolio CMS</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <ThemeSwitcher />
            <Button as-child variant="outline">
              <NuxtLink to="/account/sign-in">
                Sign In
              </NuxtLink>
            </Button>
            <Button as-child>
              <NuxtLink to="/account/sign-up">
                Get Started
              </NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

      <div class="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div class="max-w-4xl mx-auto text-center space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Sparkles class="h-4 w-4" />
            Build Your Digital Presence
          </div>

          <!-- Heading -->
          <div class="space-y-4">
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Create Your
              <span class="text-primary"> Portfolio</span>
              <br />
              In Minutes
            </h1>
            <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A powerful and intuitive CMS to showcase your projects, skills, and experiences.
              Build a stunning portfolio that stands out.
            </p>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink to="/account/sign-up">
              <Button size="lg" class="gap-2">
                <Rocket class="h-5 w-5" />
                Start Building Free
              </Button>
            </NuxtLink>
            <NuxtLink to="/account/sign-in">
              <Button size="lg" variant="outline" class="gap-2">
                <LogIn class="h-5 w-5" />
                Access Dashboard
              </Button>
            </NuxtLink>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div class="space-y-2">
              <div class="text-3xl md:text-4xl font-bold text-primary">100%</div>
              <div class="text-sm text-muted-foreground">Free & Open</div>
            </div>
            <div class="space-y-2">
              <div class="text-3xl md:text-4xl font-bold text-primary">5min</div>
              <div class="text-sm text-muted-foreground">Setup Time</div>
            </div>
            <div class="space-y-2">
              <div class="text-3xl md:text-4xl font-bold text-primary">∞</div>
              <div class="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold">
            Everything You Need
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features to create a portfolio that truly represents you
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <!-- Feature 1 -->
          <Card class="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FolderCode class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Project Showcase</CardTitle>
              <CardDescription>
                Display your work with beautiful project cards, categories, and detailed views
              </CardDescription>
            </CardHeader>
          </Card>

          <!-- Feature 2 -->
          <Card class="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Grid3x3 class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Skills & Interests</CardTitle>
              <CardDescription>
                Organize your skills in elegant bento blocks for a modern, clean presentation
              </CardDescription>
            </CardHeader>
          </Card>

          <!-- Feature 3 -->
          <Card class="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Experience Timeline</CardTitle>
              <CardDescription>
                Showcase your professional and educational journey in a clear timeline
              </CardDescription>
            </CardHeader>
          </Card>

          <!-- Feature 4 -->
          <Card class="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Link2 class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Connect all your social profiles and platforms in one centralized place
              </CardDescription>
            </CardHeader>
          </Card>

          <!-- Feature 5 -->
          <Card class="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Image class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Media Management</CardTitle>
              <CardDescription>
                Upload and manage images with integrated Supabase Storage for your projects
              </CardDescription>
            </CardHeader>
          </Card>

          <!-- Feature 6 -->
          <Card class="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Palette class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>
                Switch between light and dark themes for the perfect viewing experience
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold">
            Simple & Intuitive
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get your portfolio online in three easy steps
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Step 1 -->
          <div class="relative">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 class="text-xl font-semibold">Sign Up</h3>
              <p class="text-muted-foreground">
                Create your free account in seconds. No credit card required.
              </p>
            </div>
            <ArrowRight class="hidden md:block absolute top-8 -right-4 h-8 w-8 text-primary/30" />
          </div>

          <!-- Step 2 -->
          <div class="relative">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 class="text-xl font-semibold">Add Content</h3>
              <p class="text-muted-foreground">
                Use our intuitive dashboard to add projects, skills, and experiences.
              </p>
            </div>
            <ArrowRight class="hidden md:block absolute top-8 -right-4 h-8 w-8 text-primary/30" />
          </div>

          <!-- Step 3 -->
          <div class="relative">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 class="text-xl font-semibold">Share</h3>
              <p class="text-muted-foreground">
                Get your unique portfolio URL and share it with the world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary/5">
      <div class="container mx-auto px-4">
        <Card class="max-w-4xl mx-auto border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader class="text-center space-y-4 pb-8">
            <div class="flex justify-center">
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap class="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle class="text-3xl md:text-4xl">
              Ready to Build Your Portfolio?
            </CardTitle>
            <CardDescription class="text-lg">
              Join developers, designers, and creators showcasing their work with Canvasly
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
            <NuxtLink to="/account/sign-up">
              <Button size="lg" class="gap-2">
                <Rocket class="h-5 w-5" />
                Create Your Portfolio
              </Button>
            </NuxtLink>
            <NuxtLink to="/account/sign-in">
              <Button size="lg" variant="outline" class="gap-2">
                <LogIn class="h-5 w-5" />
                Sign In to Dashboard
              </Button>
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t bg-card/50">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <span class="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <div>
                <h3 class="font-bold text-lg">Canvasly</h3>
                <p class="text-xs text-muted-foreground">Portfolio CMS</p>
              </div>
            </div>
            <p class="text-sm text-muted-foreground">
              Build beautiful portfolios with ease. Showcase your work, skills, and experiences in minutes.
            </p>
          </div>

          <!-- Product -->
          <div>
            <h4 class="font-semibold mb-4">Product</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <NuxtLink to="/account/sign-up" class="hover:text-primary transition-colors">
                  Features
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/account/sign-up" class="hover:text-primary transition-colors">
                  Pricing
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/account/sign-in" class="hover:text-primary transition-colors">
                  Dashboard
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Resources -->
          <div>
            <h4 class="font-semibold mb-4">Resources</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" class="hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h4 class="font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" class="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator class="my-8" />

        <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 Canvasly. All rights reserved.</p>
          <div class="flex items-center gap-4">
            <a href="#" class="hover:text-primary transition-colors">
              Built with Nuxt 4 & Supabase
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  Rocket,
  LogIn,
  FolderCode,
  Grid3x3,
  Briefcase,
  Link2,
  Image,
  Palette,
  ArrowRight,
  Zap,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";

// SEO Meta
useHead({
  title: 'Canvasly - Build Your Portfolio in Minutes',
  meta: [
    {
      name: 'description',
      content: 'A powerful and intuitive CMS to showcase your projects, skills, and experiences. Build a stunning portfolio that stands out.',
    },
  ],
});
</script>

<style scoped>
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
  background-size: 4rem 4rem;
}
</style>
