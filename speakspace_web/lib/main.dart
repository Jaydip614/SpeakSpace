import 'package:flutter/material.dart';
import 'package:speakspace/home_page.dart' show HomePage;

void main() {
  runApp(const SpeakSpace());
}

class SpeakSpace extends StatelessWidget {
  const SpeakSpace({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: HomePage(),
      theme: ThemeData.light().copyWith(
        textButtonTheme: TextButtonThemeData(
          style: ButtonStyle(
            overlayColor: WidgetStateColor.resolveWith((states) {
              return Colors.transparent;
            }),
          ),
        ),
      ),
    );
  }
}
