<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import Hero from '../components/Hero.vue'
import Features from '../components/Features.vue'
import Showcase from '../components/Showcase.vue'
import ContextMenuDemo from '../components/ContextMenuDemo.vue'
import CodeSnippet from '../components/CodeSnippet.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="landing-page">
    <Navbar />
    <main>
      <Hero />
      <Features />
      <Showcase />
      <ContextMenuDemo />
      <CodeSnippet />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>