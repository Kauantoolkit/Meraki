import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../viewmodel/inbox_viewmodel.dart';
import '../model/message_model.dart';

class InboxScreen extends ConsumerStatefulWidget {
  const InboxScreen({super.key});

  @override
  ConsumerState<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends ConsumerState<InboxScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  bool _showChat = false; // mobile: false = contacts list, true = chat

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _send() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    ref.read(inboxViewModelProvider.notifier).sendMessage(text);
    _msgCtrl.clear();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(inboxViewModelProvider);
    final isWide = MediaQuery.of(context).size.width >= 700;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppTheme.slate900,
        body: Column(
          children: [
            // ─── Header ───────────────────────────────────────────────────
            SafeArea(
              bottom: false,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: AppTheme.slate900,
                  border: Border(
                      bottom: BorderSide(color: AppTheme.slate200, width: 1)),
                ),
                child: Row(
                  children: [
                    if (_showChat && !isWide)
                      IconButton(
                        icon: const Icon(Icons.arrow_back,
                            color: Colors.white, size: 20),
                        onPressed: () => setState(() => _showChat = false),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                            minWidth: 32, minHeight: 32),
                      ),
                    RichText(
                      text: TextSpan(
                        style: GoogleFonts.sourceCodePro(
                            fontSize: 13, color: AppTheme.slate500),
                        children: [
                          const TextSpan(text: 'MERAKI // '),
                          TextSpan(
                            text: 'SECURE_INBOX',
                            style: GoogleFonts.sourceCodePro(
                                fontSize: 13,
                                color: Colors.white,
                                fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    if (_showChat && !isWide) ...[
                      // Chat header: contact name + online
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            state.activeContact.name,
                            style: GoogleFonts.sourceCodePro(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w700),
                          ),
                          if (state.activeContact.online)
                            Text(
                              '● ONLINE',
                              style: GoogleFonts.sourceCodePro(
                                  color: AppTheme.brand,
                                  fontSize: 9,
                                  letterSpacing: 1),
                            ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // ─── Body ─────────────────────────────────────────────────────
            Expanded(
              child: isWide
                  ? Row(
                      children: [
                        SizedBox(
                          width: 260,
                          child: _ContactsList(state: state),
                        ),
                        Container(width: 1, color: AppTheme.slate200),
                        Expanded(child: _ChatArea(state: state, scrollCtrl: _scrollCtrl, msgCtrl: _msgCtrl, onSend: _send)),
                      ],
                    )
                  : _showChat
                      ? _ChatArea(state: state, scrollCtrl: _scrollCtrl, msgCtrl: _msgCtrl, onSend: _send)
                      : _ContactsList(
                          state: state,
                          onSelectContact: (id) {
                            ref.read(inboxViewModelProvider.notifier).selectContact(id);
                            setState(() => _showChat = true);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Contacts list ────────────────────────────────────────────────────────────

class _ContactsList extends ConsumerWidget {
  final InboxState state;
  final void Function(String id)? onSelectContact;

  const _ContactsList({required this.state, this.onSelectContact});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      color: AppTheme.slate900,
      child: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextFormField(
              onChanged: (v) =>
                  ref.read(inboxViewModelProvider.notifier).updateSearch(v),
              style: GoogleFonts.sourceCodePro(
                  color: Colors.white, fontSize: 12),
              decoration: const InputDecoration(
                hintText: 'Procurar Contatos...',
                prefixIcon:
                    Icon(Icons.search, size: 18, color: AppTheme.slate500),
                contentPadding: EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
          // Contact items
          Expanded(
            child: ListView.builder(
              itemCount: state.filteredContacts.length,
              itemBuilder: (_, i) {
                final contact = state.filteredContacts[i];
                final isActive = contact.id == state.activeContactId;
                return GestureDetector(
                  onTap: () {
                    ref.read(inboxViewModelProvider.notifier).selectContact(contact.id);
                    onSelectContact?.call(contact.id);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      color: isActive
                          ? AppTheme.brandLight
                          : Colors.transparent,
                      border: isActive
                          ? const Border(
                              left: BorderSide(
                                  color: AppTheme.brand, width: 2))
                          : null,
                    ),
                    child: Row(
                      children: [
                        _Avatar(contact: contact),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Flexible(
                                    child: Text(
                                      contact.name,
                                      style: GoogleFonts.sourceCodePro(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    contact.time,
                                    style: GoogleFonts.sourceCodePro(
                                        color: AppTheme.slate500,
                                        fontSize: 9),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      contact.lastMessage,
                                      style: GoogleFonts.sourceCodePro(
                                          color: AppTheme.slate500,
                                          fontSize: 10),
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                  ),
                                  if (contact.unread > 0)
                                    Container(
                                      width: 16,
                                      height: 16,
                                      decoration: const BoxDecoration(
                                        color: AppTheme.brand,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: Text(
                                          contact.unread.toString(),
                                          style: GoogleFonts.sourceCodePro(
                                              color: AppTheme.slate900,
                                              fontSize: 8,
                                              fontWeight:
                                                  FontWeight.w700),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Chat area ────────────────────────────────────────────────────────────────

class _ChatArea extends StatelessWidget {
  final InboxState state;
  final ScrollController scrollCtrl;
  final TextEditingController msgCtrl;
  final VoidCallback onSend;

  const _ChatArea({
    required this.state,
    required this.scrollCtrl,
    required this.msgCtrl,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    final contact = state.activeContact;

    return Column(
      children: [
        // Chat header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: const BoxDecoration(
            color: AppTheme.slate100,
            border: Border(
                bottom: BorderSide(color: AppTheme.slate200, width: 1)),
          ),
          child: Row(
            children: [
              _Avatar(contact: contact),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    contact.name,
                    style: GoogleFonts.sourceCodePro(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w700),
                  ),
                  if (contact.online)
                    Text(
                      '● ONLINE',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.brand,
                          fontSize: 9,
                          letterSpacing: 1),
                    )
                  else
                    Text(
                      'OFFLINE',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500, fontSize: 9),
                    ),
                ],
              ),
            ],
          ),
        ),

        // Connection status banner
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          color: AppTheme.brandLight,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline,
                  size: 10, color: AppTheme.brand),
              const SizedBox(width: 6),
              Text(
                'CONEXÃO_SEGURA_ESTABELECIDA',
                style: GoogleFonts.sourceCodePro(
                    color: AppTheme.brand,
                    fontSize: 9,
                    letterSpacing: 1,
                    fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: scrollCtrl,
            padding: const EdgeInsets.all(16),
            itemCount: state.messages.length,
            itemBuilder: (_, i) {
              final msg = state.messages[i];
              return _MessageBubble(message: msg, contact: contact);
            },
          ),
        ),

        // Input bar
        Container(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
          decoration: const BoxDecoration(
            color: AppTheme.slate100,
            border: Border(
                top: BorderSide(color: AppTheme.slate200, width: 1)),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.attach_file_rounded,
                      size: 18, color: AppTheme.slate500),
                  onPressed: () {},
                  padding: EdgeInsets.zero,
                  constraints:
                      const BoxConstraints(minWidth: 32, minHeight: 32),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextFormField(
                    controller: msgCtrl,
                    style: GoogleFonts.sourceCodePro(
                        color: Colors.white, fontSize: 12),
                    decoration: const InputDecoration(
                      hintText: 'Transmita a sua mensagem... [ENTER para enviar]',
                      contentPadding: EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                    ),
                    onFieldSubmitted: (_) => onSend(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: onSend,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppTheme.brand,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'SEND()',
                      style: GoogleFonts.sourceCodePro(
                        color: AppTheme.slate900,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final MessageModel message;
  final ContactModel contact;

  const _MessageBubble({required this.message, required this.contact});

  @override
  Widget build(BuildContext context) {
    final isMe = message.isMe;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: AppTheme.slate200,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Center(
                child: Text(
                  contact.isSystem
                      ? 'M'
                      : contact.name.substring(0, 1),
                  style: GoogleFonts.sourceCodePro(
                      color: AppTheme.brand,
                      fontSize: 11,
                      fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                if (!isMe)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4, left: 2),
                    child: Text(
                      '${contact.name}  ${message.time}',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500, fontSize: 9),
                    ),
                  ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMe ? AppTheme.brandLight : AppTheme.slate100,
                    border: Border.all(
                      color: isMe
                          ? AppTheme.brand.withOpacity(0.3)
                          : AppTheme.slate200,
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    message.text,
                    style: GoogleFonts.sourceCodePro(
                      color: Colors.white,
                      fontSize: 12,
                      height: 1.5,
                    ),
                  ),
                ),
                if (isMe)
                  Padding(
                    padding: const EdgeInsets.only(top: 4, right: 2),
                    child: Text(
                      '${message.time}  Você',
                      style: GoogleFonts.sourceCodePro(
                          color: AppTheme.slate500, fontSize: 9),
                    ),
                  ),
              ],
            ),
          ),
          if (isMe) ...[
            const SizedBox(width: 8),
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: AppTheme.brandLight,
                border:
                    Border.all(color: AppTheme.brand.withOpacity(0.4)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Icon(Icons.person, size: 16, color: AppTheme.brand),
            ),
          ],
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final ContactModel contact;
  const _Avatar({required this.contact});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: contact.isSystem ? AppTheme.brandLight : AppTheme.slate200,
            border: Border.all(
                color: contact.isSystem
                    ? AppTheme.brand.withOpacity(0.4)
                    : AppTheme.slate200),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Center(
            child: contact.isSystem
                ? const Icon(Icons.terminal_rounded,
                    size: 16, color: AppTheme.brand)
                : Text(
                    contact.name.substring(0, 1),
                    style: GoogleFonts.sourceCodePro(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700),
                  ),
          ),
        ),
        if (contact.online)
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: AppTheme.brand,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.slate900, width: 1.5),
              ),
            ),
          ),
      ],
    );
  }
}
