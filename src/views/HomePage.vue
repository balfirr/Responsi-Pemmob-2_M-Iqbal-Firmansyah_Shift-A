<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Refresher component -->
      <ion-refresher 
        slot="fixed" 
        :pull-factor="0.5" 
        :pull-min="100" 
        :pull-max="200" 
        @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
  
      <!-- Active Todos -->
      <div class="scrollable-container">
        <ion-list>
          <ion-item-sliding 
            v-for="stories in story" 
            :key="story.id"
            :ref="(el) => setItemRef(el,story.id!)">
            <!-- Delete option -->
            <ion-item-options side="start" @ionSwipe="handleDelete(story)">
              <ion-item-option 
                color="danger" 
                expandable 
                @click="handleDelete(story)">
                <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>

            <!-- Todo item -->
            <ion-item>
              <ion-card>
                <ion-card-header>
                  <ion-card-title class="ion-text-wrap limited-text">
                    {{ story.name }}
                  </ion-card-title>
                  <ion-card-subtitle class="limited-text">
                    {{ story.date }}
                  </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ion-badge>{{ getRelativeTime(story.updatedAt) }}</ion-badge>
                </ion-card-content>
              </ion-card>
            </ion-item>

            <!-- Edit and Status option -->
            <ion-item-options side="end" @ionSwipe="handleStatus(story)">
              <ion-item-option @click="handleEdit(story)">
                <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
              </ion-item-option>
              <ion-item-option 
                color="success" 
                expandable 
                @click="handleStatus(story)">
                <ion-icon 
                  slot="icon-only" 
                  :icon="checkmarkCircle" 
                  color="light" 
                  size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>

          <!-- No Active Todos -->
          <ion-item v-if="upcomingStory.length === 0" class="ion-text-center">
            <ion-label>No strories today. Create a new one here!</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Completed Todos -->
      <ion-item class="accordion-container">
        <ion-accordion-group>
          <ion-accordion value="first">
            <ion-item slot="header" color="light">
              <ion-label class="ion-text-center">Completed</ion-label>
            </ion-item>
            <div slot="content" class="scrollable-container">
              <ion-list>
                <ion-item-sliding 
                  v-for="story in pastStory" 
                  :key="story.id" 
                  :ref="(el) => setItemRef(el, story.id!)">
                  <!-- Delete option -->
                  <ion-item-options side="start" @ionSwipe="handleDelete(story)">
                    <ion-item-option 
                      color="danger" 
                      expandable 
                      @click="handleDelete(story)">
                      <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
                    </ion-item-option>
                  </ion-item-options>

                  <!-- Completed todo item -->
                  <ion-item>
                    <ion-card>
                      <ion-card-header>
                        <ion-card-title class="ion-text-wrap limited-text">
                          {{ story.name }}
                        </ion-card-title>
                        <ion-card-subtitle class="limited-text">
                          {{ story.date }}
                        </ion-card-subtitle>
                      </ion-card-header>
                      <ion-card-content>
                        <ion-badge>{{ getRelativeTime(story.updatedAt) }}</ion-badge>
                      </ion-card-content>
                    </ion-card>
                  </ion-item>

                  <!-- Edit and Status option -->
                  <ion-item-options side="end" @ionSwipe="handleStatus(story)">
                    <ion-item-option @click="handleEdit(story)">
                      <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
                    </ion-item-option>
                    <ion-item-option 
                      color="warning" 
                      expandable 
                      @click="handleStatus(story)">
                      <ion-icon 
                        slot="icon-only" 
                        :icon="close" 
                        color="light" 
                        size="large"></ion-icon>
                    </ion-item-option>
                  </ion-item-options>
                </ion-item-sliding>

                <!-- No Completed Todos -->
                <ion-item v-if="pastStory.length === 0" class="ion-text-center">
                  <ion-label>No new story</ion-label>
                </ion-item>
              </ion-list>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </ion-item>

      <!-- Floating Action Button and Modal -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="isOpen = true;">
          <ion-icon :icon="add" size="large"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <InputModal 
        v-model:isOpen="isOpen" 
        v-model:editingId="editingId" 
        :story="story" 
        @submit="handleSubmit" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAccordion,
  IonAccordionGroup,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  loadingController,
  toastController,
} from '@ionic/vue';

