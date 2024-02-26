/* eslint-disable no-shadow */
import { Injectable, Inject } from '@nestjs/common';
import { QueueEvent, QueueEventService, StringHelper } from 'src/kernel';
import { Model } from 'mongoose';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { ObjectId } from 'mongodb';
import { CONVERSATION_TYPE, MESSAGE_CHANNEL, MESSAGE_EVENT } from '../constants';
import { MessageDto } from '../dtos';
import {
  CONVERSATION_MODEL_PROVIDER,
  NOTIFICATION_MESSAGE_MODEL_PROVIDER
} from '../providers';
import { ConversationModel, NotificationMessageModel } from '../models';

const MESSAGE_NOTIFY = 'MESSAGE_NOTIFY';

@Injectable()
export class MessageListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService,
    @Inject(CONVERSATION_MODEL_PROVIDER)
    private readonly conversationModel: Model<ConversationModel>,
    @Inject(NOTIFICATION_MESSAGE_MODEL_PROVIDER)
    private readonly NotificationMessageModel: Model<NotificationMessageModel>
  ) {
    this.queueEventService.subscribe(
      MESSAGE_CHANNEL,
      MESSAGE_NOTIFY,
      this.handleMessage.bind(this)
    );
  }

  private async handleMessage(event: QueueEvent): Promise<void> {
    if (event.eventName !== MESSAGE_EVENT.CREATED) return;
    const message = event.data as MessageDto;

    const conversation = await this.conversationModel
      .findOne({ _id: message.conversationId })
      .lean()
      .exec();
    if (![CONVERSATION_TYPE.PRIVATE, CONVERSATION_TYPE.GROUP].includes(conversation.type)) return;
    const receiverIds = (conversation.recipients || [])
      .map(r => r.sourceId)
      .filter(r => r.toString() !== message.senderId.toString());
    await this.updateNotification(conversation, receiverIds, 1);
    await this.handleNotify(receiverIds, message);
    await this.updateLastMessage(conversation, message);
  }

  private async updateLastMessage(
    conversation,
    message: MessageDto
  ): Promise<void> {
    const lastMessage = StringHelper.truncate(message.text || '', 30);
    const lastSenderId = message.senderId;
    const lastMessageCreatedAt = message.createdAt;
    await this.conversationModel.updateOne(
      { _id: conversation._id },
      {
        $set: {
          lastMessage,
          lastSenderId,
          lastMessageCreatedAt
        }
      },
      { upsert: false }
    );
  }

  private async updateNotification(
    conversation,
    receiverIds,
    num = 1
  ): Promise<void> {
    const availableData = await this.NotificationMessageModel.find({
      conversationId: conversation._id,
      recipientId: { $in: receiverIds }
    });
    if (availableData && availableData.length) {
      const ids = availableData.map(a => a._id);
      await this.NotificationMessageModel.updateMany(
        { _id: { $in: ids } },
        {
          $inc: { totalNotReadMessage: num },
          updatedAt: new Date()
        },
        { upsert: true }
      );
      receiverIds &&
        receiverIds.forEach(async receiverId => {
          const totalNotReadMessage = await this.NotificationMessageModel.aggregate(
            [
              {
                $match: { recipientId: receiverId }
              },
              {
                $group: {
                  _id: '$conversationId',
                  total: {
                    $sum: '$totalNotReadMessage'
                  }
                }
              }
            ]
          );
          let total = 0;
          totalNotReadMessage &&
            totalNotReadMessage.length &&
            totalNotReadMessage.forEach(data => {
              if (data.total) {
                total += data.total;
              }
            });
          await this.notifyCountingNotReadMessageInConversation(
            receiverId,
            total
          );
        });
      return;
    }

    receiverIds.forEach(async rId => {
      await new this.NotificationMessageModel({
        conversationId: conversation._id,
        recipientId: rId,
        totalNotReadMessage: num,
        updatedAt: new Date(),
        createdAt: new Date()
      }).save();
      const totalNotReadMessage = await this.NotificationMessageModel.aggregate(
        [
          {
            $match: { recipientId: rId }
          },
          {
            $group: {
              _id: '$conversationId',
              total: {
                $sum: '$totalNotReadMessage'
              }
            }
          }
        ]
      );
      let total = 0;
      totalNotReadMessage &&
        totalNotReadMessage.length &&
        totalNotReadMessage.forEach(data => {
          if (data.total) {
            total += data.total;
          }
        });
      await this.notifyCountingNotReadMessageInConversation(rId, total);
    });
  }

  private async notifyCountingNotReadMessageInConversation(
    receiverId: string | ObjectId,
    total: number
  ): Promise<void> {
    await this.socketUserService.emitToUsers(
      [receiverId] as any,
      'nofify_read_messages_in_conversation',
      { total }
    );
  }

  private async handleNotify(receiverIds, message): Promise<void> {
    await this.socketUserService.emitToUsers(
      receiverIds as any,
      'message_created',
      message
    );
  }
}
