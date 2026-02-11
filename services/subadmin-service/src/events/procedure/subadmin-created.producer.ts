import { Producer, Kafka, Message } from 'kafkajs';
import logger from '../../config/logger';
import { config } from '../../config/config';

// Kafka setup
const kafka = new Kafka({
  clientId: config.SERVICE_NAME,
  brokers: [config.KAFKA_BROKER],
});

export const producer: Producer = kafka.producer();

// DTO / TypeScript interface for SuperAdmin event
export interface SubAdminCreatedEvent {
  id: number;
  email: string;
  createdAt: string;
}

// Connect producer (manual call when service starts)
export const connectProducer = async () => {
  try {
    await producer.connect();
    logger.info('Kafka SuperAdmin producer connected');
  } catch (error) {
    logger.error('Failed to connect Kafka producer', error);
    throw error;
  }
};

// Publish SuperAdmin created event
export const publishSuperAdminCreated = async (
  data: SubAdminCreatedEvent
) => {
  try {
    const message: Message = {
      value: JSON.stringify(data),
    };

    await producer.send({
      topic: 'SUPERADMIN_CREATED', // Kafka topic
      messages: [message],
    });

    logger.info(`SuperAdmin created event published for id: ${data.id}`);
  } catch (error) {
    logger.error('Failed to publish SuperAdmin created event', error);
    throw error;
  }
};

// Example usage for static SuperAdmin
export const publishUserCreated = async (
  data: SubAdminCreatedEvent
) => {
  try {
    await producer.send({
      topic: 'USER_CREATED',
      messages: [
        {
          value: JSON.stringify(data),
        },
      ],
    });

    logger.info(`User created event published for id: ${data.id}`);
  } catch (error) {
    logger.error('Failed to publish user created event', error);
    throw error;
  }
};
