// Typing Scene — light mode
// Phase 1: each keypress appends the next Dart word to the prompt
// Phase 2: 5 columns fill the screen, typing code automatically

import gsap from 'gsap';
import { AudioManager } from '../utils/AudioManager.js';

// Dart source — full file with indentation intact
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
  "      theme: ThemeData.light().copyWith(",
  "        scaffoldBackgroundColor: Colors.white,",
  "        primaryColor: Colors.black,",
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
  "      backgroundColor: Colors.white,",
  "      appBar: AppBar(",
  "        backgroundColor: Colors.white,",
  "        elevation: 0,",
  "        title: const Text(",
  "          'Films',",
  "          style: TextStyle(",
  "            color: Colors.black,",
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
  "                  color: Colors.black38,",
  "                ),",
  "              ),",
  "            ),",
  "          IconButton(",
  "            icon: const Icon(Icons.add, color: Colors.black54),",
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
  "          color: Colors.black12,",
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
  "      leading: const Icon(Icons.add_circle_outline, color: Colors.black26),",
  "      title: Text(",
  "        'Slot ${index + 1} — tap to assign',",
  "        style: const TextStyle(color: Colors.black38),",
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
  "        backgroundColor: Colors.black12,",
  "        backgroundImage: film.thumbnailUrl != null",
  "            ? NetworkImage(film.thumbnailUrl!)",
  "            : null,",
  "        child: film.thumbnailUrl == null",
  "            ? const Icon(Icons.movie_outlined, color: Colors.black38)",
  "            : null,",
  "      ),",
  "      title: Text(film.title, style: const TextStyle(color: Colors.black87)),",
  "      subtitle: Text(",
  "        film.director ?? '',",
  "        style: const TextStyle(color: Colors.black54, fontSize: 12),",
  "      ),",
  "      trailing: IconButton(",
  "        icon: Icon(",
  "          isFavorite ? Icons.favorite : Icons.favorite_border,",
  "          color: isFavorite ? Colors.redAccent : Colors.black38,",
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
  "      backgroundColor: Colors.white,",
  "      shape: const RoundedRectangleBorder(",
  "        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),",
  "      ),",
  "      builder: (context) => SafeArea(",
  "        child: Column(",
  "          mainAxisSize: MainAxisSize.min,",
  "          children: [",
  "            ListTile(",
  "              leading: const Icon(Icons.swap_horiz, color: Colors.black54),",
  "              title: const Text('Replace film'),",
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

// Flat list of every word in the source — one word gets appended per keypress
const WORD_POOL = DART_CODE_LINES
  .flatMap(line => line.split(/(\s+)/).filter(s => s.trim().length > 0));

// Keyword color categories — 4 groups, each covering a set of Dart keywords
const COLOR_STYLES = [
  { name: 'kw-gray', color: '#c75000', keywords: ['import', 'class', 'final', 'const', 'async', 'await', 'super', '@override'] },
  { name: 'kw-yellow', color: '#8800cc', keywords: ['void', 'Future', 'List', 'String', 'bool', 'int', 'setState', 'Widget'] },
  { name: 'kw-blue',   color: '#005fa3', keywords: ['new', 'this', 'if', 'return', 'for', 'while', 'try', 'catch', 'finally'] },
  { name: 'kw-red',    color: '#bb0000', keywords: ['null', 'throw', 'Error', 'late'] },
];

// Number of simultaneous typing columns in Phase 2
const NUM_COLUMNS = 5;

