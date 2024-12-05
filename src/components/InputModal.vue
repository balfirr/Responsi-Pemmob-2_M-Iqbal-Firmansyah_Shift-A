<!-- src/components/InputModal.vue -->
<template>
    <ion-modal :is-open="isOpen" @did-dismiss="cancel">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ editingId ? 'Edit' : 'Add' }} Story</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="cancel"><ion-icon :icon="close"></ion-icon></ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-item>
                <ion-input v-model="story.name" label="Name" label-placement="floating"
                    placeholder="Enter Your Story Name"></ion-input>
            </ion-item>
            <ion-item>
                <ion-input v-model="story.date" type="date" label="Date" label-placement="floating"></ion-input>
            </ion-item>
            <ion-item>
                <ion-input v-model="story.location" label="Location" label-placement="floating"
                    placeholder="Enter Location"></ion-input>
            </ion-item>
            <ion-row>
                <ion-col>
                    <ion-button type="button" @click="input" shape="round" color="primary" expand="block">
                        {{ editingId ? 'Edit' : 'Add' }} Story
                    </ion-button>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-modal>
</template>
<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonInput, IonRow, IonCol, IonItem, IonContent } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { story } from '@/utils/firestore';

const props = defineProps<{
    isOpen: boolean,
    editingId: string | null,
    story: Partial<story>
}>();

const emit = defineEmits<{
    'update:isOpen': [value: boolean],
    'update:editingId': [value: string | null],
    'submit': [item: Partial<story>]
}>();

const cancel = () => {
    emit('update:isOpen', false);
    emit('update:editingId', null);
    props.story.name = '';
    props.story.date = '';
    props.story.location = '';
}
const input = () => {
    emit('submit', props.story);
    cancel();
}
</script>