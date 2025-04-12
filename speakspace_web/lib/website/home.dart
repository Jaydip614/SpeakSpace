import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class WebHomeSection extends StatelessWidget {
  const WebHomeSection({super.key});

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;

    return Container(
      height: screenHeight,
      color: Colors.blue.withValues(alpha: 0.1),
      child: Padding(
        padding: const EdgeInsets.only(left: 56),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            // Left section
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Text(
                        'Level Up Your',
                        style: GoogleFonts.poppins(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                      Text(
                        ' GD & Interview',
                        style: GoogleFonts.poppins(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    'Skills with SpeakSpace',
                    style: GoogleFonts.poppins(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    '''Join real-time group discussions and interview simulations tailored for students \nand job seekers. Play roles, get evaluated, receive detailed feedback, \nand track your communication growth over time. Build confidence and clarity''',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 30),
                  Text(
                    'Trending Activities :',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      keywordChip('Group Discussions'),
                      keywordChip('Mock Interviews'),
                      keywordChip('Resume Reviews'),
                    ],
                  ),
                  const SizedBox(height: 30),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(50),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const SizedBox(width: 10),
                        Icon(Icons.search, color: Colors.blue[500], size: 25),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            decoration: InputDecoration(
                              hintText: 'Enter your topic',
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                        const VerticalDivider(),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              vertical: 15,
                              horizontal: 30,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                          child: const Text('Join Session'),
                        ),
                        const SizedBox(width: 5),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            //Right Section
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(left: 50, bottom: 30),
                child: SizedBox(
                  width: screenWidth / 3.5,
                  height: screenWidth / 3.5,
                  child: Image.asset("assets/images/home_image.png"),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget keywordChip(String label) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.blue[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: GoogleFonts.poppins(
          fontWeight: FontWeight.w600,
          color: Colors.blue,
        ),
      ),
    );
  }
}
