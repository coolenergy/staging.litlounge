import { Injectable, Logger } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { PERFORMER_CHANNEL } from 'src/modules/performer/constants';
import { PerformerService } from 'src/modules/performer/services';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { PUBLIC_CHAT } from 'src/modules/stream/constant';
import { StreamDto } from 'src/modules/stream/dtos';
import { StreamService } from 'src/modules/stream/services';
import { v4 as uuidv4 } from 'uuid';
import { MESSAGE_PRIVATE_STREAM_CHANNEL, MESSAGE_EVENT } from '../constants';
import { MessageDto } from '../dtos';
import { ConversationService } from '../services';

const MESSAGE_STREAM_NOTIFY = 'MESSAGE_STREAM_NOTIFY';
const CONVERSATION_INITIALIZE = 'CONVERSATION_INITIALIZE';

@Injectable()
export class StreamMessageListener {
  private readonly logger = new Logger();

  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService,
    private readonly conversationService: ConversationService,
    private readonly performerService: PerformerService,
    private readonly streamService: StreamService
  ) {
    this.queueEventService.subscribe(
      MESSAGE_PRIVATE_STREAM_CHANNEL,
      MESSAGE_STREAM_NOTIFY,
      this.handleMessage.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_CHANNEL,
      CONVERSATION_INITIALIZE,
      this.handleConversation.bind(this)
    );
  }

  private async handleMessage(event: QueueEvent): Promise<void> {
    if (
      ![MESSAGE_EVENT.CREATED, MESSAGE_EVENT.DELETED].includes(event.eventName)
    )
      return;
    const message = event.data as MessageDto;

    const conversation = await this.conversationService.findById(
      message.conversationId
    );
    // handle stream message only
    if (!conversation?.type.includes('stream_')) return;
    if (event.eventName === MESSAGE_EVENT.CREATED) {
      await this.handleNotify(conversation, message);
    }
    if (event.eventName === MESSAGE_EVENT.DELETED) {
      await this.handleNotifyDelete(conversation, message);
    }
  }

  private async handleNotify(conversation, message): Promise<void> {
    const roomName = this.conversationService.serializeConversation(
      conversation._id,
      conversation.type
    );
    await this.socketUserService.emitToRoom(
      roomName,
      `message_created_conversation_${conversation._id}`,
      message
    );
  }

  private async handleNotifyDelete(conversation, message): Promise<void> {
    const roomName = this.conversationService.serializeConversation(
      conversation._id,
      conversation.type
    );
    await this.socketUserService.emitToRoom(
      roomName,
      `message_deleted_conversation_${conversation._id}`,
      message
    );
  }

  private async handleConversation(event: QueueEvent) {
    try {
      const { eventName, data } = event;
      if (eventName !== EVENT.CREATED) {
        return;
      }

      const performer = await this.performerService.findById(data.id);
      if (!performer) {
        return;
      }

      const stream = await this.streamService.create({
        sessionId: uuidv4(),
        performerId: performer._id,
        type: PUBLIC_CHAT
      });

      await this.conversationService.createStreamConversation(new StreamDto(stream));
    } catch (e) {
      this.logger.error(e);
    }
  }
}
