// Typing Scene: Interactive progressive code generation
// Phase 1: User types inside void main() {} shell
// Phase 2: Auto-generation types out a full Dart project char-by-char

import gsap from 'gsap';
import { AudioManager } from '../utils/AudioManager.js';

// A complete, coherent Flutter/Dart file — displayed sequentially, loops when exhausted
const DART_CODE_LINES = [
  "import 'package:flutter/material.dart';",
  "import 'dart:ui';",
  "import 'package:supabase_flutter/supabase_flutter.dart';",
  "import 'models/film.dart';",
  "import 'models/film_manager.dart';",
  "import 'screens/custom_film_editor.dart';",
  "import 'screens/film_detail_page.dart';",
  "import 'l10n/app_strings.dart';",
  "import 'services/film_sync_service.dart';",
  "import 'services/subscription_service.dart';",
  "",
  "/// Entry point of the application.",
  "void main() async {",
  "  WidgetsFlutterBinding.ensureInitialized();",
  "  await Supabase.initialize(",
  "    url: const String.fromEnvironment('SUPABASE_URL'),",
  "    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),",
  "  );",
  "  runApp(const FilmsApp());",
  "}",
  "",
  "class FilmsApp extends StatelessWidget {",
  "  const FilmsApp({super.key});",
  "",
  "  @override",
  "  Widget build(BuildContext context) {",
  "    return MaterialApp(",
  "      title: 'Films',",
  "      theme: ThemeData.dark().copyWith(",
  "        scaffoldBackgroundColor: Colors.black,",
  "        primaryColor: Colors.white,",
  "      ),",
  "      home: const FilmsPage(),",
  "    );",
  "  }",
  "}",
  "",
  "class FilmsPage extends StatefulWidget {",
  "  const FilmsPage({super.key});",
  "",
  "  @override",
  "  State<FilmsPage> createState() => _FilmsPageState();",
  "}",
  "",
  "class _FilmsPageState extends State<FilmsPage>",
  "    with SingleTickerProviderStateMixin {",
  "  final FilmManager _filmManager = FilmManager();",
  "  late final AnimationController _fadeController;",
  "  bool _isLoading = true;",
  "  List<Film?> _selectedFilms = [];",
  "  int? _selectingSlotIndex;",
  "  bool _needsSync = false;",
  "  bool _isSyncing = false;",
  "  String? _errorMessage;",
  "",
  "  @override",
  "  void initState() {",
  "    super.initState();",
  "    _fadeController = AnimationController(",
  "      vsync: this,",
  "      duration: const Duration(milliseconds: 400),",
  "    );",
  "    _filmManager.addListener(_refreshFilmsList);",
  "    FilmSyncService.instance.isSyncing.addListener(_onSyncStateChanged);",
  "    _initializeFilms();",
  "  }",
  "",
  "  @override",
  "  void dispose() {",
  "    _fadeController.dispose();",
  "    _filmManager.removeListener(_refreshFilmsList);",
  "    FilmSyncService.instance.isSyncing.removeListener(_onSyncStateChanged);",
  "    super.dispose();",
  "  }",
  "",
  "  void _onSyncStateChanged() {",
  "    if (!mounted) return;",
  "    setState(() {",
  "      _isSyncing = FilmSyncService.instance.isSyncing.value;",
  "    });",
  "  }",
  "",
  "  Future<void> _initializeFilms() async {",
  "    try {",
  "      await _filmManager.initialize();",
  "      _refreshFilmsList();",
  "      _fadeController.forward();",
  "    } catch (e) {",
  "      if (mounted) {",
  "        setState(() {",
  "          _errorMessage = e.toString();",
  "          _isLoading = false;",
  "        });",
  "      }",
  "    }",
  "  }",
  "",
  "  Future<void> _onRefresh() async {",
  "    if (_isSyncing) return;",
  "    setState(() => _isSyncing = true);",
  "    try {",
  "      await FilmSyncService.instance.syncIfAuthed();",
  "      await _filmManager.refreshCustomFilms();",
  "      _refreshFilmsList();",
  "    } catch (e) {",
  "      if (mounted) setState(() => _errorMessage = e.toString());",
  "    } finally {",
  "      if (mounted) setState(() => _isSyncing = false);",
  "    }",
  "  }",
  "",
  "  void _refreshFilmsList() {",
  "    if (!mounted) return;",
  "    setState(() {",
  "      _isLoading = false;",
  "      _selectedFilms = List.from(_filmManager.selectedFilms);",
  "    });",
  "  }",
  "",
  "  void _navigateToFilmDetail(Film film) async {",
  "    final result = await Navigator.push<bool>(",
  "      context,",
  "      MaterialPageRoute(",
  "        builder: (context) => FilmDetailPage(film: film),",
  "      ),",
  "    );",
  "    if (result == true && mounted) {",
  "      await _filmManager.refreshCustomFilms();",
  "      _refreshFilmsList();",
  "    }",
  "  }",
  "",
  "  void _navigateToCustomFilmEditor() {",
  "    _openCustomFilmEditor(null);",
  "  }",
  "",
  "  Future<void> _openCustomFilmEditor(Film? film) async {",
  "    final result = await Navigator.push<Film>(",
  "      context,",
  "      MaterialPageRoute(",
  "        builder: (context) => CustomFilmEditor(film: film),",
  "        fullscreenDialog: true,",
  "      ),",
  "    );",
  "    if (result != null && mounted) {",
  "      await _filmManager.addCustomFilm(result);",
  "      _refreshFilmsList();",
  "    }",
  "  }",
  "",
  "  void _replaceFilmInSlot(Film film) async {",
  "    if (_isSyncing || _selectingSlotIndex == null) return;",
  "    final slotIndex = _selectingSlotIndex!;",
  "    await _filmManager.selectFilm(slotIndex, film);",
  "    if (!mounted) return;",
  "    setState(() {",
  "      _selectedFilms[slotIndex] = film;",
  "      _selectingSlotIndex = null;",
  "      _needsSync = true;",
  "    });",
  "    _pushSyncIfAuthed();",
  "  }",
  "",
  "  void _clearFilmSlot(int slotIndex) async {",
  "    await _filmManager.selectFilm(slotIndex, null);",
  "    if (!mounted) return;",
  "    setState(() {",
  "      _selectedFilms[slotIndex] = null;",
  "      _needsSync = true;",
  "    });",
  "    _pushSyncIfAuthed();",
  "  }",
  "",
  "  void _toggleFavorite(Film film) async {",
  "    if (_isSyncing) return;",
  "    await _filmManager.toggleFavorite(film.id);",
  "    if (mounted) setState(() {});",
  "    _pushSyncIfAuthed();",
  "  }",
  "",
  "  Future<void> _pushSyncIfAuthed() async {",
  "    final user = Supabase.instance.client.auth.currentUser;",
  "    if (user != null) {",
  "      await FilmSyncService.instance.pushPreferences(user.id);",
  "    }",
  "  }",
  "",
  "  @override",
  "  Widget build(BuildContext context) {",
  "    return Scaffold(",
  "      backgroundColor: Colors.black,",
  "      appBar: AppBar(",
  "        backgroundColor: Colors.transparent,",
  "        elevation: 0,",
  "        title: const Text(",
  "          'Films',",
  "          style: TextStyle(",
  "            color: Colors.white,",
  "            fontSize: 20,",
  "            fontWeight: FontWeight.w300,",
  "            letterSpacing: 4,",
  "          ),",
  "        ),",
  "        actions: [",
  "          if (_isSyncing)",
  "            const Padding(",
  "              padding: EdgeInsets.all(12),",
  "              child: SizedBox(",
  "                width: 20,",
  "                height: 20,",
  "                child: CircularProgressIndicator(",
  "                  strokeWidth: 1.5,",
  "                  color: Colors.white54,",
  "                ),",
  "              ),",
  "            ),",
  "          IconButton(",
  "            icon: const Icon(Icons.add, color: Colors.white70),",
  "            onPressed: _navigateToCustomFilmEditor,",
  "          ),",
  "        ],",
  "      ),",
  "      body: _isLoading",
  "          ? const Center(child: CircularProgressIndicator())",
  "          : RefreshIndicator(",
  "              onRefresh: _onRefresh,",
  "              child: _buildFilmList(),",
  "            ),",
  "    );",
  "  }",
  "",
  "  Widget _buildFilmList() {",
  "    if (_errorMessage != null) {",
  "      return Center(",
  "        child: Text(",
  "          _errorMessage!,",
  "          style: const TextStyle(color: Colors.red),",
  "        ),",
  "      );",
  "    }",
  "    return FadeTransition(",
  "      opacity: _fadeController,",
  "      child: ListView.separated(",
  "        padding: const EdgeInsets.symmetric(vertical: 16),",
  "        itemCount: _selectedFilms.length,",
  "        separatorBuilder: (_, __) => const Divider(",
  "          color: Colors.white12,",
  "          height: 1,",
  "        ),",
  "        itemBuilder: (context, index) {",
  "          final film = _selectedFilms[index];",
  "          return film == null",
  "              ? _buildEmptySlot(index)",
  "              : _buildFilmTile(film, index);",
  "        },",
  "      ),",
  "    );",
  "  }",
  "",
  "  Widget _buildEmptySlot(int index) {",
  "    return ListTile(",
  "      onTap: () => setState(() => _selectingSlotIndex = index),",
  "      leading: const Icon(Icons.add_circle_outline, color: Colors.white24),",
  "      title: Text(",
  "        'Slot ${index + 1} — tap to assign',",
  "        style: const TextStyle(color: Colors.white24),",
  "      ),",
  "    );",
  "  }",
  "",
  "  Widget _buildFilmTile(Film film, int index) {",
  "    final isFavorite = _filmManager.isFavorite(film.id);",
  "    return ListTile(",
  "      onTap: () => _navigateToFilmDetail(film),",
  "      onLongPress: () => _showSlotOptions(film, index),",
  "      leading: CircleAvatar(",
  "        backgroundColor: Colors.white12,",
  "        backgroundImage: film.thumbnailUrl != null",
  "            ? NetworkImage(film.thumbnailUrl!)",
  "            : null,",
  "        child: film.thumbnailUrl == null",
  "            ? const Icon(Icons.movie_outlined, color: Colors.white38)",
  "            : null,",
  "      ),",
  "      title: Text(film.title, style: const TextStyle(color: Colors.white)),",
  "      subtitle: Text(",
  "        film.director ?? '',",
  "        style: const TextStyle(color: Colors.white54, fontSize: 12),",
  "      ),",
  "      trailing: IconButton(",
  "        icon: Icon(",
  "          isFavorite ? Icons.favorite : Icons.favorite_border,",
  "          color: isFavorite ? Colors.redAccent : Colors.white38,",
  "          size: 20,",
  "        ),",
  "        onPressed: () => _toggleFavorite(film),",
  "      ),",
  "    );",
  "  }",
  "",
  "  void _showSlotOptions(Film film, int slotIndex) {",
  "    showModalBottomSheet(",
  "      context: context,",
  "      backgroundColor: Colors.grey[900],",
  "      shape: const RoundedRectangleBorder(",
  "        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),",
  "      ),",
  "      builder: (context) => SafeArea(",
  "        child: Column(",
  "          mainAxisSize: MainAxisSize.min,",
  "          children: [",
  "            ListTile(",
  "              leading: const Icon(Icons.swap_horiz, color: Colors.white70),",
  "              title: const Text(",
  "                'Replace film',",
  "                style: TextStyle(color: Colors.white),",
  "              ),",
  "              onTap: () {",
  "                Navigator.pop(context);",
  "                setState(() => _selectingSlotIndex = slotIndex);",
  "              },",
  "            ),",
  "            ListTile(",
  "              leading: const Icon(Icons.clear, color: Colors.redAccent),",
  "              title: const Text(",
  "                'Remove from slot',",
  "                style: TextStyle(color: Colors.redAccent),",
  "              ),",
  "              onTap: () {",
  "                Navigator.pop(context);",
  "                _clearFilmSlot(slotIndex);",
  "              },",
  "            ),",
  "          ],",
  "        ),",
  "      ),",
  "    );",
  "  }",
  "}",
];

