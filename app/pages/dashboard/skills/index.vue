<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Skills & Interests"
        description="Organize your skills, hobbies, and interests into bento blocks"
        add-button-text="Add Bento Block"
        add-link="/dashboard/skills/new"
      />
    </template>

    <Loader
      v-if="bentoStore.loading && !bentoStore.hasBlocks"
      title="Loading bento blocks"
      description="Please wait while we fetch your skills and interests."
    />

    <Empty v-else-if="!bentoStore.hasBlocks">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Grid3x3 />
        </EmptyMedia>
        <EmptyTitle>No Bento Blocks Yet</EmptyTitle>
        <EmptyDescription>
          You haven't created any bento blocks yet. Start organizing your skills
          and interests by creating your first block.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div class="flex gap-2">
          <NuxtLink to="/dashboard/skills/new">
            <Button class="gap-2">
              <Plus class="h-4 w-4" />
              Create First Block
            </Button>
          </NuxtLink>
        </div>
      </EmptyContent>
    </Empty>

    <div v-else class="space-y-6">
      <!-- Stats Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <Grid3x3 class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ bentoStore.blocks.length }}</p>
                <p class="text-sm text-muted-foreground">Total Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <Sparkles class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ bentoStore.totalItems }}</p>
                <p class="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <TrendingUp class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ averageItemsPerBlock }}</p>
                <p class="text-sm text-muted-foreground">Avg. Items/Block</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Bento Blocks Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="block in bentoStore.blocks"
          :key="block.id"
          class="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
        >
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div
                  class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                >
                  <Grid3x3 class="h-4 w-4 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <CardTitle class="text-lg truncate">{{
                    block.title
                  }}</CardTitle>
                  <CardDescription class="text-xs">
                    {{ block.items?.length || 0 }} item{{
                      (block.items?.length || 0) !== 1 ? "s" : ""
                    }}
                  </CardDescription>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 flex-shrink-0"
                  >
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEditBlockDialog(block)">
                    <Pencil class="h-4 w-4" />
                    Edit Title
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="openAddItemDialog(block)">
                    <Plus class="h-4 w-4" />
                    Add Item
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger as-child>
                      <DropdownMenuItem
                        class="text-red-600 focus:text-red-600"
                        @select.prevent
                      >
                        <Trash2 class="h-4 w-4" />
                        Delete Block
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle
                          >Are you absolutely sure?</AlertDialogTitle
                        >
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the bento block "{{ block.title }}" and all
                          {{ block.items?.length || 0 }} items inside it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          class="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          @click="handleDeleteBlock(block.id)"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <div
              v-if="!block.items || block.items.length === 0"
              class="text-center py-6"
            >
              <p class="text-sm text-muted-foreground">No items yet</p>
              <Button
                variant="outline"
                size="sm"
                class="mt-3 gap-2"
                @click="openAddItemDialog(block)"
              >
                <Plus class="h-3 w-3" />
                Add First Item
              </Button>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="item in block.items"
                :key="item.id"
                class="group/item flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"
                  />
                  <span class="text-sm truncate">{{ item.contentText }}</span>
                </div>
                <div
                  class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click="openEditItemDialog(item, block.id)"
                  >
                    <Pencil class="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6 text-destructive hover:text-destructive"
                    @click="handleDeleteItem(item.id, block.id)"
                  >
                    <Trash2 class="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Edit Block Dialog -->
    <Dialog v-model:open="editBlockDialog.isOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Block Title</DialogTitle>
          <DialogDescription>
            Update the title for this bento block.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label for="edit-title" class="text-sm font-medium">Title</label>
            <Input
              id="edit-title"
              v-model="editBlockDialog.title"
              placeholder="e.g., My Skills, What I Love"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editBlockDialog.isOpen = false">
            Cancel
          </Button>
          <Button @click="handleUpdateBlock" :disabled="!editBlockDialog.title">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Add Item Dialog -->
    <Dialog v-model:open="addItemDialog.isOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a new item to "{{ addItemDialog.blockTitle }}".
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label for="add-item" class="text-sm font-medium">Item Text</label>
            <Input
              id="add-item"
              v-model="addItemDialog.contentText"
              placeholder="e.g., Vue.js, Skiing, Photography"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="addItemDialog.isOpen = false">
            Cancel
          </Button>
          <Button @click="handleAddItem" :disabled="!addItemDialog.contentText">
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Item Dialog -->
    <Dialog v-model:open="editItemDialog.isOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the text for this item.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label for="edit-item" class="text-sm font-medium">Item Text</label>
            <Input
              id="edit-item"
              v-model="editItemDialog.contentText"
              placeholder="e.g., Vue.js, Skiing, Photography"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editItemDialog.isOpen = false">
            Cancel
          </Button>
          <Button
            @click="handleUpdateItem"
            :disabled="!editItemDialog.contentText"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Grid3x3,
  Sparkles,
  TrendingUp,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/Loader.vue";
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
import { useBentoStore } from "~/stores/bento";
import type { BentoBlock, BentoItem } from "~/types/bento";

