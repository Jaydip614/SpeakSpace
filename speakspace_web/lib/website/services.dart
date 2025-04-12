import 'package:flutter/material.dart';
import '../widgets/feature_card.dart';

class ServicesSection extends StatefulWidget {
  const ServicesSection({super.key});

  @override
  State<ServicesSection> createState() => _ServicesSectionState();
}

class _ServicesSectionState extends State<ServicesSection>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<Animation<Offset>> _slideAnimations;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    // Create staggered animations for each card
    _slideAnimations = List.generate(3, (index) {
      return Tween<Offset>(
        begin: const Offset(0, 0.5),
        end: Offset.zero,
      ).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Interval(
            0.1 + (0.2 * index), // Staggered start (0.1, 0.3, 0.5)
            1.0,
            curve: Curves.easeOutCubic,
          ),
        ),
      );
    });

    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0, 0.5, curve: Curves.easeIn),
      ),
    );

    // Start animation after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 60),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FadeTransition(
            opacity: _fadeAnimation,
            child: Text(
              'What We Offer',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 30,
                color: Colors.grey[800],
              ),
            ),
          ),
          const SizedBox(height: 30),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              SlideTransition(
                position: _slideAnimations[0],
                child: const FeatureCard(
                  title: "Group Discussions",
                  description:
                      "Practice with peers in moderated real-time rooms.",
                  icon: Icons.groups_3,
                ),
              ),
              SlideTransition(
                position: _slideAnimations[1],
                child: const FeatureCard(
                  title: "Mock Interviews",
                  description: "Simulate interview sessions for any role.",
                  icon: Icons.record_voice_over,
                ),
              ),
              SlideTransition(
                position: _slideAnimations[2],
                child: const FeatureCard(
                  title: "Resume Reviews",
                  description: "Receive detailed feedback on your resume.",
                  icon: Icons.assignment_turned_in,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