export class TypingScene {
  constructor(sceneManager = null) {
    this.sceneManager = sceneManager;

    // DOM
    this.backgroundLayer = null;
    this.typingLine      = null;
    this.fullscreenCode  = null;
    this.middleCol       = null;   // colStates[MIDDLE_COL] — set in buildGrid()

    // Phase 1 state
    this.isUserControlling = true;
    this.wordIdx           = 0;   // index into WORD_POOL
    this.wordCount         = 0;   // how many words have been added
    this.WORD_THRESHOLD    = 60;  // keypresses before Phase 2

    // Phase 2 state
    this.autoGenStarted  = false;
    this.colStates       = [];    // per-column: {el, lineIdx, lineCount, wordQueue, currentLineDiv, timer}
    this.totalWordsTyped = 0;
    this.sceneComplete   = false;

    // Phase 2 timing (ms per word) — TWEAKABLE
    this.WORD_INTERVAL_INITIAL = 500;  // starting speed: one word every 500 ms
    this.WORD_INTERVAL_MIN     = 25;   // ending speed: one word every 25 ms
    this.MAX_WORDS             = 4000;  // total words across all columns before scene ends

    // Roaming flicker — two independent tickers: random words + special chars
    this.wordSpans          = [];   // rolling window of all rendered spans (Phase 1 + Phase 2)
    this.specialCharSpans   = [];   // rolling window of spans containing special punctuation
    this.flickerRoamTimer   = null; // random-word flicker ticker
    this.flickerCharTimer   = null; // special-char flicker ticker
    this._flickerActive     = [];   // [{span, origClass}] currently lit by random-word ticker
    this._flickerCharActive = [];   // [{span, origClass}] currently lit by special-char ticker

    // Random word flicker — TWEAKABLE
    this.FLICKER_PICKS_MIN = 0;    // minimum word spans lit per tick
    this.FLICKER_PICKS_MAX = 10;   // maximum word spans lit per tick

    // Special character flicker — TWEAKABLE
    // Spans whose text contains any of these chars are tracked in specialCharSpans
    // and flicker exclusively through tickSpecialCharFlicker().
    this.SPECIAL_CHAR_PICKS_MIN = 1;   // minimum special-char spans lit per tick
    this.SPECIAL_CHAR_PICKS_MAX = 8;   // maximum special-char spans lit per tick
    this.SPECIAL_CHAR_REGEX = /[(){}[\];,'"@]|\/\/\/|\./;  // matches: (){}[];,'".///@ 

    // New-word highlight — TWEAKABLE
    // Duration (ms) a freshly typed span keeps the .word-fresh class before it's removed
    this.NEW_WORD_DURATION = 400;

    this.audioManager    = null;
    this.keyboardHandler = null;
  }

  // Init / cleanup

  async init() {
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;overflow:hidden;background:#f8f8f8;';

    this.addGlobalStyles();
    this.buildBackground();
    this.buildGrid();    // creates fullscreenCode + all 5 cols (non-middle hidden)
    this.buildPrompt();  // injects Phase 1 content into the middle column

    this.keyboardHandler = (e) => this.handleKeyboard(e);
    document.addEventListener('keydown', this.keyboardHandler);

    this.audioManager = new AudioManager();
    await this.audioManager.init('typing');
  }

  cleanup() {
    clearTimeout(this.autoGenTimer);
    this.colStates.forEach(col => clearTimeout(col.timer));
    // Stop both flicker tickers
    clearTimeout(this.flickerRoamTimer);
    clearTimeout(this.flickerCharTimer);
    this.flickerRoamTimer = null;
    this.flickerCharTimer = null;
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    if (this.audioManager) {
      this.audioManager.cleanup();
      this.audioManager = null;
    }
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;background:#f8f8f8;';
  }

  // Phase 1 — prompt

  buildBackground() {
    this.backgroundLayer = document.createElement('div');
    this.backgroundLayer.className = 'background-layer';
    this.backgroundLayer.textContent = (". , / ; ' ~ ` ").repeat(600);
    document.body.appendChild(this.backgroundLayer);
  }

  // Build the full-screen grid upfront; Phase 1 uses just the middle column
  buildGrid() {
    const MIDDLE_COL = Math.floor(NUM_COLUMNS / 2); // = 2 for 5 columns
    const offsetStep = Math.floor(DART_CODE_LINES.length / NUM_COLUMNS);

    this.fullscreenCode = document.createElement('div');
    this.fullscreenCode.className = 'fullscreen-code';
    document.body.appendChild(this.fullscreenCode);

    for (let i = 0; i < NUM_COLUMNS; i++) {
      const el = document.createElement('div');
      el.className = 'code-column';
      if (i < NUM_COLUMNS - 1) {
        el.style.borderRight = '1px solid rgba(0,0,0,0.06)';
      }
      // All columns except the middle start hidden (Phase 1 only shows middle)
      if (i !== MIDDLE_COL) {
        el.classList.add('code-column--offstage');
      }
      this.fullscreenCode.appendChild(el);

      const col = {
        el,
        lineIdx:        i * offsetStep,
        lineCount:      0,
        wordQueue:      [],
        currentLineDiv: null,
        timer:          null,
        scrollCount:    0,
      };
      this.colStates.push(col);
    }

    this.middleCol = this.colStates[MIDDLE_COL];
  }

  buildPrompt() {
    // Phase 1 content types directly into the middle column
    const col = this.middleCol;

    const line1 = this.makeStaticLine('void main() {');
    const line2 = this.makeStaticLineWithHighlight('  // TODO: Define your EXISTENCE here', 'EXISTENCE', 'existence-highlight');

    this.typingLine = document.createElement('div');
    this.typingLine.className = 'typing-line';
    this.renderTypingLine();

    const line4 = this.makeStaticLine('}');

    col.el.appendChild(line1);
    col.el.appendChild(line2);
    col.el.appendChild(this.typingLine);
    col.el.appendChild(line4);

    const chars = col.el.querySelectorAll('.prompt-char');
    gsap.to(chars, { opacity: 1, duration: 0.05, stagger: 0.02, ease: 'back.out(1.7)' });
  }

  makeStaticLine(text) {
    const div = document.createElement('div');
    text.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'typing-text prompt-char';
      span.textContent = ch;
      div.appendChild(span);
    });
    return div;
  }

  // Build a static line with a specific word highlighted with a CSS class
  makeStaticLineWithHighlight(text, highlightWord, highlightClass) {
    const div = document.createElement('div');
    const regex = new RegExp(`(${this.escapeRegex(highlightWord)})`, 'g');
    const parts = text.split(regex);

    parts.forEach(part => {
      if (part === highlightWord) {
        const wordSpan = document.createElement('span');
        wordSpan.className = highlightClass;
        wordSpan.style.cssText = 'display:inline-block; padding: 2px 4px;';
        part.split('').forEach(ch => {
          const charSpan = document.createElement('span');
          charSpan.className = 'typing-text prompt-char';
          charSpan.textContent = ch;
          charSpan.style.opacity = '1';
          wordSpan.appendChild(charSpan);
        });
        div.appendChild(wordSpan);
      } else {
        part.split('').forEach(ch => {
          const span = document.createElement('span');
          span.className = 'typing-text prompt-char';
          span.textContent = ch;
          div.appendChild(span);
        });
      }
    });
    return div;
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Rebuild the typing line from accumulated word spans
  renderTypingLine() {
    this.typingLine.innerHTML = '';

    // 2-space indent prefix
    const indent = document.createElement('span');
    indent.textContent = '  ';
    this.typingLine.appendChild(indent);

    // Show cursor before any typing has started
    if (this.wordCount === 0) {
      const cursor = document.createElement('span');
      cursor.className = 'prompt-cursor';
      cursor.textContent = '|';
      this.typingLine.appendChild(cursor);
    }
  }

  // Append a single word span with pop-in animation
  appendWord(word) {
    // Remove the cursor before appending the word
    const oldCursor = this.typingLine.querySelector('.prompt-cursor');
    if (oldCursor) oldCursor.remove();

    const span = document.createElement('span');
    span.textContent = word + ' ';
    span.style.display = 'inline-block';
    span.className = 'typing-text';
    span.classList.add('word-fresh');
    setTimeout(() => span.classList.remove('word-fresh'), this.NEW_WORD_DURATION);

    this.wordSpans.push(span);
    // Track spans with special punctuation in their own pool
    if (this.SPECIAL_CHAR_REGEX.test(word)) {
      this.specialCharSpans.push(span);
      if (this.specialCharSpans.length === 1 && !this.flickerCharTimer) {
        this.tickSpecialCharFlicker();
      }
    }
    // Start the roaming flicker once we have a few spans to jump between
    if (this.wordSpans.length === 3 && !this.flickerRoamTimer) {
      this.tickRoamingFlicker();
    }

    this.typingLine.appendChild(span);

    gsap.fromTo(span,
      { opacity: 0, scale: 1, y: 4 },
      { opacity: 1, scale: 1, y: 0, duration: 0.05, ease: 'back.out(2.5)' }
    );

    // Sound
    if (this.audioManager) {
      // Pitch and intensity both evolve as Phase 1 progresses
      const p1 = Math.min(this.wordCount / this.WORD_THRESHOLD, 1);
      const variation  = Math.floor(p1 * 4);
      const intensity  = p1 * 0.6; // 0 → 0.6 over Phase 1
      this.audioManager.triggerKeyClick(variation, intensity);
      // Phase 1 covers 0–15% of the overall ambient progress range
      this.audioManager.updateTypingProgress(p1 * 0.15);
    }

    // Re-add the cursor after the new word
    const cursor = document.createElement('span');
    cursor.className = 'prompt-cursor';
    cursor.textContent = '|';
    this.typingLine.appendChild(cursor);
  }

  handleKeyboard(event) {
    if (!this.isUserControlling) return;
    // Ignore modifier-only keypresses
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (['Shift','Control','Alt','Meta','CapsLock','Tab','Escape'].includes(event.key)) return;

    event.preventDefault();

    // This keydown is a user gesture — use it to unlock the audio context
    if (this.audioManager) this.audioManager.fireContextStart();

    // Words per keypress scales up as the scene progresses
    const progress = Math.min(this.wordCount / this.WORD_THRESHOLD, 1);
    // 1 word at the start, up to 6 by the end
    const base  = 1 + Math.floor(progress * 5);
    // Random bonus that grows with progress — late keypresses feel explosive
    const bonus = Math.floor(Math.random() * (1 + Math.floor(progress * 6)));
    const wordsToAdd = base + bonus;

    for (let i = 0; i < wordsToAdd; i++) {
      const word = WORD_POOL[this.wordIdx % WORD_POOL.length];
      this.wordIdx++;
      this.wordCount++;
      this.appendWord(word);
    }

    if (this.wordCount >= this.WORD_THRESHOLD && !this.autoGenStarted) {
      this.startAutoGeneration();
    }
  }

  // Phase 2 — full-screen multi-column typing

  startAutoGeneration() {
    if (this.autoGenStarted) return;
    this.autoGenStarted    = true;
    this.isUserControlling = false;

    // Phase 1 spans stay in the middle column and remain flickerable.
    // Clear the highlight arrays so the first Phase 2 tick starts clean.
    this._flickerActive     = [];
    this._flickerCharActive = [];

    // Remove the typing cursor from Phase 1's typing line
    const oldCursor = this.typingLine.querySelector('.prompt-cursor');
    if (oldCursor) oldCursor.remove();

    // Reveal the other columns — the grid was already rendered, just hidden
    this.colStates.forEach(col => col.el.classList.remove('code-column--offstage'));

    // Fire a melodic rise to mark the start of Phase 2
    if (this.audioManager) {
      this.audioManager.triggerTypingAccent(0);
    }

    // Stagger each column's start so they don't all kick off simultaneously.
    // The middle column picks up right after the Phase 1 content already there.
    this.colStates.forEach((col, i) => {
      setTimeout(() => {
        this.colStartNextLine(col);
        this.colScheduleNextWord(col, 0);
      }, i * 120);
    });
  }

  // Advance a column to its next line
  colStartNextLine(col) {
    const text = DART_CODE_LINES[col.lineIdx % DART_CODE_LINES.length];
    col.lineIdx++;

    const div = document.createElement('div');
    div.className = `typing-text code-line lc-${col.lineCount % COLOR_STYLES.length}`;
    col.el.appendChild(div);
    col.lineCount++;
    col.currentLineDiv = div;

    if (text === '') {
      // Blank line — spacer, no words to type
      div.innerHTML = '\u00a0';
      col.wordQueue = [];
    } else {
      col.wordQueue = this.tokenizeLineToWords(text, col.lineCount - 1);
    }
  }

  // Per-column word scheduler — processes BATCH_SIZE words per tick to reduce
  // setTimeout overhead and consolidate GSAP calls.
  colScheduleNextWord(col, interval) {
    if (this.sceneComplete) return;
    col.timer = setTimeout(() => {
      if (this.sceneComplete) return;

      const BATCH_SIZE = 3;
      const spans = [];

      for (let b = 0; b < BATCH_SIZE; b++) {
        if (this.totalWordsTyped >= this.MAX_WORDS) break;

        // Current line is done, move to the next one
        if (col.wordQueue.length === 0) {
          this.colStartNextLine(col);
          if (col.wordQueue.length === 0) continue; // blank line — skip slot
        }
        if (col.wordQueue.length === 0) continue;

        const { text, colorClass } = col.wordQueue.shift();
        const span = document.createElement('span');
        span.textContent = text;
        span.style.display = 'inline-block';
        span.className = 'typing-text';
        if (colorClass) span.classList.add(colorClass);
        span.classList.add('word-fresh');
        setTimeout(() => span.classList.remove('word-fresh'), this.NEW_WORD_DURATION);

        col.currentLineDiv.appendChild(span);
        spans.push(span);
        this.totalWordsTyped++;
      }

      if (spans.length > 0) {
        // Add to the rolling window pools
        spans.forEach(s => {
          this.wordSpans.push(s);
          if (this.wordSpans.length > 300) this.wordSpans.shift();
          // Also track spans containing special chars in their own pool
          if (this.SPECIAL_CHAR_REGEX.test(s.textContent)) {
            this.specialCharSpans.push(s);
            if (this.specialCharSpans.length > 150) this.specialCharSpans.shift();
          }
        });
        // Start the roaming flicker once there are a few spans to work with
        if (!this.flickerRoamTimer && this.wordSpans.length >= 5) {
          this.tickRoamingFlicker();
        }
        // Start the special-char flicker once we have at least one punctuation span
        if (!this.flickerCharTimer && this.specialCharSpans.length >= 1) {
          this.tickSpecialCharFlicker();
        }

        // Animate the whole batch at once — cheaper than individual tweens
        gsap.fromTo(spans,
          { opacity: 0, y: 2 },
          { opacity: 1, y: 0, duration: 0.05, ease: 'back.out(2)', stagger: 0.025 }
        );

        // Sound
        if (this.audioManager) {
          // Both pitch and intensity evolve across Phase 2
          const p2     = Math.min(this.totalWordsTyped / this.MAX_WORDS, 1);
          const variation  = Math.floor(p2 * 4);
          const intensity  = 0.6 + p2 * 0.4; // 0.6 → 1.0 across Phase 2
          this.audioManager.triggerKeyClick(variation, intensity);
          // Phase 2 takes ambient from 15% to 100%
          this.audioManager.updateTypingProgress(0.15 + p2 * 0.85);
          // Every 500 words, cycle a melodic accent (rise/resolve/float)
          if (this.totalWordsTyped > 0 && this.totalWordsTyped % 500 < 3) {
            const accentType = Math.floor(this.totalWordsTyped / 500) % 3;
            this.audioManager.triggerTypingAccent(accentType);
          }
        }

        // Only scroll every few batches to keep things smooth
        col.scrollCount++;
        if (col.scrollCount % 5 === 0) {
          col.el.scrollTop = col.el.scrollHeight;
        }
      }

      if (this.totalWordsTyped >= this.MAX_WORDS) {
        this.completeScene();
        return;
      }

      this.colScheduleNextWord(col, this.calcInterval(this.totalWordsTyped));
    }, interval);
  }

  // Ramps quickly from the initial word interval down to the minimum
  calcInterval(wordsTyped) {
    const p = Math.min((wordsTyped / this.MAX_WORDS) * 1.5, 1);
    return this.WORD_INTERVAL_INITIAL - (this.WORD_INTERVAL_INITIAL - this.WORD_INTERVAL_MIN) * p;
  }

  // Shared helpers

  // Break a Dart line into word tokens, each carrying an optional color class.
  // The leading indent goes on the first token; subsequent tokens get a space prefix.
  tokenizeLineToWords(line, lineIndex) {
    const style = COLOR_STYLES[lineIndex % COLOR_STYLES.length];
    if (!line.trim()) return [];

    const leadMatch = line.match(/^(\s*)([\s\S]+)$/);
    const indent  = leadMatch ? leadMatch[1] : '';
    const content = leadMatch ? leadMatch[2] : line;

    // Split by whitespace, keep non-empty segments
    const segments = content.split(/\s+/).filter(s => s.length > 0);

    return segments.map((seg, i) => {
      const prefix    = i === 0 ? indent : ' ';
      const colorClass = style.keywords.includes(seg) ? style.name : null;
      return { text: prefix + seg, colorClass };
    });
  }

  // Picks random spans from the pool, applies a color class, then swaps to a new
  // set on the next tick. Rate accelerates from 200ms down to 15ms with progress.
  tickRoamingFlicker() {
    if (this.sceneComplete) return;
    if (this.wordSpans.length === 0) {
      this.flickerRoamTimer = setTimeout(() => this.tickRoamingFlicker(), 100);
      return;
    }

    const progress = this.autoGenStarted
      ? Math.min(this.totalWordsTyped / this.MAX_WORDS, 1)
      : Math.min(this.wordCount / this.WORD_THRESHOLD, 1);

    const FLICKER_RATE_INITIAL = 200;   // ms — slow at start
    const FLICKER_RATE_MIN     = 15;    // ms — fast at end
    const interval = FLICKER_RATE_INITIAL - (FLICKER_RATE_INITIAL - FLICKER_RATE_MIN) * progress;

    const styleNames = COLOR_STYLES.map(s => s.name);

    // Restore previously highlighted spans
    this._flickerActive.forEach(({ span, origClass }) => { span.className = origClass; });
    this._flickerActive = [];

    // Pick a random number of spans to highlight
    const numPicks = this.FLICKER_PICKS_MIN + Math.floor(Math.random() * (this.FLICKER_PICKS_MAX - this.FLICKER_PICKS_MIN + 1));
    for (let i = 0; i < numPicks; i++) {
      const span = this.wordSpans[Math.floor(Math.random() * this.wordSpans.length)];
      const origClass = span.className;
      span.className = styleNames[Math.floor(Math.random() * styleNames.length)];
      this._flickerActive.push({ span, origClass });
    }

    this.flickerRoamTimer = setTimeout(() => this.tickRoamingFlicker(), interval);
  }

  // Same idea as tickRoamingFlicker, but scoped to punctuation spans only
  // (anything matching the SPECIAL_CHAR_REGEX).
  tickSpecialCharFlicker() {
    if (this.sceneComplete) return;
    if (this.specialCharSpans.length === 0) {
      this.flickerCharTimer = setTimeout(() => this.tickSpecialCharFlicker(), 100);
      return;
    }

    const progress = this.autoGenStarted
      ? Math.min(this.totalWordsTyped / this.MAX_WORDS, 1)
      : Math.min(this.wordCount / this.WORD_THRESHOLD, 1);

    const FLICKER_RATE_INITIAL = 200;
    const FLICKER_RATE_MIN     = 15;
    const interval = FLICKER_RATE_INITIAL - (FLICKER_RATE_INITIAL - FLICKER_RATE_MIN) * progress;

    const styleNames = COLOR_STYLES.map(s => s.name);

    // Restore previously highlighted special-char spans
    this._flickerCharActive.forEach(({ span, origClass }) => { span.className = origClass; });
    this._flickerCharActive = [];

    // Pick a random number of special-char spans to highlight
    const numPicks = this.SPECIAL_CHAR_PICKS_MIN +
      Math.floor(Math.random() * (this.SPECIAL_CHAR_PICKS_MAX - this.SPECIAL_CHAR_PICKS_MIN + 1));
    for (let i = 0; i < numPicks; i++) {
      const span = this.specialCharSpans[Math.floor(Math.random() * this.specialCharSpans.length)];
      const origClass = span.className;
      span.className = styleNames[Math.floor(Math.random() * styleNames.length)];
      this._flickerCharActive.push({ span, origClass });
    }

    this.flickerCharTimer = setTimeout(() => this.tickSpecialCharFlicker(), interval);
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  addGlobalStyles() {
    // Fallback: inject the stylesheet if it wasn't already loaded by index.html.
    if (!document.querySelector('link[href="/styles/typing-scene.css"]')) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = '/styles/typing-scene.css';
      document.head.appendChild(link);
    }
  }

  completeScene() {
    if (this.sceneComplete) return;
    this.sceneComplete = true;

    // Stop all column and flicker timers
    this.colStates.forEach(col => clearTimeout(col.timer));
    clearTimeout(this.flickerRoamTimer);
    clearTimeout(this.flickerCharTimer);
    this.flickerRoamTimer = null;
    this.flickerCharTimer = null;

    // Clean up any spans still mid-flicker
    this._flickerActive.forEach(({ span, origClass }) => { span.className = origClass; });
    this._flickerCharActive.forEach(({ span, origClass }) => { span.className = origClass; });
    this._flickerActive = [];
    this._flickerCharActive = [];

    this._runOutro();
  }

  // Outro — scatter the text offscreen, then fade into VideoScene
  _runOutro() {
    // Fade out the ambient drone
    if (this.audioManager && this.audioManager.typingAmbientSynth) {
      this.audioManager.typingAmbientSynth.fadeOut(2.5);
    }

    // Remove any lingering cursors
    document.querySelectorAll('.prompt-cursor').forEach(el => el.remove());

    // Grab all visible text spans
    const allSpans = Array.from(
      document.querySelectorAll('.typing-text, .prompt-char')
    );

    // Scatter them out in random order
    const SCATTER_DURATION = 2.2;
    gsap.to(allSpans, {
      opacity: 0,
      duration: 0.12,
      stagger: {
        each: SCATTER_DURATION / Math.max(allSpans.length, 1),
        from: 'random',
      },
      ease: 'none',
      onComplete: async () => {
        if (!this.sceneManager) return;

        // Transition while the current DOM is still intact
        await this.sceneManager.transitionTo('video');

        // VideoScene wipes the DOM — briefly hide before fading back in
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            gsap.to(document.body, {
              opacity: 1,
              duration: 1.5,
              ease: 'power1.in',
            });
          });
        });
      },
    });
  }
}
