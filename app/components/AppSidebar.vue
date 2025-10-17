<script setup lang="ts">
import { 
  Home, 
  FolderKanban, 
  User, 
  Briefcase, 
  Code2,
  LogOut,
  ChevronRight
} from "lucide-vue-next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const authStore = useAuthStore();
const route = useRoute();

const items = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    title: "Profile Details",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Experiences",
    url: "/dashboard/experiences",
    icon: Briefcase,
  },
  {
    title: "Skills",
    url: "/dashboard/skills",
    icon: Code2,
  },
];

const userInfo = ref<{
  id: string;
  email: string;
  display_name: string | null;
} | null>(null);

const loadUserInfo = async () => {
  try {
    const response = await authStore.fetchUser();
    userInfo.value = response.data.user;
  } catch (error) {
    console.error("Failed to load user info:", error);
  }
};

const handleLogout = async () => {
  try {
    await authStore.signOut();
  } catch (error) {
    console.error("Failed to logout:", error);
  }
};

const isActive = (url: string) => {
  return route.path === url;
};

const getInitials = (name: string | null) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

onMounted(() => {
  loadUserInfo();
});
</script>

<template>
  <Sidebar class="border-r border-sidebar-border bg-sidebar">
    <SidebarHeader class="border-b border-sidebar-border px-6 py-4 ">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <span class="text-primary-foreground font-semibold text-sm">C</span>
        </div>
        <div>
          <h2 class="text-base font-semibold text-sidebar-foreground tracking-tight">
            Canvasly
          </h2>
          <p class="text-xs text-sidebar-foreground/60">Portfolio CMS</p>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent class="px-3 py-4">
      <SidebarGroup>
        <SidebarGroupLabel class="px-3 text-xs font-medium text-sidebar-foreground/60 mb-2">
          Portfolio Components
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu class="space-y-1">
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton 
                asChild
                :is-active="isActive(item.url)"
                class="group relative"
              >
                <NuxtLink 
                  :to="item.url"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200"
                  :class="[
                    isActive(item.url) 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  ]"
                >
                  <component 
                    :is="item.icon" 
                    :class="[
                      'w-4 h-4 transition-colors',
                      isActive(item.url) ? 'text-sidebar-primary' : ''
                    ]"
                  />
                  <span class="text-sm">{{ item.title }}</span>
                  <ChevronRight 
                    v-if="isActive(item.url)"
                    class="w-4 h-4 ml-auto text-sidebar-primary"
                  />
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="p-4 border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem v-if="!authStore.loading && userInfo">
          <div class="flex items-center gap-3 px-3 py-3 rounded-lg bg-sidebar-accent/30">
            <Avatar class="w-9 h-9 border-2 border-sidebar-border">
              <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.display_name}`" />
              <AvatarFallback class="bg-primary text-primary-foreground text-xs font-medium">
                {{ getInitials(userInfo.display_name) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 overflow-hidden">
              <p class="text-sm font-medium text-sidebar-foreground truncate">
                {{ userInfo.display_name || 'User' }}
              </p>
              <p class="text-xs text-sidebar-foreground/60 truncate">
                {{ userInfo.email }}
              </p>
            </div>
          </div>
        </SidebarMenuItem>

        <!-- Loading State -->
        <SidebarMenuItem v-else-if="authStore.loading">
          <div class="flex items-center gap-3 px-3 py-3 animate-pulse">
            <div class="w-9 h-9 rounded-full bg-sidebar-accent"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-sidebar-accent rounded w-2/3"></div>
              <div class="h-2 bg-sidebar-accent rounded w-1/2"></div>
            </div>
          </div>
        </SidebarMenuItem>

        <SidebarSeparator class="my-3" />

        <SidebarMenuItem>
          <Button 
            @click="handleLogout"
            variant="ghost" 
            class="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
          >
            <LogOut class="w-4 h-4" />
            <span class="text-sm">Log out</span>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>