// 5 color styles for keyword highlighting
const COLOR_STYLES = [
  { name: 'kw-orange', color: '#FFA500', keywords: ['import', 'class', 'final', 'const', 'async', 'await', 'super', '@override'] },
  { name: 'kw-purple', color: '#DA70D6', keywords: ['void', 'Future', 'List', 'String', 'bool', 'int', 'setState', 'Widget'] },
  { name: 'kw-cyan',   color: '#00D9FF', keywords: ['new', 'this', 'if', 'return', 'for', 'while', 'try', 'catch', 'finally'] },
  { name: 'kw-red',    color: '#FF6B6B', keywords: ['null', 'throw', 'Error', 'late'] },
  { name: 'kw-lime',   color: '#39FF14', keywords: ['true', 'false', 'mounted'] },
];

export class TypingScene {
  constructor(sceneManager = null) {
    this.sceneManager = sceneManager;

    // DOM refs
    this.backgroundLayer = null;
    this.promptElement   = null;   // Phase 1: void main() {} shell
    this.typingLine      = null;   // Line 3 inside the prompt
    this.fullscreenCode  = null;   // Phase 2: full-screen container

    // Phase 1 state
    this.isUserControlling = true;
    this.typedText = '';

    // Phase 2 state
    this.autoGenStarted  = false;
    this.autoGenTimer    = null;
    this.lineIndex       = 0;      // which DART_CODE_LINE we're at (sequential, loops)
    this.lineCount       = 0;      // how many line-divs have been created
    this.charQueue       = [];     // [{char, colorClass}] pending chars for current line
    this.currentLineDiv  = null;   // the <div> currently being filled
    this.totalCharsTyped = 0;      // total chars appended to fullscreenCode
    this.sceneComplete   = false;

    // Timing config (character-level intervals in ms)
    this.CHAR_INTERVAL_INITIAL = 60;    // slow, clearly visible typing
    this.CHAR_INTERVAL_MIN     = 4;     // near-instant at max speed
    this.MAX_CHARS             = 3000;  // scene ends after this many chars

    this.audioManager    = null;
    this.keyboardHandler = null;
  }

