import 'package:flutter/material.dart';
import '../widgets/feature_card.dart';

class ServicesSection extends StatelessWidget {
  const ServicesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 60),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Empowering You for Every Interview Challenge',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 30,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'SpeakSpace offers interactive, real-time experiences to refine your communication and boost your confidence.',
            style: const TextStyle(fontSize: 16, color: Colors.black54),
          ),
          const SizedBox(height: 30),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: const [
              FeatureCard(
                title: "Group Discussions",
                description:
                    "Engage in live, timed discussions with peers. Enhance your critical thinking, articulation, and group dynamics skills—all in a controlled virtual setting.",
                icon: Icons.groups_3,
              ),
              FeatureCard(
                title: "Mock Interviews",
                description:
                    "Face real-time mock interview simulations tailored to your job role. Get professional insights to tackle behavioral, technical, and situational questions with confidence.",
                icon: Icons.record_voice_over,
              ),
              FeatureCard(
                title: "Resume Reviews",
                description:
                    "Receive in-depth reviews from industry professionals. Get actionable suggestions to highlight your strengths and align your resume with job expectations.",
                icon: Icons.assignment_turned_in,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
