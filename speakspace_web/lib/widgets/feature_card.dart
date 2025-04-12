import 'package:flutter/material.dart';

class FeatureCard extends StatefulWidget {
  final String title;
  final String description;
  final IconData icon;
  final VoidCallback? onTap;

  const FeatureCard({
    super.key,
    required this.title,
    required this.description,
    required this.icon,
    this.onTap,
  });

  @override
  State<FeatureCard> createState() => _FeatureCardState();
}

class _FeatureCardState extends State<FeatureCard> {
  bool _isHovered = false;
  bool _isTapped = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit:
          (_) => setState(() {
            _isHovered = false;
            _isTapped = false;
          }),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isTapped = true),
        onTapUp: (_) => setState(() => _isTapped = false),
        onTapCancel: () => setState(() => _isTapped = false),
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 280,
          padding: const EdgeInsets.all(24),
          transform:
              Matrix4.identity()
                ..scale(_isTapped ? 0.98 : 1.0)
                ..translate(0.0, _isHovered ? -4.0 : 0.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(
                  0x22000000,
                ).withOpacity(_isHovered ? 0.3 : 0.1),
                blurRadius: _isHovered ? 16 : 10,
                offset: Offset(0, _isHovered ? 8 : 5),
              ),
            ],
            border: Border.all(
              color: _isHovered ? Colors.blue.shade700 : Colors.blue,
              width: _isHovered ? 1.5 : 1.2,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                widget.icon,
                size: 40,
                color: _isHovered ? Colors.blue.shade700 : Colors.blue,
              ),
              const SizedBox(height: 20),
              Text(
                widget.title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: _isHovered ? Colors.blue.shade700 : Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.description,
                style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
              ),
              const SizedBox(height: 12),
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                transform:
                    Matrix4.identity()..translate(_isHovered ? 4.0 : 0.0, 0.0),
                child: TextButton(
                  style: TextButton.styleFrom(
                    foregroundColor:
                        _isHovered ? Colors.blue.shade700 : Colors.blue,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                  onPressed: widget.onTap,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text("Explore"),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(left: 4),
                        width: _isHovered ? 16 : 0,
                        child: Icon(Icons.arrow_forward, size: 16),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
