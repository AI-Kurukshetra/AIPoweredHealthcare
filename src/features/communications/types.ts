export type CommunicationChannel = {
  id: string;
  name: string;
  channelType: string;
  patientId: string | null;
  createdAt: string;
};

export type CommunicationMessage = {
  id: string;
  channelId: string;
  senderId: string;
  body: string;
  escalationFlag: boolean;
  createdAt: string;
};

export type CreateChannelInput = {
  name: string;
  channelType?: "team" | "patient";
  patientId?: string;
};

export type CreateMessageInput = {
  body: string;
  escalationFlag?: boolean;
};
