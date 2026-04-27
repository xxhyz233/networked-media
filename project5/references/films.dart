import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'models/film.dart';
import 'models/film_manager.dart';
import 'screens/custom_film_editor.dart';
import 'screens/film_detail_page.dart';
import 'l10n/app_strings.dart';
import 'services/film_sync_service.dart';
import 'services/subscription_service.dart';

class FilmsPage extends StatefulWidget {
  const FilmsPage({super.key});

  @override
  State<FilmsPage> createState() => _FilmsPageState();
}

class _FilmsPageState extends State<FilmsPage> {
  final FilmManager _filmManager = FilmManager();

  bool _isLoading = true;
  List<Film?> _selectedFilms = [];
  int? _selectingSlotIndex; // Track which slot is being selected
  bool _needsSync = false; // Track if local changes need to be synced to camera

  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _filmManager.addListener(_refreshFilmsList);
    FilmSyncService.instance.isSyncing.addListener(_onSyncStateChanged);
    _initializeFilms();
  }

  @override
  void dispose() {
    _filmManager.removeListener(_refreshFilmsList);
    FilmSyncService.instance.isSyncing.removeListener(_onSyncStateChanged);
    super.dispose();
  }

  void _onSyncStateChanged() {
    if (mounted) setState(() => _isSyncing = FilmSyncService.instance.isSyncing.value);
  }

  Future<void> _initializeFilms() async {
    await _filmManager.initialize();
    _refreshFilmsList();
  }

  Future<void> _onRefresh() async {
    if (_isSyncing) return;
    await FilmSyncService.instance.syncIfAuthed();
    await _filmManager.refreshCustomFilms();
    _refreshFilmsList();
  }

  void _refreshFilmsList() {
    if (mounted) {
      setState(() {
        _isLoading = false;
        _selectedFilms = List.from(_filmManager.selectedFilms);
      });
    }
  }

  void _navigateToFilmDetail(Film film) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => FilmDetailPage(film: film)),
    );

    // If film was edited or deleted (result == true), refresh the film list
    if (result == true) {
      await _filmManager.refreshCustomFilms();
      _refreshFilmsList();
    }
  }

  void _navigateToCustomFilmEditor() {
    _openCustomFilmEditor(null);
  }

  void _replaceFilmInSlot(Film film) async {
    if (_isSyncing || _selectingSlotIndex == null) return;
    if (_selectingSlotIndex != null) {
      await _filmManager.selectFilm(_selectingSlotIndex!, film);
      setState(() {
        _selectedFilms[_selectingSlotIndex!] = film;
        _selectingSlotIndex = null; // Clear selection mode
        _needsSync = true; // Mark as needing sync
      });
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId != null) FilmSyncService.instance.pushPreferences(userId);
    }
  }

  /// Clear a film slot (set to empty/no filter)
  void _clearFilmSlot(int slotIndex) async {
    await _filmManager.selectFilm(slotIndex, null);
    setState(() {
      _selectedFilms[slotIndex] = null;
      _needsSync = true;
    });
    final userId = Supabase.instance.client.auth.currentUser?.id;
    if (userId != null) FilmSyncService.instance.pushPreferences(userId);
  }

  void _toggleFavorite(Film film) async {
    if (_isSyncing) return;
    await _filmManager.toggleFavorite(film.id);
    setState(() {});
    final userId = Supabase.instance.client.auth.currentUser?.id;
    if (userId != null) FilmSyncService.instance.pushPreferences(userId);
  }

  void _openCustomFilmEditor(Film? baseFilm) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CustomFilmEditor(baseFilm: baseFilm),
      ),
    );

    if (result == true) {
      // Force refresh custom films from disk to ensure name changes are reflected
      await _filmManager.refreshCustomFilms();
      _refreshFilmsList();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      backgroundColor: const Color.fromRGBO(30, 30, 31, 1),
      body: _buildFilmsContent(),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToCustomFilmEditor,
        backgroundColor: Colors.white,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  Widget _buildFilmsContent() {
    return Stack(
      children: [
        // Scrollable content with top padding for fixed selected films section
        RefreshIndicator(
          onRefresh: _onRefresh,
          color: Colors.white,
          backgroundColor: const Color.fromRGBO(50, 50, 51, 1),
          child: CustomScrollView(
            slivers: [
              // Add top padding to account for the fixed selected films section
              const SliverToBoxAdapter(
                child: SizedBox(height: 220.0),
              ),
              // Film Stock title
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(
                    left: 16,
                    right: 16,
                    top: 8,
                    bottom: 12,
                  ),
                  child: Center(
                    child: Text(
                      AppStrings.current.filmStock,
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              // Main Films Grid
              SliverToBoxAdapter(child: _buildMainFilmsGrid()),
            ],
          ),
        ),

        // Fixed selected films section at the top
        Positioned(left: 0, right: 0, top: 0, child: _buildSelectedFilmsRow()),
      ],
    );
  }

  Widget _buildSelectedFilmsRow() {
    return Container(
      margin: const EdgeInsets.all(16.0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withAlpha(77),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withAlpha(51), width: 1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.only(
                    left: 16,
                    right: 16,
                    top: 12,
                    bottom: 8,
                  ),
                  child: Text(
                    AppStrings.current.selectedFilms,
                    style: const TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                    left: 16,
                    right: 16,
                    bottom: 16,
                  ),
                  child: Row(
                    children: List.generate(3, (index) {
                      final film =
                          _selectedFilms.length > index
                              ? _selectedFilms[index]
                              : null;
                      return Expanded(
                        child: Container(
                          margin: EdgeInsets.only(right: index == 2 ? 0 : 12),
                          child: _buildSelectedFilmSlot(index, film),
                        ),
                      );
                    }),
                  ),
                ),
                if (_isSyncing)
                  Padding(
                    padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 1.5,
                            color: Colors.white54,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Syncing...',
                          style: const TextStyle(
                            fontFamily: 'SpaceMono',
                            color: Colors.white54,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                // Show info message when 3 films are selected
                if (_needsSync && !_isSyncing)
                  Padding(
                    padding: const EdgeInsets.only(
                      left: 16,
                      right: 16,
                      bottom: 16,
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.blue, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            AppStrings.current.afterFilmsSelectedMessage,
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              color: Colors.blue,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSelectedFilmSlot(int slotIndex, Film? film) {
    final isSelectedForReplacement = _selectingSlotIndex == slotIndex;
    final isEmpty = film == null;
    final slotLabel = 'C${slotIndex + 1}';

    return GestureDetector(
      onTap: () {
        if (_selectingSlotIndex == slotIndex) {
          // If this slot is already selected, cancel selection
          setState(() {
            _selectingSlotIndex = null;
          });
        } else {
          // Otherwise, enter selection mode for this slot
          setState(() {
            _selectingSlotIndex = slotIndex;
          });
        }
      },
      onLongPress: () {
        // Long press to clear slot
        if (film != null) {
          _showClearSlotDialog(slotIndex);
        }
      },
      child: Column(
        children: [
          // Slot label
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(
              slotLabel,
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.white70,
              ),
            ),
          ),
          Container(
            height: 132,
            padding: const EdgeInsets.only(top: 16, bottom: 16),
            decoration: BoxDecoration(
              color:
                  isSelectedForReplacement
                      ? Colors.white.withAlpha(26)
                      : isEmpty
                      ? Colors.white.withAlpha(13)
                      : Colors.black.withAlpha(0),
              borderRadius: BorderRadius.circular(6),
              border:
                  isEmpty
                      ? Border.all(
                        color: Colors.white.withAlpha(51),
                        width: 1,
                        style: BorderStyle.solid,
                      )
                      : null,
            ),
            child:
                isEmpty
                    ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.add_circle_outline,
                            color: Colors.white.withAlpha(128),
                            size: 32,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Empty',
                            style: TextStyle(
                              fontFamily: 'SpaceMono',
                              color: Colors.white.withAlpha(128),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    )
                    : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: Image.asset(
                              film.iconPath,
                              fit: BoxFit.contain,
                              width: double.infinity,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          film.name,
                          style: const TextStyle(
                            fontFamily: 'SpaceMono',
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
          ),
        ],
      ),
    );
  }

  void _showClearSlotDialog(int slotIndex) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            backgroundColor: const Color.fromRGBO(30, 30, 31, 1),
            title: const Text(
              'Clear Slot?',
              style: TextStyle(fontFamily: 'SpaceMono', color: Colors.white),
            ),
            content: Text(
              'Remove film from C${slotIndex + 1}?',
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                color: Colors.white70,
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _clearFilmSlot(slotIndex);
                },
                child: const Text('Clear', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
    );
  }

  Widget _buildMainFilmsGrid() {
    final allFilms = _filmManager.allFilms;

    if (allFilms.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(32.0),
        child: Center(
          child: Text(
            'No films available',
            style: TextStyle(color: Colors.white60, fontSize: 16),
          ),
        ),
      );
    }

    final customFilms = _filmManager.customFilms;
    final user = Supabase.instance.client.auth.currentUser;
    final isPro = SubscriptionService.instance.state.value.isPro;
    final showCloudEmptyState =
        user != null &&
        isPro &&
        customFilms.isEmpty;

    // Group films into rows of 3
    final rows = List.generate(
      (allFilms.length / 3).ceil(),
      (i) => allFilms.sublist(i * 3, (i * 3 + 3).clamp(0, allFilms.length)),
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 80),
      child: Column(
        children: [
          ...List.generate(rows.length, (rowIndex) {
            final row = rows[rowIndex];
            return Container(
              color: rowIndex.isOdd ? Colors.white.withAlpha(10) : null,
              margin: const EdgeInsets.only(bottom: 0),
              padding: const EdgeInsets.only(
                top: 20,
                left: 16,
                right: 16,
                bottom: 20,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: List.generate(row.length, (index) {
                  return Expanded(
                    child: Container(
                      margin: EdgeInsets.only(
                        left: index == 0 ? 0 : 8,
                        right: index == row.length - 1 ? 0 : 8,
                      ),
                      child: _buildFilmCard(row[index]),
                    ),
                  );
                }),
              ),
            );
          }),
          if (showCloudEmptyState) _buildOfflineEmptyState(),
        ],
      ),
    );
  }

  Widget _buildFilmCard(Film film) {
    final isFavorite = _filmManager.isFavorite(film.id);
    final isPendingDelete =
        film.isCustom && film.syncStatus == FilmSyncStatus.pendingDelete;
    final isPendingUpload =
        film.isCustom && film.syncStatus == FilmSyncStatus.pendingUpload;

    Widget card = ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Stack(
        children: [
          Column(
            children: [
              SizedBox(
                height: 100,
                width: double.infinity,
                child: Image.asset(film.iconPath, fit: BoxFit.contain),
              ),

              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 4,
                  vertical: 8,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      film.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'SpaceMono',
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (_selectedFilms.contains(film)) ...[
                      const SizedBox(height: 4),
                      const Icon(
                        Icons.check_circle,
                        color: Colors.white70,
                        size: 16,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (isFavorite)
            const Positioned(
              top: 6,
              right: 6,
              child: Icon(Icons.star_rounded, color: Colors.amber, size: 18),
            ),
          if (isPendingUpload)
            const Positioned(
              top: 6,
              left: 6,
              child: Icon(
                Icons.cloud_upload_outlined,
                color: Colors.white54,
                size: 16,
              ),
            ),
        ],
      ),
    );

    if (isPendingDelete) {
      card = Opacity(opacity: 0.5, child: card);
    }

    return GestureDetector(
      onTap: () {
        if (_selectingSlotIndex != null) {
          _replaceFilmInSlot(film);
        } else {
          _navigateToFilmDetail(film);
        }
      },
      onLongPress: () {
        _toggleFavorite(film);
      },
      child: card,
    );
  }

  Widget _buildOfflineEmptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_outlined, color: Colors.white38, size: 16),
          const SizedBox(width: 8),
          Text(
            AppStrings.current.customFilmsWillSync,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              color: Colors.white38,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
