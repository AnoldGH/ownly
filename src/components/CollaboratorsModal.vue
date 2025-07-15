<template>
  <ModalComponent :show="show" @close="emit('close')">
    <div class="title is-5 mb-4">Active Collaborators</div>

    <div class="collaborators-list">
      <DynamicScroller class="scroller" ref="scroller" :items="collaborators" :min-item-size="10" key-field="name">
        <template #default="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :data-index="index" class="collaborator-profile">
            <div class="px-4 pt-2 pb-2">
              <div class="holder">
                <div class="avatar">
                  <img :src="utils.makeAvatar(item.name)" :key="item.name" alt="avatar" />
                </div>

                <div class="Info">
                  <div class="header">
                    <span class="name">{{ item.name }}</span>
                  </div>

                  <div class="email" v-if="item.email">{{ item.email }}</div>
                </div>

                <div class="badge" v-if="item.owner">
                  Owner
                </div>
                <div class="badge" v-else>
                  Member
                </div>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>

    <div class="field has-text-right mt-2">
      <div class="control">
        <button class="button" @click="emit('close')">Close</button>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import ModalComponent from './ModalComponent.vue';
import * as utils from '@/utils';
import type { IProfile } from '@/services/types';

defineProps<{
  show: boolean;
  collaborators: IProfile[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Element references
const scroller = useTemplateRef<typeof DynamicScroller>('scroller');
</script>

<style scoped lang="scss">
.collaborators-list {
  .scroller {
    flex: 1;
    overflow-y: auto;
    max-height: 300px;

    .collaborator-profile {
      &:hover {
        background-color: rgba(0, 0, 0, 0.03);
      }

      .holder {
        display: flex;
        flex-direction: row;

        .avatar {
          min-width: 36px;
          max-height: 36px;
          object-fit: cover;
          border-radius: 5px;
          overflow: hidden;
          margin-right: 10px;
          transform: translateY(4px); // visual hack

          >img {
            width: 36px;
            height: 36px;
          }
        }

        .Info {
          flex: 1;
          display: flex;
          flex-direction: column;
          font-size: 14px;
          line-height: 1.5;

          .name {
            font-weight: bold;
          }

          .email {
            white-space: normal;
          }
        }

        .badge {
          margin-left: auto;
          padding-right: 4%;
          align-content: center;
          font-style: italic;
        }
      }
    }
  }
}
</style>
