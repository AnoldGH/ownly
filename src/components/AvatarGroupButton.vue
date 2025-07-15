<template>
  <button class="avatar-group-button" :class="{ 'clickable': clickable }" @click="handleClick" :title="tooltip">
    <div class="avatar-stack" :style="{ width: `${avatarStackWidth}px` }">
      <div v-for="(profile, index) in visibleProfiles" :key="profile.name || index" class="avatar-item" :style="{
        zIndex: visibleProfiles.length - index,
        left: `${index * avatarSpacing}px`
      }">
        <img :src="utils.makeAvatar(profile.name)" :alt="profile.name || 'Member'" class="avatar-image" />
      </div>

      <!-- Overflow indicator -->
      <div v-if="hasOverflow" class="avatar-overflow" :style="{ left: `${visibleProfiles.length * avatarSpacing}px` }">
        <span class="overflow-count">+{{ overflowCount }}</span>
      </div>
    </div>

    <span v-if="showLabel && label" class="button-label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as utils from '@/utils';
import type { IProfile } from '@/services/types';

const avatarSize = 24;
const avatarSpacing = avatarSize / 2;
const avatarSizePx = `${avatarSize}px`;

const props = withDefaults(defineProps<{
  profiles: IProfile[];
  maxVisible?: number;
  label?: string;
  showLabel?: boolean;
  clickable?: boolean;
  tooltip?: string;
}>(), {
  maxVisible: 5,
  label: 'Members',
  showLabel: true,
  clickable: true,
  tooltip: 'View all members'
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const visibleProfiles = computed(() => {
  return props.profiles.slice(0, props.maxVisible);
});

const hasOverflow = computed(() => {
  return props.profiles.length > props.maxVisible;
});

const overflowCount = computed(() => {
  return props.profiles.length - props.maxVisible;
});

const avatarStackWidth = computed(() => {
  const count = visibleProfiles.value.length;
  if (count === 0) return avatarSize;
  if (hasOverflow.value) {
    return (count + 2) * avatarSpacing;
  }
  return (count + 1) * avatarSpacing;
});

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event);
  }
};
</script>

<style scoped lang="scss">
.avatar-group-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--bulma-scheme-main-ter);
  border-radius: 0.375rem;
  background-color: var(--bulma-scheme-main);
  color: var(--bulma-text);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: default;
  min-width: fit-content;

  &.clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--bulma-scheme-main-bis);
      border-color: var(--bulma-scheme-main-quad);
    }

    &:active {
      background-color: var(--bulma-scheme-main-ter);
    }
  }

  .avatar-stack {
    position: relative;
    display: flex;
    align-items: center;
    height: v-bind(avatarSizePx);
    min-width: v-bind(avatarSizePx);
    flex-shrink: 0;

    .avatar-item {
      position: absolute;
      width: v-bind(avatarSizePx);
      height: v-bind(avatarSizePx);
      border-radius: 50%;
      border: 2px solid var(--bulma-scheme-main);
      overflow: hidden;
      background-color: var(--bulma-scheme-main-bis);

      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .avatar-overflow {
      position: absolute;
      width: v-bind(avatarSizePx);
      height: v-bind(avatarSizePx);
      border-radius: 50%;
      background-color: var(--bulma-scheme-main-ter);
      border: 2px solid var(--bulma-scheme-main);
      display: flex;
      align-items: center;
      justify-content: center;

      .overflow-count {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--bulma-text-strong);
      }
    }
  }

  .button-label {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

// Dark mode adjustments
@media (prefers-color-scheme: dark) {
  .avatar-group-button {
    border-color: var(--bulma-scheme-main-quad);

    .avatar-stack {
      .avatar-item {
        border-color: var(--bulma-scheme-main-bis);
      }

      .avatar-overflow {
        border-color: var(--bulma-scheme-main-bis);
      }
    }
  }
}
</style>
