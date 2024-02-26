import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { ConversationService } from './conversation.service';
import { NotificationMessageModel } from '../models';
import { NOTIFICATION_MESSAGE_MODEL_PROVIDER } from '../providers';

@Injectable()
export class NotificationMessageService {
  constructor(
    @Inject(NOTIFICATION_MESSAGE_MODEL_PROVIDER)
    private readonly notificationMessageModel: Model<NotificationMessageModel>,
    private readonly conversationService: ConversationService,
    private readonly socketUserService: SocketUserService
  ) { }

  public async recipientReadAllMessageInConversation(recipientId: string | ObjectId, conversationId: string | ObjectId): Promise<any> {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const found = conversation.recipients.find(
      (recipient) => recipient.sourceId.toString() === recipientId.toString()
    );
    if (!found) {
      throw new EntityNotFoundException();
    }

    const notification = await this.notificationMessageModel.findOne({
      recipientId,
      conversationId
    });
    if (!notification) {
      return { ok: false };
    }
    notification.totalNotReadMessage = 0;
    await notification.save();

    const totalNotReadMessage = await this.notificationMessageModel.aggregate([
      {
        $match: { recipientId }
      },
      {
        $group: {
          _id: '$conversationId',
          total: {
            $sum: '$totalNotReadMessage'
          }
        }
      }
    ]);
    let total = 0;
    totalNotReadMessage && totalNotReadMessage.length && totalNotReadMessage.forEach((data) => {
      if (data.total) {
        total += data.total;
      }
    });
    this.socketUserService.emitToUsers([recipientId] as any, 'nofify_read_messages_in_conversation', { total });
    return { ok: true };
  }

  public async countTotalNotReadMessage(user: UserDto): Promise<any> {
    const totalNotReadMessage = await this.notificationMessageModel.aggregate([
      {
        $match: { recipientId: user._id }
      },
      {
        $group: {
          _id: '$conversationId',
          total: {
            $sum: '$totalNotReadMessage'
          }
        }
      }
    ]);
    let total = 0;
    if (!totalNotReadMessage || !totalNotReadMessage.length) {
      return { total };
    }
    totalNotReadMessage.forEach((data) => {
      if (data.total) {
        total += data.total;
      }
    });
    return { total };
  }
}
