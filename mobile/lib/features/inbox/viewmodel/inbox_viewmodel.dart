import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../model/message_model.dart';

// ─── Initial mock data (same as React web) ────────────────────────────────────

final _mockContacts = [
  const ContactModel(
    id: '1',
    name: 'TechCorp Inc.',
    lastMessage: 'Pode explicar melhor a arquitetura...',
    time: 'Agora',
    online: true,
    unread: 0,
  ),
  const ContactModel(
    id: '2',
    name: 'Meraki System',
    lastMessage: 'O projeto PRJ-J671 foi atualizado...',
    time: '1 dia',
    online: false,
    unread: 1,
    isSystem: true,
  ),
];

final _mockMessages = [
  const MessageModel(
    id: '1',
    isMe: false,
    text: 'Olá! Analisámos a sua proposta para o desenvolvimento em NestJS.',
    time: '14:20',
  ),
  const MessageModel(
    id: '2',
    isMe: false,
    text: 'Gostaríamos de saber mais sobre a sua abordagem à arquitetura de banco de dados.',
    time: '14:22',
  ),
  const MessageModel(
    id: '3',
    isMe: true,
    text: 'Claro! Proponho usar PostgreSQL para lidar com as relações de forma robusta e otimizada.',
    time: '14:31',
  ),
];

// ─── State ────────────────────────────────────────────────────────────────────

class InboxState {
  final List<ContactModel> contacts;
  final List<MessageModel> messages;
  final String activeContactId;
  final String search;

  const InboxState({
    required this.contacts,
    required this.messages,
    required this.activeContactId,
    this.search = '',
  });

  ContactModel get activeContact =>
      contacts.firstWhere((c) => c.id == activeContactId);

  List<ContactModel> get filteredContacts => search.isEmpty
      ? contacts
      : contacts
          .where((c) => c.name.toLowerCase().contains(search.toLowerCase()))
          .toList();

  InboxState copyWith({
    List<ContactModel>? contacts,
    List<MessageModel>? messages,
    String? activeContactId,
    String? search,
  }) =>
      InboxState(
        contacts: contacts ?? this.contacts,
        messages: messages ?? this.messages,
        activeContactId: activeContactId ?? this.activeContactId,
        search: search ?? this.search,
      );
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

class InboxViewModel extends Notifier<InboxState> {
  @override
  InboxState build() => InboxState(
        contacts: _mockContacts,
        messages: _mockMessages,
        activeContactId: _mockContacts.first.id,
      );

  void selectContact(String contactId) {
    state = state.copyWith(activeContactId: contactId);
  }

  void updateSearch(String query) {
    state = state.copyWith(search: query);
  }

  void sendMessage(String text) {
    if (text.trim().isEmpty) return;
    final msg = MessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      isMe: true,
      text: text.trim(),
      time: _formatTime(DateTime.now()),
    );
    state = state.copyWith(messages: [...state.messages, msg]);
  }

  String _formatTime(DateTime dt) =>
      '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
}

final inboxViewModelProvider = NotifierProvider<InboxViewModel, InboxState>(
  InboxViewModel.new,
);
