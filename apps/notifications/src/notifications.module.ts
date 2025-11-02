import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsListenerService } from '@app/lib/sqs/sqs-listener.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/notifications/.env',
    }),
  ],
  controllers: [],
  providers: [
    NotificationsService,
    {
      provide: SqsListenerService,
      useFactory: (
        configService: ConfigService,
        notificationsService: NotificationsService,
      ) => {
        return new SqsListenerService(configService, [notificationsService]);
      },
      inject: [ConfigService, NotificationsService],
    },
  ],
})
export class NotificationsModule {}
