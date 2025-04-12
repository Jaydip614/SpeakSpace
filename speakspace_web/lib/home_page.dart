import 'package:flutter/material.dart';
import 'package:speakspace/scroll_controller.dart';
import 'package:speakspace/utils/constants/sizes.dart';
import 'package:speakspace/website/home.dart';
import 'package:speakspace/website/services.dart';
import 'package:speakspace/widgets/nav_bar.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final scrollController = ScrollController();
  late AppScrollController appScrollController;

  final List<GlobalKey> navBarKeys = List.generate(3, (index) => GlobalKey());
  final ValueNotifier<int> selectedSectionNotifier = ValueNotifier<int>(0);

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    appScrollController = AppScrollController(
      scrollController: scrollController,
      navBarKeys: navBarKeys,
      selectedSectionNotifier: selectedSectionNotifier,
    );
    appScrollController.init();
  }

  @override
  void dispose() {
    appScrollController.dispose();
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Scaffold(
          key: scaffoldKey,
          backgroundColor: Colors.white,
          drawer: Drawer(),
          body: Stack(
            children: [
              SingleChildScrollView(
                controller: scrollController,
                scrollDirection: Axis.vertical,
                child: Column(
                  children: [
                    SizedBox(key: navBarKeys.first),
                    _buildResponsiveWidgets(constraints),
                  ],
                ),
              ),
              _buildNavigationBar(constraints),
            ],
          ),
        );
      },
    );
  }

  Widget _buildResponsiveWidgets(BoxConstraints constraints) {
    if (constraints.maxWidth >= AppSizes.desktopScreenSize) {
      return Column(
        children: [
          //Home Section
          WebHomeSection(),
          //Services
          ServicesSection(key: navBarKeys[1]),
          Container(key: navBarKeys[2], height: 900, color: Colors.blue),
        ],
      );
    } else {
      return Container();
    }
  }

  Widget _buildNavigationBar(BoxConstraints constraints) {
    return ValueListenableBuilder<int>(
      valueListenable: selectedSectionNotifier,
      builder: (context, selectedSection, _) {
        if (constraints.maxWidth >= 1000.0) {
          return NavBar(
            selectedSection: selectedSection,
            onNavItemTap: (int navIndex) {
              appScrollController.scrollToSection(navIndex);
            },
          );
        } else {
          return Container();
        }
      },
    );
  }
}
