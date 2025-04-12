import 'package:flutter/material.dart';

class AboutUsSection extends StatelessWidget {
  const AboutUsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 56, vertical: 60),
      color: const Color(0xFFF5F7FA),
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Animated Title
          SlideInAnimation(
            delay: 0,
            child: const Text(
              'About Us',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
                letterSpacing: 1.2,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Animated Tagline
          SlideInAnimation(
            delay: 100,
            child: const Text(
              'Practice. Perform. Progress.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.blueGrey,
                fontStyle: FontStyle.italic,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(height: 50),

          // Info Cards
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 30,
            runSpacing: 30,
            children: const [
              SlideInAnimation(
                delay: 200,
                child: _FeatureCard(
                  icon: Icons.flag,
                  title: 'Our Mission',
                  content:
                      "At SpeakSpace, we're transforming how people develop communication skills. "
                      "Our AI-powered platform provides realistic practice environments with instant feedback, "
                      "helping you master group discussions and interviews with confidence.",
                ),
              ),
              SlideInAnimation(
                delay: 300,
                child: _FeatureCard(
                  icon: Icons.lightbulb,
                  title: 'Why Choose Us?',
                  content:
                      "Unlike traditional methods, SpeakSpace offers live peer interactions, "
                      "expert moderation, and detailed analytics. We combine human expertise with "
                      "cutting-edge technology to accelerate your communication growth.",
                ),
              ),
              SlideInAnimation(
                delay: 400,
                child: _FeatureCard(
                  icon: Icons.people,
                  title: 'Our Community',
                  content:
                      "Join 50,000+ learners who've improved their skills with SpeakSpace. "
                      "Our diverse community includes students, job seekers, and professionals "
                      "from all industries.",
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String content;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 320,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 24, color: Colors.blue.shade700),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            content,
            style: TextStyle(
              fontSize: 16,
              height: 1.6,
              color: Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }
}

class SlideInAnimation extends StatelessWidget {
  final Widget child;
  final int delay;

  const SlideInAnimation({super.key, required this.child, required this.delay});

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 600),
      curve: Curves.easeOutCubic,
      tween: Tween(begin: 1.0, end: 0.0),
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * value),
          child: Opacity(opacity: 1 - value, child: child),
        );
      },
      child: child,
    );
  }
}
