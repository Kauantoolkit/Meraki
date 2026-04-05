class ContactModel {
  final String id;
  final String name;
  final String lastMessage;
  final String time;
  final bool online;
  final int unread;
  final bool isSystem;

  const ContactModel({
    required this.id,
    required this.name,
    required this.lastMessage,
    required this.time,
    this.online = false,
    this.unread = 0,
    this.isSystem = false,
  });
}

class MessageModel {
  final String id;
  final bool isMe;
  final String text;
  final String time;

  const MessageModel({
    required this.id,
    required this.isMe,
    required this.text,
    required this.time,
  });
}
