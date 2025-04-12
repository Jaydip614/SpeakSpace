import 'package:flutter/material.dart';
import '../utils/constants/nav_bar_data.dart';

class NavBar extends StatefulWidget {
  NavBar({
    super.key,
    required this.onNavItemTap,
    required this.selectedSection,
  });

  final Function(int) onNavItemTap;
  int selectedSection;

  @override
  State<NavBar> createState() => _NavBarState();
}

class _NavBarState extends State<NavBar> {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 62,
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 56),
        child: Row(
          children: [
            Image.asset("assets/images/speakspace_logo.png", height: 25),
            Spacer(),

            for (int i = 0; i < navTitles.length; i++)
              Padding(
                padding: const EdgeInsets.only(left: 12),
                child: TextButton(
                  onPressed: () {
                    setState(() {
                      widget.selectedSection = i;
                    });
                    widget.onNavItemTap(i);
                  },
                  child: Text(
                    navTitles[i],
                    style: TextStyle(
                      color:
                          widget.selectedSection == i
                              ? Colors.blue
                              : Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            SizedBox(width: 12),
            TextButton(
              onPressed: () {},
              child: Text(
                "Login",
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            SizedBox(width: 16),
            FilledButton(
              onPressed: () {},
              style: FilledButton.styleFrom(backgroundColor: Colors.blue),
              child: Text(
                "Sign Up",
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