import {
  add,
  checkmarkCircle,
  close,
  create,
  trash,
  closeCircle,
  warningOutline,
} from 'ionicons/icons';

import InputModal from '@/components/InputModal.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { firestoreService, type story } from '@/utils/firestore';
import { formatDistanceToNow } from 'date-fns';

// State variables
const isOpen = ref(false);
const editingId = ref<string | null>(null);
const stories = ref<story[]>([]);
const story = ref<Partial<story>>({
  name: '',
  date: '',
  location: '',
  story: '',
  status: false
});
const upcomingStory = computed(() => stories.value.filter((story) => 
  !story.status || new Date(story.date) > new Date()
));
const pastStory = computed(() => stories.value.filter((story) => 
  story.status && new Date(story.date) <= new Date()
));
const itemRefs = ref<Map<string, HTMLIonItemSlidingElement>>(new Map());
const timeUpdateTrigger = ref(0);

// Helper functions
const setItemRef = (el: any, id: string) => {
  if (el) itemRefs.value.set(id, el.$el);
};

const showToast = async (message: string, color = 'success', icon = checkmarkCircle) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top',
    icon,
  });
  await toast.present();
};

const getRelativeTime = (date: any) => {
  timeUpdateTrigger.value;
  try {
    const jsDate = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

// CRUD operations
const loadStory = async (isLoading = true) => {
  let loading;
  if (isLoading) {
    loading = await loadingController.create({ message: 'Loading...' });
    await loading.present();
  }

  try {
    stories.value = await firestoreService.getStory();
  } catch (error) {
    console.error(error);
  } finally {
    if (loading) await loading.dismiss();
  }
};

const handleRefresh = async (event: any) => {
  try {
    await loadStory(false);
  } catch (error) {
    console.error('Error refreshing:', error);
  } finally {
    event.target.complete();
  }
};

const handleSubmit = async (submittedStory: Partial<story>) => {
  if (!submittedStory.name) {
    await showToast('Story name is required', 'warning', warningOutline);
    return;
  }
  try {
    if (editingId.value) {
      await firestoreService.updateStory(editingId.value, submittedStory as story);
    } else {
      await firestoreService.addStory(submittedStory as story);
    }
    await loadStory();
  } catch (error) {
    await showToast('Error submitting new story', 'danger', closeCircle);
    console.error('Error submitting new story:', error);
  } finally {
    isOpen.value = false;
    editingId.value = null;
  }
};

const handleDelete = async (story: story) => {
  try {
    await firestoreService.deleteStory(story.id!);
    await showToast('Your story deleted successfully', 'success', trash);
    loadStory();
  } catch (error) {
    await showToast('Error deleting your story', 'danger', closeCircle);
    console.error('Error deleting your story:', error);
  }
};

const handleEdit = (storyItem: story) => {
  isOpen.value = true;
  editingId.value = storyItem.id!;
  story.value = {
    name: storyItem.name,
    date: storyItem.date,
    location: storyItem.location,
    story: storyItem.story,
    status: storyItem.status
  };
};

const handleStatus = async (storyItem: story) => {
  if (!storyItem.id) return;
  
  try {
    await firestoreService.updateStory(storyItem.id, {
      ...storyItem,
      status: !storyItem.status
    });
    const message = storyItem.status
      ? 'Story marked as active'
      : 'Story marked as completed';
    await showToast(message);
    await loadStory();
  } catch (error) {
    await showToast('Error updating status', 'danger', closeCircle);
    console.error('Error updating status:', error);
  }
};

// Auto-refresh relative time every minute
let interval: NodeJS.Timeout;
onMounted(() => {
  loadStory();
  interval = setInterval(() => {
    timeUpdateTrigger.value++;
  }, 60000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
ion-card,
ion-accordion-group {
  width: 100%;
}

ion-fab {
  margin: 25px;
}

.limited-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

ion-card-title.limited-text {
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

ion-card-subtitle.limited-text {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.scrollable-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.accordion-container {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.scrollable-container::-webkit-scrollbar {
  width: 8px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>