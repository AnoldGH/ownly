<template>
  <div class="file-header">
    <div class="header-content">
      <div class="file-info">
        <FontAwesomeIcon class="file-icon mr-2" :icon="fileIcon" size="sm" />
        <span class="filename">{{ filename }}</span>
      </div>

      <!-- Panels for file management -->
      <div class="header-actions">
        <button class="button is-small soft-if-dark" @click="() => { }">
          <FontAwesomeIcon :icon="faDownload" class="mr-1" />
          <span>Download (Placeholder)</span>
        </button>

        <!-- AvatarGroupButton to display collaborator avatars -->
        <AvatarGroupButton :profiles="collaborators" :max-visible="3" label="Collaborators"
          tooltip="View all collaborators" @click="handleViewCollaborators" />
      </div>
    </div>

    <!-- Collaborators Modal -->
    <CollaboratorsModal :show="showCollaboratorsModal" :collaborators="collaborators"
      @close="showCollaboratorsModal = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faFile,
  faFileCode,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFilePdf,
  faFileImage,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import * as utils from '@/utils';
import AvatarGroupButton from '@/components/AvatarGroupButton.vue';
import CollaboratorsModal from '@/components/CollaboratorsModal.vue';
import type { IProfile } from '@/services/types';

const props = defineProps<{
  filename: string;
  collaborators: IProfile[];
}>();

const showCollaboratorsModal = ref(false);

const fileIcon = computed(() => {
  const ext = utils.getExtensionType(props.filename);

  switch (ext) {
    case 'code':
    case 'latex':
      return faFileCode;
    case 'word':
    case 'milkdown':
      return faFileWord;
    case 'ppt':
      return faFilePowerpoint;
    case 'excel':
      return faFileExcel;
    case 'pdf':
      return faFilePdf;
    case 'image':
      return faFileImage;
    case 'excalidraw':
      return faFileImage;
    default:
      return faFile;
  }
});

const handleViewCollaborators = (event: MouseEvent) => {
  console.log('View collaborators clicked:', event);
  showCollaboratorsModal.value = true;
};
</script>

<style scoped lang="scss">
.file-header {
  background-color: var(--bulma-scheme-main-bis);
  border-bottom: 2px solid var(--bulma-scheme-main-ter);
  padding: 0.75rem 1rem;
  flex-shrink: 0;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;

    .file-info {
      display: flex;
      align-items: center;
      min-width: 0; // Allow text to shrink

      .file-icon {
        @media (prefers-color-scheme: dark) {
          color: var(--bulma-primary-invert, var(--bulma-primary));
        }

        flex-shrink: 0;
      }

      .filename {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--bulma-text-strong);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 300px; // Prevent very long filenames from breaking layout
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
  }
}

// Dark mode adjustments
@media (prefers-color-scheme: dark) {
  .file-header {
    background-color: var(--bulma-scheme-main-bis);
    border-bottom-color: var(--bulma-scheme-main-ter);
  }
}
</style>