const bentoStore = useBentoStore();

onMounted(async () => {
  try {
    await bentoStore.fetchBlocks();
  } catch (error) {
    console.error("Failed to fetch bento blocks:", error);
  }
});

const averageItemsPerBlock = computed(() => {
  if (bentoStore.blocks.length === 0) return 0;
  return Math.round(bentoStore.totalItems / bentoStore.blocks.length);
});

// Edit Block Dialog
const editBlockDialog = reactive({
  isOpen: false,
  blockId: null as number | null,
  title: "",
});

const openEditBlockDialog = (block: BentoBlock) => {
  editBlockDialog.blockId = block.id;
  editBlockDialog.title = block.title;
  editBlockDialog.isOpen = true;
};

const handleUpdateBlock = async () => {
  if (!editBlockDialog.blockId || !editBlockDialog.title) return;

  try {
    await bentoStore.updateBlock(editBlockDialog.blockId, {
      title: editBlockDialog.title,
    });
    editBlockDialog.isOpen = false;
  } catch (error) {
    console.error("Failed to update block:", error);
  }
};

// Add Item Dialog
const addItemDialog = reactive({
  isOpen: false,
  blockId: null as number | null,
  blockTitle: "",
  contentText: "",
});

const openAddItemDialog = (block: BentoBlock) => {
  addItemDialog.blockId = block.id;
  addItemDialog.blockTitle = block.title;
  addItemDialog.contentText = "";
  addItemDialog.isOpen = true;
};

const handleAddItem = async () => {
  if (!addItemDialog.blockId || !addItemDialog.contentText) return;

  try {
    await bentoStore.createItem({
      bento_id: addItemDialog.blockId,
      contentText: addItemDialog.contentText,
    });
    addItemDialog.isOpen = false;
  } catch (error) {
    console.error("Failed to add item:", error);
  }
};

// Edit Item Dialog
const editItemDialog = reactive({
  isOpen: false,
  itemId: null as number | null,
  bentoId: null as number | null,
  contentText: "",
});

const openEditItemDialog = (item: BentoItem, bentoId: number) => {
  editItemDialog.itemId = item.id;
  editItemDialog.bentoId = bentoId;
  editItemDialog.contentText = item.contentText;
  editItemDialog.isOpen = true;
};

const handleUpdateItem = async () => {
  if (!editItemDialog.itemId || !editItemDialog.contentText) return;

  try {
    await bentoStore.updateItem(editItemDialog.itemId, {
      contentText: editItemDialog.contentText,
    });
    editItemDialog.isOpen = false;
  } catch (error) {
    console.error("Failed to update item:", error);
  }
};

// Delete handlers
const handleDeleteBlock = async (blockId: number) => {
  try {
    await bentoStore.deleteBlock(blockId);
  } catch (error) {
    console.error("Failed to delete block:", error);
  }
};

const handleDeleteItem = async (itemId: number, bentoId: number) => {
  try {
    await bentoStore.deleteItem(itemId, bentoId);
  } catch (error) {
    console.error("Failed to delete item:", error);
  }
};
</script>
