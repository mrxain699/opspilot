export interface RabbitMQEvent<T = unknown> {
  pattern: string;
  data: T;
}
