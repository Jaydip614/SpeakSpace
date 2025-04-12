import 'package:flutter/material.dart';

class AppScrollController {
  final ScrollController scrollController;
  final List<GlobalKey> navBarKeys;
  final ValueNotifier<int> selectedSectionNotifier;

  AppScrollController({
    required this.scrollController,
    required this.navBarKeys,
    required this.selectedSectionNotifier,
  });

  void init() {
    scrollController.addListener(_onScroll);
  }

  void dispose() {
    scrollController.removeListener(_onScroll);
  }

  void scrollToSection(int navIndex) async {
    final key = navBarKeys[navIndex];

    if (key.currentContext == null) return;

    await Scrollable.ensureVisible(
      key.currentContext!,
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOut,
    );

    selectedSectionNotifier.value = navIndex;
  }

  void _onScroll() {
    if (scrollController.offset <= 0) {
      selectedSectionNotifier.value = 0; // Home section
      return;
    }

    for (int i = 0; i < navBarKeys.length; i++) {
      //Other section
      final GlobalKey key = navBarKeys[i];
      if (key.currentContext == null) continue;

      final RenderBox renderBox =
          key.currentContext!.findRenderObject() as RenderBox;
      final Offset offset = renderBox.localToGlobal(Offset.zero);
      final Size widgetSize = renderBox.size;

      double visibleHeight = widgetSize.height;
      if (offset.dy < 0) {
        visibleHeight += offset.dy;
      } else if (offset.dy + widgetSize.height >
          MediaQuery.of(key.currentContext!).size.height) {
        visibleHeight =
            MediaQuery.of(key.currentContext!).size.height - offset.dy;
      }
      visibleHeight = visibleHeight.clamp(0, widgetSize.height);

      final double visiblePercentage =
          (visibleHeight / widgetSize.height) * 100;
      if (visiblePercentage >= 60) {
        selectedSectionNotifier.value = i;
        break;
      }
    }
  }
}
