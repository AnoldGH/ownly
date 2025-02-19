import { EventEmitter } from 'events';
import * as Y from 'yjs';

import type { IChatChannel, IChatMessage } from './types';
import { GlobalBus } from './event-bus';
import { SvsProvider } from './svs-provider';

import type TypedEmitter from 'typed-emitter';

export class WorkspaceChat {
  private readonly chatChannels: Y.Array<IChatChannel>;
  private readonly chatMessages: Y.Map<Y.Array<IChatMessage>>;

  public readonly events = new EventEmitter() as TypedEmitter<{
    chat: (channel: string, message: IChatMessage) => void;
  }>;

  /**
   * Private constructor for the chat module
   *
   * @param doc Y.Doc instance
   */
  private constructor(private readonly doc: Y.Doc) {
    this.chatChannels = doc.getArray<IChatChannel>('_chan_');
    this.chatMessages = doc.getMap<Y.Array<IChatMessage>>('_msg_');

    const chanObserver = () => GlobalBus.emit('chat-channels', this.chatChannels.toArray());
    this.chatChannels.observe(chanObserver);
    chanObserver();

    this.chatMessages.observeDeep((events) => {
      if (this.events.listenerCount('chat') === 0) return;
      for (const event of events) {
        const channel = String(event.path[0]);
        for (const delta of event.changes.added) {
          for (const message of delta.content.getContent()) {
            this.events.emit('chat', channel, message);
          }
        }
      }
    });
  }

  /**
   * Create the chat module
   */
  public static async create(provider: SvsProvider): Promise<WorkspaceChat> {
    const doc = await provider.getDoc('chat');
    return new WorkspaceChat(doc);
  }

  /**
   * Destroy the chat module
   */
  public async destroy() {
    this.doc.destroy();
  }

  /**
   * Get chat channels
   *
   * @returns Array of chat channels
   */
  public async getChannels(): Promise<IChatChannel[]> {
    return this.chatChannels.toArray();
  }

  /**
   * Create a new chat channel
   *
   * @param channel Chat channel
   */
  public async newChannel(channel: IChatChannel) {
    this.chatChannels.push([channel]);
    this.chatMessages.set(channel.name, new Y.Array<IChatMessage>());
  }

  /**
   * Get the messages array for a chat channel
   *
   * @param channel Chat channel
   */
  private async getMsgArray(channel: string): Promise<Y.Array<IChatMessage>> {
    const array = this.chatMessages.get(channel);
    if (!array) throw new Error('Channel does not exist');
    return array;
  }

  /**
   * Get history of chat messages
   *
   * @returns Array of chat messages
   */
  public async getMessages(channel: string): Promise<IChatMessage[]> {
    const array = await this.getMsgArray(channel);
    if (!array) throw new Error('Channel does not exist');
    return array.toArray();
  }

  /**
   * Send chat message to a channel
   *
   * @param message Chat message
   */
  public async sendMessage(channel: string, message: IChatMessage) {
    (await this.getMsgArray(channel)).push([message]);
  }
}