  // ─────────────────────────────────────────────
  //  Init / teardown
  // ─────────────────────────────────────────────

  async init() {
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;overflow:hidden;background:#000;';

    this.addGlobalStyles();
    this.buildBackground();
    this.buildPrompt();

    this.keyboardHandler = (e) => this.handleKeyboard(e);
    document.addEventListener('keydown', this.keyboardHandler);

    this.audioManager = new AudioManager();
    await this.audioManager.init('typing');
  }

  cleanup() {
    clearTimeout(this.autoGenTimer);
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    if (this.audioManager) {
      this.audioManager.cleanup();
      this.audioManager = null;
    }
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;background:#000;';
  }

  // ─────────────────────────────────────────────
  //  Phase 1: prompt + user typing
  // ─────────────────────────────────────────────

  buildBackground() {
    this.backgroundLayer = document.createElement('div');
    this.backgroundLayer.style.cssText = `
      position:fixed; top:0; left:0;
      width:100%; height:100%;
      font-family:monospace; font-size:12px;
      color:rgba(100,100,100,0.08);
      white-space:pre-wrap; overflow:hidden;
      z-index:1; line-height:1.5;
      padding:20px; box-sizing:border-box;
      pointer-events:none;
    `;
    this.backgroundLayer.textContent = (". , / ; ' ~ ` ").repeat(500);
    document.body.appendChild(this.backgroundLayer);
  }

