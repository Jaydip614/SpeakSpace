import 'package:flutter/material.dart';
import 'dart:async';

class NextSessionSection extends StatefulWidget {
  const NextSessionSection({super.key});

  @override
  State<NextSessionSection> createState() => _NextSessionSectionState();
}

class _NextSessionSectionState extends State<NextSessionSection> {
  late Timer _timer;
  Duration _remaining = const Duration(
    minutes: 5,
    seconds: 0,
  ); // Example: 5 min countdown

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remaining.inSeconds == 0) {
        _timer.cancel();
      } else {
        setState(() {
          _remaining -= const Duration(seconds: 1);
        });
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String getFormattedTime(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    return "${twoDigits(duration.inMinutes.remainder(60))}:${twoDigits(duration.inSeconds.remainder(60))}";
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      margin: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.blueAccent.withOpacity(0.2)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Your Upcoming Session",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),

          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Chip(
                    label: const Text("Moderator"),
                    backgroundColor: Colors.blue.shade100,
                    labelStyle: const TextStyle(color: Colors.blue),
                  ),
                  const SizedBox(width: 12),
                  Row(
                    children: [
                      const Icon(
                        Icons.timer_outlined,
                        size: 20,
                        color: Colors.black54,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        getFormattedTime(_remaining),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // Buttons
              Row(
                children: [
                  TextButton.icon(
                    style: TextButton.styleFrom(foregroundColor: Colors.green),
                    onPressed: () {
                      // TODO: Join logic
                    },
                    icon: const Icon(Icons.video_call_rounded),
                    label: const Text("Join Now"),
                  ),
                  const SizedBox(width: 10),
                  OutlinedButton.icon(
                    onPressed: () {
                      // TODO: Reschedule logic
                    },
                    icon: const Icon(Icons.schedule),
                    label: const Text("Reschedule"),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 30),

          // Topic Preview
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.chat_bubble_outline, color: Colors.black54),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Topic: The Impact of AI on Modern Jobs",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Chip(
                          label: const Text("Difficulty: Medium"),
                          backgroundColor: Colors.orange.shade100,
                          labelStyle: const TextStyle(color: Colors.orange),
                        ),
                        const SizedBox(width: 10),
                        Chip(
                          label: const Text("Category: Tech & Society"),
                          backgroundColor: Colors.grey.shade200,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