  buildPrompt() {
    this.promptElement = document.createElement('div');
    this.promptElement.style.cssText = `
      position:fixed; top:50%; left:50%;
      transform:translate(-50%,-50%);
      z-index:20;
      font-family:'Courier New',monospace;
      font-size:16px;
      color:#00ff00;
      line-height:1.8;
      padding:24px 28px;
      background:rgba(0,0,0,0.88);
      border:1px solid rgba(0,255,0,0.25);
      border-radius:4px;
      min-width:460px;
      white-space:pre;
    `;

    const line1 = this.makeStaticLine('void main() {');
    const line2 = this.makeStaticLine('  // TODO: Define your EXISTENCE here');
    this.typingLine = document.createElement('div');
    this.renderTypingLine();
    const line4 = this.makeStaticLine('}');

    this.promptElement.appendChild(line1);
    this.promptElement.appendChild(line2);
    this.promptElement.appendChild(this.typingLine);
    this.promptElement.appendChild(line4);
    document.body.appendChild(this.promptElement);

    const chars = this.promptElement.querySelectorAll('.prompt-char');
    gsap.to(chars, { opacity: 1, duration: 0.06, stagger: 0.025, ease: 'back.out(1.7)' });
  }

  makeStaticLine(text) {
    const div = document.createElement('div');
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'prompt-char';
      span.textContent = char;
      span.style.cssText = 'opacity:0; display:inline-block;';
      div.appendChild(span);
    });
    return div;
  }

  renderTypingLine() {
    this.typingLine.innerHTML = '';

    const indent = document.createElement('span');
    indent.textContent = '  ';
    this.typingLine.appendChild(indent);

    this.typedText.split('').forEach((char, idx) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.color = COLOR_STYLES[idx % COLOR_STYLES.length].color;
      span.dataset.charIdx = idx;
      this.typingLine.appendChild(span);
    });

    const cursor = document.createElement('span');
    cursor.className = 'prompt-cursor';
    cursor.textContent = '|';
    this.typingLine.appendChild(cursor);
  }

  handleKeyboard(event) {
    if (!this.isUserControlling) return;
    const key = event.key;
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.typedText += key;
      this.renderTypingLine();

      // Pop-in on the newest character
      const spans = this.typingLine.querySelectorAll('span[data-char-idx]');
      const newest = spans[spans.length - 1];
      if (newest) {
        gsap.fromTo(newest,
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.1, ease: 'back.out(2)' }
        );
      }

      if (this.typedText.length >= 50 && !this.autoGenStarted) {
        this.startAutoGeneration();
      }
    }
  }

  // ─────────────────────────────────────────────
  //  Phase 2: full-screen character-by-character
  // ─────────────────────────────────────────────

  startAutoGeneration() {
    if (this.autoGenStarted) return;
    this.autoGenStarted    = true;
    this.isUserControlling = false;

    // Build full-screen container (hidden initially)
    this.fullscreenCode = document.createElement('div');
    this.fullscreenCode.style.cssText = `
      position:fixed; top:0; left:0;
      width:100%; height:100%;
      overflow-y:auto; overflow-x:hidden;
      z-index:15;
      font-family:'Courier New',monospace;
      font-size:13px;
      line-height:1.65;
      padding:40px 48px;
      box-sizing:border-box;
      background:rgba(0,0,0,0.97);
      opacity:0;
    `;
    document.body.appendChild(this.fullscreenCode);

    // Seed: render the prompt context lines as already-typed (no animation)
    const seedLines = [
      'void main() {',
      '  // TODO: Define your EXISTENCE here',
      `  ${this.typedText}`,
    ];
    seedLines.forEach((text, idx) => {
      const div = document.createElement('div');
      div.className = `code-line line-color-${idx % COLOR_STYLES.length}`;
      div.innerHTML = this.renderSeedLine(text, idx);
      this.fullscreenCode.appendChild(div);
      this.lineCount++;
    });

    // Crossfade: prompt out, fullscreen in
    gsap.to(this.promptElement, { opacity: 0, duration: 0.5, ease: 'power2.in' });
    gsap.to(this.fullscreenCode, {
      opacity: 1,
      duration: 0.5,
      delay: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        // Begin character-by-character typing after fade completes
        this.startNextLine();
        this.scheduleNextChar(this.CHAR_INTERVAL_INITIAL);
      },
    });
  }

  // Renders a seed line as static colored HTML (no per-char spans needed)
  renderSeedLine(text, lineIndex) {
    const styleIndex = lineIndex % COLOR_STYLES.length;
    const style = COLOR_STYLES[styleIndex];
    const escaped = this.escapeHtml(text);
    const kwRegex = new RegExp(
      `\\b(${style.keywords.map(k => this.escapeRegex(k)).join('|')})\\b`, 'g'
    );
    let out = '';
    let last = 0;
    let m;
    while ((m = kwRegex.exec(escaped)) !== null) {
      if (m.index > last) out += escaped.slice(last, m.index);
      out += `<span class="${style.name}">${m[0]}</span>`;
      last = m.index + m[0].length;
    }
    if (last < escaped.length) out += escaped.slice(last);
    return out;
  }

  // Creates a new line div and fills charQueue from the next DART_CODE_LINE
  startNextLine() {
    const text = DART_CODE_LINES[this.lineIndex % DART_CODE_LINES.length];
    this.lineIndex++;

    this.currentLineDiv = document.createElement('div');
    this.currentLineDiv.className = `code-line line-color-${this.lineCount % COLOR_STYLES.length}`;
    this.fullscreenCode.appendChild(this.currentLineDiv);
    this.lineCount++;

    if (text === '') {
      // Blank line: visual spacing, leave charQueue empty so next tick advances
      this.currentLineDiv.innerHTML = '&nbsp;';
      this.charQueue = [];
    } else {
      this.charQueue = this.tokenizeLine(text, this.lineCount - 1);
    }
  }

  // Converts a Dart line into an array of {char, colorClass} for per-char rendering
  tokenizeLine(line, lineIndex) {
    const styleIndex = lineIndex % COLOR_STYLES.length;
    const style = COLOR_STYLES[styleIndex];
    const escaped = this.escapeHtml(line);

    const kwRegex = new RegExp(
      `\\b(${style.keywords.map(k => this.escapeRegex(k)).join('|')})\\b`, 'g'
    );
    const tokens = [];
    let last = 0;
    let m;
    while ((m = kwRegex.exec(escaped)) !== null) {
      if (m.index > last) tokens.push({ text: escaped.slice(last, m.index), kw: false });
      tokens.push({ text: m[0], kw: true });
      last = m.index + m[0].length;
    }
    if (last < escaped.length) tokens.push({ text: escaped.slice(last), kw: false });

    const chars = [];
    for (const token of tokens) {
      for (const char of token.text.split('')) {
        chars.push({ char, colorClass: token.kw ? style.name : null });
      }
    }
    return chars;
  }

  // Core scheduler: types one character per tick, exponentially accelerating
  scheduleNextChar(interval) {
    if (this.sceneComplete) return;
    this.autoGenTimer = setTimeout(() => {
      if (this.sceneComplete) return;

      // Advance to next line if current one is exhausted
      if (this.charQueue.length === 0) {
        this.startNextLine();
        // Blank line — no char to render this tick, just reschedule
        if (this.charQueue.length === 0) {
          const progress = this.totalCharsTyped / this.MAX_CHARS;
          const next = this.CHAR_INTERVAL_INITIAL -
            (this.CHAR_INTERVAL_INITIAL - this.CHAR_INTERVAL_MIN) *
            Math.min(progress * 1.5, 1);
          this.scheduleNextChar(next);
          return;
        }
      }

      // Append the next character
      const { char, colorClass } = this.charQueue.shift();
      const span = document.createElement('span');
      span.className = 'code-char' + (colorClass ? ' ' + colorClass : '');
      span.textContent = char;
      this.currentLineDiv.appendChild(span);

      // Same pop-in as Phase 1 user typing
      gsap.fromTo(span,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.07, ease: 'back.out(2)' }
      );

      this.totalCharsTyped++;
      this.fullscreenCode.scrollTop = this.fullscreenCode.scrollHeight;

      if (this.totalCharsTyped >= this.MAX_CHARS) {
        this.completeScene();
        return;
      }

      // Exponential acceleration toward CHAR_INTERVAL_MIN
      const progress = this.totalCharsTyped / this.MAX_CHARS;
      const next = this.CHAR_INTERVAL_INITIAL -
        (this.CHAR_INTERVAL_INITIAL - this.CHAR_INTERVAL_MIN) *
        Math.min(progress * 1.5, 1);
      this.scheduleNextChar(next);
    }, interval);
  }

  // ─────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  addGlobalStyles() {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      .prompt-cursor { animation: blink 1s infinite; }
      .code-line { margin:0; line-height:1.65; min-height:1.65em; }
      .code-char { display:inline-block; }
      ${COLOR_STYLES.map((st, idx) => `
        .${st.name} { color:${st.color}; }
        .line-color-${idx} { color:rgba(0,255,0,0.8); }
      `).join('')}
    `;
    document.head.appendChild(s);
  }

  completeScene() {
    if (this.sceneComplete) return;
    this.sceneComplete = true;
    clearTimeout(this.autoGenTimer);
    if (this.sceneManager) {
      setTimeout(() => this.sceneManager.transitionTo('video').catch(console.error), 1000);
    }
  }
}
