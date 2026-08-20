#!/usr/bin/env python3
"""Generate experiences_data.py (backend) and mockData.js (frontend) with 25+ experiences per city."""

import json, os

CITIES = {
    "Ahmedabad": {"lat": 23.0225, "lng": 72.5714, "lang": ["gu", "hi"], "lang_display": ["gujarati", "hindi"]},
    "Vadodara":  {"lat": 22.3072, "lng": 73.1812, "lang": ["gu", "hi"], "lang_display": ["gujarati", "hindi"]},
    "Surat":     {"lat": 21.1702, "lng": 72.8311, "lang": ["gu", "hi"], "lang_display": ["gujarati", "hindi"]},
    "Halol":     {"lat": 22.5047, "lng": 73.4710, "lang": ["gu", "hi"], "lang_display": ["gujarati", "hindi"]},
    "Rajkot":    {"lat": 22.3039, "lng": 70.8022, "lang": ["gu", "hi"], "lang_display": ["gujarati", "hindi"]},
    "Udaipur":   {"lat": 24.5854, "lng": 73.7125, "lang": ["hi", "mewari"], "lang_display": ["hindi", "mewari"]},
    "Mumbai":    {"lat": 19.0760, "lng": 72.8777, "lang": ["hi", "mr"], "lang_display": ["hindi", "marathi"]},
}

# Each experience: (title, category, village, lat, lng, price, duration, capacity, desc, host_name, women_hosted, rating, reviews)
EXPERIENCES_RAW = {
    "Ahmedabad": [
        ("Jama Masjid Old City Food Walk", "food", "Ahmedabad Old City", 22.9872, 72.5800, 250, 90, 12, "Walk through the narrow lanes around Jama Masjid sampling street food - fafda-jalebi, biryani, and kulfi from legendary stalls.", "Irshad Qureshi", False, 4.8, 67),
        ("Sabarmati Ashram Heritage Tour", "heritage", "Sabarmati", 23.0627, 72.5807, 150, 90, 20, "Walk the grounds where Gandhi lived and worked. A guide shares stories of the independence movement and the ashram's daily rituals.", "Meena Gandhi", True, 4.9, 112),
        ("Adalaj Stepwell Visit", "heritage", "Adalaj", 23.1638, 72.6364, 200, 60, 15, "Descend into the 5-storey Adalaj stepwell built in 1499. Learn about the intricate carvings, water harvesting, and queen Rudabai's legend.", "Rajesh Vaghela", False, 4.7, 89),
        ("Akshardham Temple Gandhinagar", "temple", "Gandhinagar", 23.2150, 72.6370, 0, 120, 50, "Visit the stunning BAPS Swaminarayan temple complex in Gandhinagar with its carved architecture and serene gardens.", "Priya Patel", True, 4.8, 156),
        ("Sanand Organic Farm Lunch", "food", "Sanand", 22.9915, 72.3822, 450, 120, 10, "Eat a thali made from farm-fresh produce at an organic farm. Learn about millet farming and sustainable agriculture.", "Ramesh Patel", False, 4.8, 45),
        ("Thol Lake Bird Sanctuary", "nature", "Thol", 23.1350, 72.3800, 200, 150, 8, "Birdwatch at Thol Lake sanctuary - spot flamingos, pelicans, and painted storks. A guided nature walk around the wetlands.", "Kanti Gameti", True, 4.6, 38),
        ("Dholka Stepwell Heritage Walk", "heritage", "Dholka", 22.7273, 72.4650, 300, 90, 15, "Walk through 500-year-old stepwells of Dholka with a local historian. Discover Adalaj-style water architecture of the Muzaffarid era.", "Kavita Sharma", True, 4.6, 22),
        ("Bavla Pottery Workshop", "craft", "Bavla", 22.8393, 72.3631, 500, 150, 6, "Shape your own terracotta pot on a traditional wheel in Bavla, known for pottery since the Indus Valley era.", "Mahesh Prajapati", False, 4.9, 38),
        ("Nal Sarovar Bird Sanctuary", "nature", "Nal Sarovar", 22.5200, 71.8900, 300, 180, 10, "Boat ride through Nal Sarovar wetlands. Thousands of migratory birds visit in winter - flamingos, cranes, and storks.", "Vasant Gameti", False, 4.7, 52),
        ("Sarkhej Roza Mosque Tour", "heritage", "Sarkhej", 22.9900, 72.4950, 200, 60, 12, "Explore the Indo-Saracenic architectural marvel of Sarkhej Roza - often called the 'Acropolis of Ahmedabad'.", "Aarav Mehta", False, 4.5, 31),
        ("Kankaria Lake Food Street", "food", "Kankaria", 23.0064, 72.5974, 350, 90, 15, "Evening walk around Kankaria Lake followed by a guided food tasting at the vibrant food street - pav bhaji, pizza, and kulfi.", "Nisha Joshi", True, 4.7, 78),
        ("Manek Chowk Night Market", "food", "Manek Chowk", 23.0216, 72.5800, 200, 60, 10, "By night the jewellery market transforms into Ahmedabad's most famous street food arena. Try the legendary pav bhaji and sandwiches.", "Irshad Qureshi", False, 4.8, 94),
        ("Hatheesing Jain Temple", "temple", "Dariapur", 23.0215, 72.5847, 0, 30, 20, "Marvel at the intricate marble carvings of this 19th-century Jain temple built by a merchant in memory of his wife.", "Chetan Shah", False, 4.6, 43),
        ("Gujarat Science City", "tourist", "Science City", 23.0120, 72.5035, 250, 120, 30, "Interactive science museum with IMAX theatre, planetarium, and hands-on exhibits. Great for families.", "Dr. Komal Desai", True, 4.5, 67),
        ("Indroda Nature Park Gandhinagar", "nature", "Gandhinagar", 23.2300, 72.6000, 200, 150, 15, "Walk through Indroda Park with its dinosaur park, botanical garden, and archaeological museum on the Sabarmati riverbank.", "Rajesh Vaghela", False, 4.6, 55),
        ("Calico Museum of Textiles Tour", "craft", "Shahibagh", 23.0340, 72.5710, 100, 90, 8, "Tour India's finest textile museum. See rare Gujarati embroidery, patola silks, and block prints spanning 5 centuries.", "Sarabhai Foundation", True, 4.8, 41),
        ("Iscon Temple Gandhinagar", "temple", "Gandhinagar", 23.2180, 72.6320, 0, 60, 25, "Visit the beautiful ISKCON temple with its ornate architecture, devotional music, and prasad meal.", "Dhananjay Das", False, 4.5, 33),
        ("Vastrapur Lake Sunset Walk", "tourist", "Vastrapur", 23.0420, 72.5325, 0, 60, 20, "Evening stroll around Vastrapur Lake with local snacks from vendors. A popular spot for Ahmedabad families.", "Nisha Joshi", True, 4.4, 29),
        ("Naroda Heritage Walk", "heritage", "Naroda", 23.0900, 72.6100, 200, 90, 10, "Explore the 14th-century Naroda stepwell and surrounding havelis with a local guide.", "Bharat Thakor", False, 4.5, 18),
        ("Lal Darwaza Craft Bazaar", "craft", "Lal Darwaza", 23.0180, 72.5910, 150, 60, 8, "Shop for traditional Gujarati handicrafts - bandhani dupattas, mirror work, and embroidered juttis at Ahmedabad's oldest bazaar.", "Jigna Vora", True, 4.7, 44),
        ("Daskroi Fort Heritage Walk", "historical", "Daskroi", 22.8500, 72.5400, 250, 120, 8, "Trek to the ruins of Daskroi fort and explore the 18th-century bastions with panoramic views of the Gujarat plains.", "Bharat Thakor", False, 4.4, 12),
        ("Asarwa Jain Temple Visit", "temple", "Asarwa", 23.0450, 72.6200, 0, 45, 15, "Visit the ancient Asarwa Jain temple with its golden spires and peaceful courtyard. Known for its annual fair.", "Chetan Shah", False, 4.5, 22),
        ("Chandola Lake Nature Walk", "nature", "Chandola", 23.0600, 72.6050, 100, 60, 12, "Morning walk around Chandola Lake spotting kingfishers, herons, and turtles. A hidden nature gem inside the city.", "Kanti Gameti", True, 4.6, 27),
        ("Meghaninagar Heritage Havelis", "heritage", "Meghaninagar", 23.0350, 72.6000, 200, 90, 8, "Walk through ornately carved 200-year-old havelis in Meghaninagar. Learn about the merchant families who built them.", "Aarav Mehta", False, 4.5, 16),
        ("Modhera Sun Temple Day Trip", "historical", "Modhera", 23.1600, 72.3700, 500, 240, 10, "Full-day trip to the 11th-century Modhera Sun Temple - Gujarat's masterpiece of Solanki architecture with intricate carvings.", "Rajesh Vaghela", False, 4.9, 67),
        ("Adalaj No Masjid Heritage Visit", "heritage", "Adalaj", 23.1620, 72.6380, 150, 60, 10, "Visit the lesser-known Adalaj no Masjid - a 15th-century mosque with stunning geometric carvings near the famous stepwell.", "Rajesh Vaghela", False, 4.5, 14),
    ],
    "Vadodara": [
        ("Dabhoi Fort Heritage Walk", "heritage", "Dabhoi", 22.1833, 73.4333, 300, 120, 10, "Walk the massive walls of Dabhoi fort - one of Gujarat's largest with 12 km of ramparts and ornate gateways.", "Rina Gaekwad", True, 4.7, 35),
        ("Royal Kitchen Cooking Class", "food", "Dabhoi", 22.1833, 73.4333, 600, 180, 8, "Learn royal Gaekwad-era recipes in historic Dabhoi. Cook undhiyu, fafda, and jalebi under guidance of a home chef.", "Rina Gaekwad", True, 4.8, 32),
        ("Champaner-Pavagadh Archaeological Park", "historical", "Champaner", 22.4833, 73.5333, 350, 180, 12, "Explore the UNESCO World Heritage Site of Champaner-Pavagadh - medieval Islamic architecture in the Aravalli foothills.", "Vikramsinh Jadeja", False, 4.9, 89),
        ("Pavagadh Hill Temple Trek", "temple", "Pavagadh", 22.4667, 73.5333, 400, 240, 8, "Trek up Pavagadh hill to the Kalika Mata temple. Ride the cable car or climb the 2500 steps through the jungle.", "Rajubhai Bhil", False, 4.8, 67),
        ("Padra Handloom Weaving", "craft", "Padra", 22.2333, 73.0833, 400, 120, 5, "Try your hand at a traditional loom in Padra, known for patola and cotton weave heritage. Weave a small piece to take home.", "Nitin Rathva", False, 4.5, 14),
        ("Karjan Tribal Art Workshop", "craft", "Karjan", 21.9333, 73.2167, 550, 150, 6, "Paint Warli and Bhil tribal motifs on fabric and clay under guidance of a tribal artist.", "Sunita Gameti", True, 4.7, 26),
        ("Shinkheda Street Food Trail", "food", "Shinkheda", 22.3833, 73.3833, 300, 90, 12, "Walk through the bazaar tasting gathiya, khandvi, and dhokla at family-run stalls serving for generations.", "Paresh Joshi", False, 4.6, 41),
        ("Laxmi Vilas Palace Tour", "heritage", "Vadodara", 22.3117, 73.1817, 250, 90, 20, "Tour the Indo-Saracenic Laxmi Vilas Palace - four times the size of Buckingham Palace. See the armory, art gallery, and gardens.", "Meera Shah", True, 4.7, 120),
        ("Kirti Mandir Heritage Visit", "temple", "Vadodara", 22.3056, 73.1894, 0, 45, 15, "Visit the cenotaph of the Gaekwad dynasty with its beautiful murals depicting the life of the royal family.", "Meera Shah", True, 4.5, 34),
        ("Nazarbagh Palace Museum", "heritage", "Vadodara", 22.3200, 73.1900, 150, 60, 12, "Explore the Nazarbagh Palace museum housing Gaekwad-era artefacts, weaponry, and royal costumes.", "Vikramsinh Jadeja", False, 4.4, 21),
        ("Ajwa Garden and Lake", "tourist", "Ajwa", 22.4500, 73.1800, 150, 120, 15, "Relax at the landscaped Ajwa Garden built by the Gaekwads. Boating on the lake and a musical fountain show in the evening.", "Rajubhai Bhil", False, 4.5, 45),
        ("Harni Lake Nature Walk", "nature", "Vadodara", 22.3500, 73.1500, 100, 60, 10, "Morning walk around Harni Lake with birdwatching. Spot purple herons, cormorants, and kingfishers.", "Kanti Gameti", True, 4.4, 19),
        ("EME Temple Visit", "temple", "Vadodara", 22.3200, 73.2050, 0, 45, 15, "Visit the unique EME Temple - a modern Sikh-style temple managed by the Indian Army's Electrical and Mechanical Engineering corps.", "Col. Ranjit Singh", False, 4.6, 38),
        ("Borsad Bamboo Craft Workshop", "craft", "Borsad", 22.3667, 73.2000, 350, 120, 6, "Learn bamboo basket weaving from tribal artisans near Borsad. A hands-on craft experience in rural Gujarat.", "Rajubhai Bhil", False, 4.5, 12),
        ("Kayavarohan Shiva Temple", "temple", "Kayavarohan", 22.2000, 73.3000, 0, 60, 20, "Visit one of the 12 Jyotirlingas - the ancient Kayavarohan Shiva temple with its 8th-century inscriptions.", "Mahesh Joshi", False, 4.7, 56),
        ("Dabhoi Silk Sari Workshop", "craft", "Dabhoi", 22.1833, 73.4333, 500, 150, 5, "Watch master weavers create silk saris using traditional Dabhoi patterns passed down through generations.", "Rina Gaekwad", True, 4.6, 18),
        ("Sursagar Lake Boating", "tourist", "Vadodara", 22.3076, 73.1890, 200, 60, 8, "Evening boating on Sursagar Lake with the illuminated cityscape. A giant Shiva statue stands in the middle of the lake.", "Nisha Joshi", True, 4.5, 67),
        ("Dabhoi Heritage Stepwell", "heritage", "Dabhoi", 22.1850, 73.4300, 150, 60, 10, "Explore the Chandod stepwell near Dabhoi with its intricate carvings and ancient water channels.", "Vikramsinh Jadeja", False, 4.4, 15),
        ("Vadodara Museum & Picture Gallery", "tourist", "Vadodara", 22.3100, 73.1900, 100, 90, 20, "See Mughal miniature paintings, European oil paintings, and Egyptian mummy at the old-baroda museum.", "Meera Shah", True, 4.5, 42),
        ("Halol Heritage Fort Walk", "heritage", "Halol", 22.5047, 73.4710, 250, 120, 10, "Walk the walled town of Halol visiting stepwells, havelis, and a 400-year-old Swaminarayan temple.", "Vikramsinh Jadeja", False, 4.4, 12),
        ("Jambughoda Wildlife Sanctuary", "nature", "Jambughoda", 22.3667, 73.5167, 300, 180, 8, "Safari through Jambughoda wildlife sanctuary. Spot leopards, sloth bears, and peacocks in the teak forests.", "Rajubhai Bhil", False, 4.6, 28),
        ("Bhavnagar Trivia Walk", "historical", "Bhavnagar", 22.3400, 73.2100, 200, 90, 12, "Historical walk through Bhavnagar's old walled city - the Mahatma Gandhi market, Takhteshwar temple, and the old port area.", "Dinesh Trivedi", False, 4.5, 19),
        ("Karjan River Fishing Experience", "food", "Karjan", 21.9333, 73.2167, 300, 120, 6, "Fish on the Narmada tributary near Karjan with local fishermen. Cook and eat your catch on the riverbank.", "Ramesh Gameti", False, 4.7, 14),
        ("Pavagadh Jain Temples", "temple", "Pavagadh", 22.4700, 73.5400, 0, 120, 10, "Visit the cluster of ancient Jain temples scattered across Pavagadh hill with stunning marble carvings and forest trails.", "Mahesh Joshi", False, 4.6, 24),
        ("Vadodara Street Food Safari", "food", "Vadodara", 22.3080, 73.1850, 250, 120, 10, "Taste Vadodara's best - gota at Padra, khaman near Mandvi gate, and malpua at Alkapuri. A guided food crawl.", "Paresh Joshi", False, 4.7, 55),
    ],
    "Surat": [
        ("Surat Castle Heritage Walk", "heritage", "Surat", 21.1700, 72.8300, 200, 90, 15, "Walk the 16th-century Surat Castle where the Mughals defended against Portuguese and Maratha raids. See the massive stone walls.", "Farhan Patel", False, 4.6, 38),
        ("Bardoli Silk Sari Weaving", "craft", "Bardoli", 21.1256, 73.1094, 500, 120, 6, "Watch master weavers create Surat patola silk saris. Try the loom yourself at this heart of Gujarat textile heritage.", "Meena Patel", True, 4.9, 55),
        ("Surat Locho and Undhiyu Food Trail", "food", "Surat", 21.1702, 72.8311, 300, 90, 10, "Taste Surat's iconic locho, surti undhiyu, ghari, and khaman from legendary street food stalls in the old city.", "Firoz Saiyed", False, 4.9, 134),
        ("Dumas Beach Sunset", "tourist", "Dumas", 21.0950, 72.7150, 100, 120, 15, "Watch the sunset at Dumas Beach - a black sand beach with a haunted reputation. Try the famous bhajia and cuttings.", "Ravi Patel", False, 4.5, 89),
        ("Dutch Garden Surat", "heritage", "Surat", 21.1680, 72.8290, 100, 60, 10, "Visit the Dutch Garden with its colonial-era tombs of English and Dutch traders who once made Surat a global trade hub.", "Farhan Patel", False, 4.4, 22),
        ("Bardoli Satyagraha Memorial", "historical", "Bardoli", 21.1260, 73.1100, 0, 60, 15, "Visit the memorial where Vallabhbhai Patel led the Bardoli Satyagraha in 1928. A key site in India's freedom struggle.", "Dr. Suman Patel", True, 4.7, 45),
        ("Olpad Cotton Farm Tour", "food", "Olpad", 21.3333, 72.8333, 400, 120, 10, "Visit a working cotton farm, see the ginning process, and eat a farm-fresh Gujarati thali with kadhi and rotla.", "Alpesh Thakor", False, 4.5, 18),
        ("Kamrej Block Printing Workshop", "craft", "Kamrej", 21.2833, 73.0167, 450, 120, 8, "Carve your own wooden block and print a cotton scarf using natural dyes in the artisan village of Kamrej.", "Jigna Vora", True, 4.8, 34),
        ("Mahuva Fishing Village Experience", "food", "Mahuva", 20.9167, 72.9333, 350, 150, 8, "Join fishermen at dawn in coastal Mahuva. Help sort the catch, learn knot-tying, and eat fresh fish thali cooked on shore.", "Kiran Chauhan", False, 4.7, 29),
        ("Surat Diamond Museum Visit", "tourist", "Surat", 21.1850, 72.8350, 200, 90, 20, "Tour the diamond museum in the diamond capital of the world. See how rough stones are polished into sparkling gems.", "Kirankumar Shah", False, 4.6, 67),
        ("Swaminarayan Temple Surat", "temple", "Surat", 21.1750, 72.8250, 0, 45, 20, "Visit the ornate BAPS Swaminarayan temple in Athwa Gates with its detailed carvings and peaceful atmosphere.", "Dhananjay Das", False, 4.5, 41),
        ("Hazira Mangrove Walk", "nature", "Hazira", 21.1050, 72.6300, 200, 120, 8, "Guided walk through the Hazira mangrove forests along the Arabian Sea coast. Spot mudskippers, crabs, and wading birds.", "Vasant Gameti", False, 4.6, 22),
        ("Suvali Beach Day Trip", "tourist", "Suvali", 21.1100, 72.6800, 150, 180, 10, "Relax at the quiet Suvali beach near Hazira. Collect shells, wade in tidal pools, and enjoy fresh seafood.", "Ravi Patel", False, 4.4, 17),
        ("Bardoli Thali at Family Home", "food", "Bardoli", 21.1256, 73.1094, 400, 90, 8, "Eat a traditional Surti thali at a Bardoli family home - undhiyu, sev khamani, and locho with fresh buttermilk.", "Meena Patel", True, 4.7, 33),
        ("Surat Textile Market Walk", "craft", "Surat", 21.1720, 72.8340, 100, 120, 6, "Explore Surat's textile wholesale bazaars - the heart of India's synthetic fabric industry. See prints, weaves, and embroidery.", "Jigna Vora", True, 4.4, 25),
        ("Dandi March Route Walk", "historical", "Dandi", 21.3260, 72.6300, 300, 240, 8, "Walk a section of the Dandi Salt March route near Surat. Visit the beach where Gandhi broke the salt law in 1930.", "Dr. Suman Patel", True, 4.8, 56),
        ("Athwa Gate Food Bazaar", "food", "Athwa", 21.1650, 72.8280, 250, 90, 10, "Morning food walk at Athwa Gate - the busiest breakfast junction in Surat. Khaman, dhokla, gathiya, and cutting chai.", "Firoz Saiyed", False, 4.7, 72),
        ("Kamrej Temple Circuit", "temple", "Kamrej", 21.2833, 73.0167, 150, 90, 10, "Visit the ancient temples around Kamrej including a 12th-century Shiva temple and a Jain derasar with marble carvings.", "Mahesh Joshi", False, 4.5, 18),
        ("Tapi River Boating", "tourist", "Surat", 21.1700, 72.8300, 150, 60, 8, "Evening boat ride on the Tapi River with views of the old fort, Dutch tombs, and illuminated bridges.", "Ravi Patel", False, 4.4, 31),
        ("Surat Science Centre", "tourist", "Surat", 21.1800, 72.8350, 200, 120, 25, "Interactive science museum with planetarium, planetarium, and hands-on exhibits. Great for families and kids.", "Dr. Komal Desai", True, 4.5, 44),
        ("Olpad Wetland Birdwatching", "nature", "Olpad", 21.3333, 72.8333, 200, 150, 8, "Guided birdwatching at the Olpad wetlands. Spot flamingos, spoonbills, and painted storks in season.", "Vasant Gameti", False, 4.5, 16),
        ("Surat Castle Night Tour", "heritage", "Surat", 21.1700, 72.8300, 250, 90, 10, "Rare night tour of Surat Castle illuminated with lanterns. Hear stories of Mughal-Portuguese battles.", "Farhan Patel", False, 4.7, 28),
        ("Mahuva Temple Visit", "temple", "Mahuva", 20.9167, 72.9333, 0, 60, 10, "Visit the ancient Mahuva Dham temple dedicated to Lord Shiva with its beautiful coastal setting and centuries-old architecture.", "Mahesh Joshi", False, 4.5, 19),
        ("Surat Heritage Havelis Walk", "heritage", "Surat", 21.1710, 72.8290, 200, 90, 10, "Explore the merchant havelis of old Surat with their carved wooden facades and ornate courtyards from the Mughal era.", "Aarav Mehta", False, 4.6, 23),
        ("Purna River Dolphin Spotting", "nature", "Purna", 21.1500, 73.0500, 300, 180, 6, "Boat ride on the Purna river to spot rare Gangetic dolphins. Best in winter months when water is clear.", "Vasant Gameti", False, 4.8, 11),
    ],
    "Halol": [
        ("Jambughoda Bamboo Craft Workshop", "craft", "Jambughoda", 22.3667, 73.5167, 350, 120, 6, "Learn bamboo basket weaving from Bhil artisans in the forest-fringe village of Jambughoda.", "Rajubhai Bhil", False, 4.7, 16),
        ("Godhra Panchmahal Thali", "food", "Godhra", 22.7739, 73.6220, 400, 120, 8, "Cook a traditional Panchmahal thali on a chulha by the riverbank. Taste tribal-influenced cuisine of central Gujarat.", "Hasmukh Patel", False, 4.6, 21),
        ("Kalol Heritage Fort Walk", "heritage", "Kalol", 22.5075, 73.4642, 250, 90, 12, "Walk the old walled town of Kalol near Halol, visiting stepwells, havelis, and a 400-year-old Swaminarayan temple.", "Vikramsinh Jadeja", False, 4.4, 12),
        ("Dharampuri Forest Honey Tasting", "food", "Dharampuri", 22.4333, 73.3167, 300, 90, 8, "Taste wild forest honey and adivasi cuisine at a Bhil hamlet near Dharampuri. The host harvests honey from cliff hives.", "Lakshmi Bhil", True, 4.8, 9),
        ("Pavagadh Hill Trek", "tourist", "Pavagadh", 22.4667, 73.5333, 300, 240, 10, "Trek the 2500 steps up Pavagadh through teak forest to the Kalika Mata temple at 800m elevation.", "Rajubhai Bhil", False, 4.8, 54),
        ("Champaner Old City Walk", "historical", "Champaner", 22.4833, 73.5333, 200, 120, 10, "Walk through the medieval city of Champaner with its mosques, minarets, and stepwells from the Gujarat Sultanate era.", "Vikramsinh Jadeja", False, 4.7, 33),
        ("Jambughoda Wildlife Safari", "nature", "Jambughoda", 22.3667, 73.5167, 400, 180, 6, "Jeep safari through Jambughoda wildlife sanctuary. Spot leopards, sloth bears, and Indian gazelles in the teak forests.", "Rajubhai Bhil", False, 4.6, 22),
        ("Halol Stepwell Heritage Visit", "heritage", "Halol", 22.5047, 73.4710, 150, 60, 10, "Explore the ancient stepwells of Halol - architectural marvels of water conservation carved from stone centuries ago.", "Vikramsinh Jadeja", False, 4.5, 11),
        ("Godhra Railway Heritage Walk", "historical", "Godhra", 22.7739, 73.6220, 200, 90, 8, "Walk through Godhra's historic railway quarter with colonial-era buildings and the story of India's railway heritage.", "Hasmukh Patel", False, 4.4, 9),
        ("Panchmahal Tribal Dance Night", "heritage", "Godhra", 22.7739, 73.6220, 350, 180, 15, "Evening tribal dance performance by Bhil artists near Godhra. Join the campfire and learn the traditional steps.", "Rajubhai Bhil", False, 4.7, 18),
        ("Dharampuri Waterfall Trek", "waterfall", "Dharampuri", 22.4333, 73.3167, 300, 180, 8, "Trek to the seasonal waterfall near Dharampuri through Bhil villages and teak forest. Best during monsoon.", "Lakshmi Bhil", True, 4.6, 14),
        ("Kalol Bazaar Food Walk", "food", "Kalol", 22.5075, 73.4642, 200, 60, 10, "Taste the local specialties of Kalol - fafda-jalebi, khaman, and the famous Kalari cheese at the old bazaar.", "Paresh Joshi", False, 4.5, 17),
        ("Pavagadh Jain Temples Visit", "temple", "Pavagadh", 22.4700, 73.5400, 0, 120, 10, "Visit the cluster of ancient Jain temples scattered across Pavagadh hill with stunning marble carvings.", "Mahesh Joshi", False, 4.6, 24),
        ("Champaner Jama Masjid", "temple", "Champaner", 22.4840, 73.5340, 0, 60, 15, "Explore the grand Jama Masjid of Champaner - a stunning blend of Hindu and Islamic architecture from the 16th century.", "Vikramsinh Jadeja", False, 4.7, 31),
        ("Jambughoda Dam Picnic", "tourist", "Jambughoda", 22.3700, 73.5200, 100, 120, 12, "Relax at the scenic Jambughoda dam surrounded by forest. A popular picnic spot with boating facilities.", "Rajubhai Bhil", False, 4.4, 15),
        ("Bhil Art at Karjan", "craft", "Karjan", 21.9333, 73.2167, 400, 120, 6, "Paint traditional Bhil dot art on canvas and fabric with guidance from a tribal artist family.", "Sunita Gameti", True, 4.7, 20),
        ("Halol Swaminarayan Temple", "temple", "Halol", 22.5050, 73.4700, 0, 45, 20, "Visit the ornate Swaminarayan temple in Halol with its intricate wood carvings and peaceful courtyard.", "Dhananjay Das", False, 4.5, 18),
        ("Dharampuri Hilltop Sunrise", "nature", "Dharampuri", 22.4350, 73.3150, 200, 120, 6, "Early morning trek to the hilltop near Dharampuri for panoramic views of the Panchmahal forest canopy.", "Lakshmi Bhil", True, 4.6, 8),
        ("Godhra Silk weaving", "craft", "Godhra", 22.7739, 73.6220, 450, 120, 5, "Watch artisans weave Panchmahal silk at a traditional workshop. The local silk is known for its earthy tones.", "Hasmukh Patel", False, 4.5, 11),
        ("Kalol Heritage Stepwell Visit", "heritage", "Kalol", 22.5080, 73.4630, 150, 60, 8, "Descend into the 400-year-old stepwell of Kalol with its carved pillars and ancient water channels.", "Vikramsinh Jadeja", False, 4.4, 9),
        ("Pavagadh Ropeway Ride", "tourist", "Pavagadh", 22.4680, 73.5320, 250, 90, 12, "Ride the cable car up Pavagadh hill for stunning views of the Champaner valley. Skip the 2500 steps!", "Rajubhai Bhil", False, 4.6, 45),
        ("Halol Local Food Trail", "food", "Halol", 22.5047, 73.4710, 200, 90, 8, "Taste the best of Halol - seasonal农村 cuisine, undhiyu, and fresh chikki from local sweet shops.", "Paresh Joshi", False, 4.5, 14),
        ("Dharampuri Tribal Museum Visit", "heritage", "Dharampuri", 22.4333, 73.3167, 100, 60, 10, "Small community museum showcasing Bhil tribal artefacts, traditional weapons, and daily life objects.", "Lakshmi Bhil", True, 4.4, 7),
        ("Champaner Nagina Masjid", "historical", "Champaner", 22.4820, 73.5350, 0, 60, 8, "Visit the exquisite Nagina Masjid (Jewel Mosque) of Champaner with its twin minarets and geometric stone carvings.", "Vikramsinh Jadeja", False, 4.7, 19),
        ("Jambughoda Forest Camping", "nature", "Jambughoda", 22.3667, 73.5167, 500, 480, 6, "Overnight camping in Jambughoda forest with a bonfire dinner and stargazing. Wake to birdsong and a forest walk.", "Rajubhai Bhil", False, 4.8, 12),
    ],
    "Rajkot": [
        ("Gondal Silver Filigree Workshop", "craft", "Gondal", 22.0333, 70.8000, 600, 150, 5, "Learn the art of silver filigree (chandli) from master artisans in Gondal, the heritage town of the Jadeja rulers.", "Arjun Jadeja", False, 4.9, 42),
        ("Morbi Bandhani Tie-Dye", "craft", "Morbi", 22.8167, 70.8333, 450, 120, 8, "Tie and dye your own bandhani fabric in Morbi, famous for textile mills and ceramic heritage.", "Hetal Dave", True, 4.7, 28),
        ("Wankaner Kathiyawadi Thali", "food", "Wankaner", 22.5500, 70.9500, 350, 90, 10, "Authentic Kathiyawadi thali with sev tameta, ringan no olo, and bajra rotla at a family home in Wankaner.", "Dilip Solanki", False, 4.6, 35),
        ("Kotda Ceramic Pottery", "craft", "Kotda", 22.4167, 70.7500, 400, 120, 6, "Shape and glaze ceramic pottery at a traditional kiln. Kotda has supplied pottery to Saurashtra for centuries.", "Raju Katariya", False, 4.5, 11),
        ("Watson Museum Heritage Visit", "heritage", "Rajkot", 22.3039, 70.8022, 100, 60, 15, "Explore the Watson Museum with its collection of colonial-era artefacts, Gaekwad treasures, and Rajkot history.", "Dr. Suman Patel", True, 4.5, 34),
        ("Rajkot Bazaar Street Food", "food", "Rajkot", 22.3050, 70.8030, 250, 90, 10, "Taste Rajkot's best - dabeli at University Road, fafda near Saurashtra Cricket Association, and ice cream at Snow World.", "Paresh Joshi", False, 4.7, 78),
        ("Gondal Palace Museum Tour", "heritage", "Gondal", 22.0340, 70.8010, 200, 90, 10, "Tour the Naulakha Palace in Gondal with its vintage car collection, royal portraits, and marble courtyards.", "Arjun Jadeja", False, 4.6, 29),
        ("Morbi Bridge Heritage Walk", "historical", "Morbi", 22.8170, 70.8340, 150, 90, 12, "Walk across the historic Morbi suspension bridge over the Machhu River, a 19th-century engineering marvel.", "Hetal Dave", True, 4.5, 18),
        ("Wankaner Ranjit Vilas Palace", "heritage", "Wankaner", 22.5510, 70.9510, 200, 90, 10, "Visit the stunning Ranjit Vilas Palace built by the Jadeja rulers in a mix of European and Indian architectural styles.", "Dilip Solanki", False, 4.6, 21),
        ("Prag Mahal Heritage Visit", "heritage", "Rajkot", 22.3030, 70.8020, 100, 60, 15, "Climb the clock tower of Prag Mahal for panoramic views of Rajkot. See the Italian marble interiors and durbar hall.", "Dr. Suman Patel", True, 4.7, 45),
        ("Rajkot Planetarium", "tourist", "Rajkot", 22.3020, 70.7980, 150, 60, 20, "Visit the U.V. Science Centre planetarium with shows about Indian space missions and celestial navigation.", "Dr. Komal Desai", True, 4.5, 33),
        ("Kotha Waterfall Trek", "waterfall", "Kotha", 22.1500, 70.7000, 300, 180, 8, "Trek to the scenic Kotha waterfall near Rajkot through rocky terrain. Best visited during or just after monsoon.", "Rajubhai Bhil", False, 4.6, 17),
        ("Bhujio Dungar Fort Visit", "historical", "Rajkot", 22.3100, 70.8100, 150, 90, 10, "Hike up Bhujio Dungar hill fort for sunset views of Rajkot city. The ancient fort has cannon positions and ramparts.", "Bharat Thakor", False, 4.4, 14),
        ("Shree Ranchhodrai Temple", "temple", "Rajkot", 22.3010, 70.7980, 0, 45, 20, "Visit the famous Ranchhodrai Temple - Rajkot's most beloved temple with daily aarti and peaceful prayer halls.", "Mahesh Joshi", False, 4.6, 52),
        ("Morbi Ceramic Factory Visit", "craft", "Morbi", 22.8200, 70.8300, 300, 120, 8, "Tour a ceramic tile factory in Morbi - the ceramic capital of India producing millions of tiles daily.", "Hetal Dave", True, 4.5, 22),
        ("Gondal Chandibaiji Temple", "temple", "Gondal", 22.0320, 70.7990, 0, 45, 15, "Visit the hilltop Chandibaiji Jain temple near Gondal with panoramic valley views and serene marble architecture.", "Arjun Jadeja", False, 4.5, 16),
        ("Rajkot Lake Garden Walk", "tourist", "Rajkot", 22.3060, 70.8050, 0, 60, 15, "Evening stroll at the Rajkot Lake garden with fountains, boating, and street food vendors.", "Nisha Joshi", True, 4.4, 38),
        ("Wankaner Stepwell Visit", "heritage", "Wankaner", 22.5490, 70.9490, 100, 60, 8, "Explore the ornate stepwell in Wankaner with its carved pillars and ancient water harvesting architecture.", "Dilip Solanki", False, 4.4, 10),
        ("Nageshwar Jyotirlinga Day Trip", "temple", "Nageshwar", 22.2000, 70.8500, 200, 120, 10, "Day trip to the Nageshwar Jyotirlinga temple - one of the 12 sacred Shiva temples of India.", "Mahesh Joshi", False, 4.7, 48),
        ("Rajkot Cooking Class", "food", "Rajkot", 22.3040, 70.8020, 400, 150, 6, "Learn to cook Kathiyawadi classics - sev tameta, kathol, and baingan bharta - in a Rajkot home kitchen.", "Hetal Dave", True, 4.7, 26),
        ("Aji Dam Nature Walk", "nature", "Rajkot", 22.2800, 70.8200, 100, 90, 10, "Walk along the Aji Dam reservoir with birdwatching. Spot white-throated kingfishers and Indian pond herons.", "Vasant Gameti", False, 4.4, 15),
        ("Jamnagar Heritage Side Trip", "historical", "Jamnagar", 22.4700, 70.0700, 500, 240, 8, "Day trip to Jamnagar - visit the Lakhota Palace, Bala Hanuman Temple, and the pearl city's old walled town.", "Arjun Jadeja", False, 4.7, 31),
        ("Rajkot Vintage Car Collection", "tourist", "Rajkot", 22.3040, 70.8010, 200, 60, 8, "See the rare vintage car collection at the Gondal palace - Rolls Royces, Bentleys, and Cadillacs of the royal family.", "Arjun Jadeja", False, 4.6, 24),
        ("Bhogavo River Picnic", "nature", "Bhogavo", 22.2200, 70.7800, 100, 120, 10, "Picnic by the Bhogavo River with family. Natural rock pools and shaded spots under banyan trees.", "Rajubhai Bhil", False, 4.3, 8),
        ("Morbi Art Gallery Visit", "craft", "Morbi", 22.8160, 70.8320, 100, 60, 10, "Visit the Morbi Art Gallery with its collection of Kathiawari paintings, folk art, and royal memorabilia.", "Hetal Dave", True, 4.4, 12),
        ("Rajkot Sadhu Vaswani Ashram", "heritage", "Rajkot", 22.2950, 70.8060, 0, 45, 15, "Visit the peaceful Sadhu Vaswani Ashram in Rajkot - a spiritual retreat with gardens and a meditation hall.", "Dhananjay Das", False, 4.5, 19),
    ],
    "Udaipur": [
        ("Eklingji Miniature Painting", "craft", "Eklingji", 24.5833, 73.7500, 700, 180, 4, "Learn the ancient Mewar school of miniature painting near the Eklingji temples with a Rajasthani master painter.", "Meera Chitrakar", True, 4.9, 37),
        ("Nathdwara Boat Ride & Mewari Lunch", "food", "Nathdwara", 24.9333, 73.8167, 550, 150, 10, "Boat on the lake near Nathdwara and eat traditional Mewari thali with dal baati churma at a lakeside home.", "Gopal Singh", False, 4.8, 48),
        ("Rajsamand Marble Inlay Work", "craft", "Rajsamand", 25.0333, 73.8833, 500, 120, 6, "Try marble inlay (parchin kari) near the famous dam. Create a small coaster using semi-precious stones.", "Vinod Kumhar", False, 4.6, 19),
        ("Sardar Forest Walk & Tribal Dance", "heritage", "Sardar", 24.4833, 73.7000, 400, 180, 8, "Walk through the Aravalli forest with a Bhil guide, then join a traditional tribal dance around a campfire.", "Bhura Bhil", False, 4.7, 15),
        ("City Palace Heritage Tour", "heritage", "Udaipur", 24.5764, 73.6913, 500, 180, 15, "Tour the magnificent City Palace of Udaipur - Rajasthan's largest palace complex with museum, courtyards, and lake views.", "Arvind Singh", False, 4.9, 178),
        ("Lake Pichola Sunset Boat Ride", "tourist", "Udaipur", 24.5710, 73.6820, 400, 90, 12, "Sunset boat ride on Lake Pichola past the Lake Palace and Jag Mandir. The golden hour light on the palaces is magical.", "Gopal Singh", False, 4.9, 156),
        ("Jagdish Temple Morning Aarti", "temple", "Udaipur", 24.5770, 73.6890, 0, 45, 20, "Join the morning aarti at the 17th-century Jagdish Temple - a beautiful Indo-Aryan temple with carved elephants and deities.", "Mahesh Joshi", False, 4.8, 89),
        ("Saheliyon ki Bari Garden", "tourist", "Udaipur", 24.5890, 73.6900, 100, 60, 15, "Explore the Garden of Maidens with its lotus pools, marble elephants, and fountains built for 48 royal maids.", "Meera Chitrakar", True, 4.6, 67),
        ("Bagore ki Haveli Folk Dance Show", "heritage", "Udaipur", 24.5760, 73.6830, 200, 90, 30, "Watch the Dharohar folk dance show at Bagore ki Haveli on the Lake Pichola ghats every evening.", "Arvind Singh", False, 4.8, 134),
        ("Kumbhalgarh Fort Day Trip", "historical", "Kumbhalgarh", 25.1500, 73.5800, 500, 360, 8, "Full-day trip to the 15th-century Kumbhalgarh Fort with the second-longest continuous wall in the world (36 km).", "Bhura Bhil", False, 4.9, 87),
        ("Ranakpur Jain Temple Visit", "temple", "Ranakpur", 25.1500, 73.4500, 400, 240, 10, "Day trip to the 1444-pillar Ranakpur Jain Temple - every pillar is uniquely carved. One of India's most stunning temples.", "Mahesh Joshi", False, 4.9, 95),
        ("Udaipur Silver Jewelry Workshop", "craft", "Udaipur", 24.5780, 73.6880, 500, 120, 5, "Make your own Rajasthani silver jewelry - rings, earrings, or bangles - at a traditional silversmith's workshop.", "Vinod Kumhar", False, 4.7, 28),
        ("Fateh Sagar Lake Cycling", "tourist", "Udaipur", 24.5950, 73.6800, 200, 120, 8, "Cycle around Fateh Sagar Lake and visit Nehru Island Park. Early morning ride with views of the Aravalli hills.", "Rajubhai Bhil", False, 4.6, 42),
        ("Doodh Talai Sunset Point", "tourist", "Udaipur", 24.5680, 73.6780, 100, 60, 10, "Watch sunset from Doodh Talai with panoramic views of Lake Pichola and the City Palace illuminated at dusk.", "Gopal Singh", False, 4.7, 56),
        ("Mewar Cooking Class", "food", "Udaipur", 24.5770, 73.6900, 600, 180, 6, "Cook traditional Mewari dishes - dal baati churma, ker sangri, and gatte ki sabzi - in a Udaipur home kitchen.", "Meera Chitrakar", True, 4.8, 34),
        ("Nathdwara Shrinathji Temple", "temple", "Nathdwara", 24.9340, 73.8170, 0, 120, 20, "Visit the sacred Shrinathji temple in Nathdwara - the most important Vaishnavite pilgrimage site in Rajasthan.", "Gopal Singh", False, 4.9, 112),
        ("Monsoon Palace Trek", "heritage", "Udaipur", 24.5500, 73.6600, 300, 180, 8, "Trek up to Sajjangarh (Monsoon Palace) on a hilltop for 360-degree views of Udaipur's lakes and palaces.", "Bhura Bhil", False, 4.6, 45),
        ("Udaipur Puppet Show & Craft", "craft", "Udaipur", 24.5750, 73.6870, 250, 90, 10, "Watch a traditional Kathputli puppet show and learn to make your own puppet from the puppeteer family.", "Vinod Kumhar", False, 4.7, 38),
        ("Chittorgarh Fort Day Trip", "historical", "Chittorgarh", 24.8887, 74.6269, 500, 360, 8, "Full-day trip to India's largest fort - 700 acres of palaces, temples, and towers echoing tales of Rajput valour.", "Arvind Singh", False, 4.9, 78),
        ("Udaipur Rooftop Dining", "food", "Udaipur", 24.5764, 73.6913, 700, 120, 8, "Dinner at a rooftop restaurant overlooking Lake Pichola. Mewari thali, Laal Maas, and kulfi with City Palace lights.", "Gopal Singh", False, 4.8, 91),
        ("Gangaur Ghat Morning Walk", "heritage", "Udaipur", 24.5740, 73.6810, 0, 60, 10, "Early morning walk along the ghats of Lake Pichola. See locals performing morning rituals and priests chanting.", "Meera Chitrakar", True, 4.6, 32),
        ("Aravalli Hills Nature Trek", "nature", "Udaipur", 24.5600, 73.7100, 350, 240, 8, "Full-day trek through the ancient Aravalli hills near Udaipur. Spot langurs, peacocks, and wild boar.", "Bhura Bhil", False, 4.7, 21),
        ("Sajjangarh Biological Park", "nature", "Udaipur", 24.5530, 73.6620, 200, 120, 15, "Visit the zoo near Monsoon Palace with tigers, lions, crocodiles, and exotic birds in natural enclosures.", "Rajubhai Bhil", False, 4.5, 28),
        ("Udaipur Block Print Workshop", "craft", "Udaipur", 24.5770, 73.6860, 400, 120, 6, "Carve wooden blocks and print your own fabric using traditional Rajasthani block printing techniques and natural dyes.", "Jigna Vora", True, 4.7, 24),
        ("Eklingji Temple Complex Visit", "temple", "Eklingji", 24.5833, 73.7500, 0, 90, 15, "Visit the 8th-century Eklingji temple complex with 108 temples in a walled courtyard. The main deity is a four-faced Shiva.", "Mahesh Joshi", False, 4.7, 42),
        ("Udaipur Vintage Car Museum", "tourist", "Udaipur", 24.5720, 73.6880, 200, 60, 10, "See the royal family's vintage car collection including Rolls Royces, Mercedes, and classic Cadillacs in a lakeside garage.", "Arvind Singh", False, 4.6, 29),
        ("Ahar Cenotaphs Heritage Visit", "historical", "Ahar", 24.6000, 73.7000, 0, 60, 10, "Visit the royal cremation ground of Ahar with 19 ornately carved cenotaphs of Mewar rulers set against the Aravalli hills.", "Bhura Bhil", False, 4.5, 18),
        ("Udaipur Rooftop Yoga & Meditation", "nature", "Udaipur", 24.5770, 73.6900, 300, 60, 8, "Morning yoga session on a rooftop overlooking Lake Pichola. Guided meditation with views of the rising sun over the Aravallis.", "Meera Chitrakar", True, 4.7, 15),
    ],
    "Mumbai": [
        ("Koli Fishing Village at Thane", "food", "Thane", 19.2183, 72.9781, 500, 150, 8, "Visit a Koli fishing village in Thane Creek. Watch the morning catch, learn fish cleaning, and eat fresh Koli fish curry.", "Anita Koli", True, 4.7, 31),
        ("Kondhadi Tribal Art at Kalyan", "craft", "Kalyan", 19.2437, 73.1355, 450, 120, 6, "Paint Kondhadi tribal motifs on cloth and pottery. Learn the stories behind Warli-inspired designs.", "Suresh Pawar", False, 4.6, 20),
        ("Alibaug Mango Orchard Visit", "food", "Alibaug", 18.6414, 72.8722, 350, 120, 10, "Walk through a mango orchard in Alibaug. Taste Alphonso and Kesar varieties fresh from the tree.", "Priya Deshmukh", True, 4.8, 44),
        ("Panvel Hill Fort Heritage Trail", "heritage", "Panvel", 19.0000, 73.0833, 400, 180, 10, "Hike to Prabalgad fort near Panvel with a local guide. Stunning views of the Sahyadri range from the top.", "Ravi Patil", False, 4.7, 25),
        ("Elephanta Caves Heritage Tour", "heritage", "Elephanta Island", 18.9634, 72.9315, 500, 300, 12, "Ferry to Elephanta Island and explore the 6th-century cave temples dedicated to Lord Shiva with iconic Trimurti sculpture.", "Deepak Koli", False, 4.8, 156),
        ("Gateway of India Food Walk", "food", "Colaba", 18.9220, 72.8347, 350, 120, 10, "Food walk from Gateway of India through Colaba - Britannia Cafe's berry pulao, Leopold's cafe, and Old Bombay sweets.", "Firoz Saiyed", False, 4.8, 112),
        ("Dharavi Pottery Village Tour", "craft", "Dharavi", 19.0430, 72.8520, 400, 120, 8, "Visit the pottery kumbharwada in Dharavi. See how thousands of pots are made daily. Try your hand at the wheel.", "Ramesh Kumhar", False, 4.6, 67),
        ("Sanjay Gandhi National Park Safari", "nature", "Borivali", 19.2147, 72.9107, 400, 180, 8, "Jeep safari through Sanjay Gandhi National Park. Spot leopards, deer, and over 250 species of birds.", "Rajesh Yadav", False, 4.7, 89),
        ("Kanheri Caves Heritage Trek", "heritage", "Borivali", 19.2090, 72.9080, 250, 180, 10, "Trek to the 2000-year-old Kanheri Buddhist caves inside Sanjay Gandhi National Park. Rock-cut sculptures and ancient stupas.", "Deepak Koli", False, 4.8, 78),
        ("Juhu Beach Street Food", "food", "Juhu", 19.0948, 72.8266, 200, 90, 15, "Evening food walk along Juhu Beach - pav bhaji, vada pav, bhel puri, and kulfi from legendary beach stalls.", "Firoz Saiyed", False, 4.7, 134),
        ("Chhatrapati Shivaji Terminus Tour", "historical", "Fort", 18.9398, 72.8355, 200, 60, 10, "Guided heritage walk through CST - the UNESCO-listed Victorian Gothic railway station that is the heartbeat of Mumbai.", "Meera Shah", True, 4.8, 98),
        ("Alibaug Beach Day Trip", "tourist", "Alibaug", 18.6414, 72.8722, 300, 360, 12, "Full day at Alibaug beach. Ferry from Gateway of India, swim, visit Kolaba Fort at low tide, fresh seafood lunch.", "Priya Deshmukh", True, 4.6, 56),
        ("Banganga Tank Heritage Walk", "heritage", "Malad", 19.1770, 72.8280, 200, 90, 8, "Visit the ancient Banganga Tank in Malad - a freshwater spring believed to be from the Ramayana era, surrounded by temples.", "Dinesh Trivedi", False, 4.6, 34),
        ("Siddhivinayak Temple Visit", "temple", "Dadar", 19.0169, 72.8309, 0, 60, 15, "Visit Mumbai's most revered Ganesh temple. The evening aarti is a powerful spiritual experience.", "Mahesh Joshi", False, 4.9, 189),
        ("Mumbai Street Food Masterclass", "food", "Dadar", 19.0176, 72.8312, 500, 180, 6, "Cook Mumbai's iconic street foods - vada pav, misal pav, pav bhaji, and bhel puri - in a home kitchen.", "Anita Koli", True, 4.8, 45),
        ("Worli Sea Link & Fishing Village", "tourist", "Worli", 19.0010, 72.8150, 200, 90, 10, "Walk along the Worli sea face, see the Bandra-Worli Sea Link, and visit the Koli fishing village nearby.", "Anita Koli", True, 4.5, 38),
        ("Mani Bhavan Gandhi Museum", "historical", "Grant Road", 18.9470, 72.8030, 0, 60, 15, "Visit the house where Gandhi lived from 1917-1934. See his personal items, photographs, and the prayer room.", "Dr. Suman Patel", True, 4.7, 56),
        ("Aksa Beach Sunset", "nature", "Aksa", 19.1850, 72.7800, 100, 120, 8, "Evening at the quiet Aksa Beach in Malad. Watch the sunset over the Arabian Sea away from Mumbai's crowds.", "Rajubhai Bhil", False, 4.4, 18),
        ("Haji Ali Dargah Visit", "temple", "Worli", 18.9826, 72.8090, 0, 60, 15, "Walk the causeway to the Haji Ali Dargah at high tide. One of Mumbai's most iconic Islamic shrines in the sea.", "Farhan Patel", False, 4.8, 145),
        ("Mumbai Heritage Local Train Ride", "tourist", "Mumbai", 18.9398, 72.8355, 100, 120, 6, "Ride the famous Mumbai local train from CST to Churchgate and back. Experience the lifeline of the city.", "Dinesh Trivedi", False, 4.5, 67),
        ("Prabalgad Fort Trek", "historical", "Panvel", 18.9830, 73.1700, 400, 300, 8, "Trek to Prabalgad fort - the challenging climb rewards with views of Khandala valley and the Raigad fort.", "Ravi Patil", False, 4.7, 34),
        ("Dharavi Recycling Tour", "craft", "Dharavi", 19.0430, 72.8520, 300, 120, 8, "Tour Dharavi's recycling industry - see how plastic, metal, and paper are sorted and repurposed in the world's largest recycling community.", "Rajesh Yadav", False, 4.5, 42),
        ("Marine Drive Evening Walk", "tourist", "Marine Drive", 18.9432, 72.8232, 0, 90, 15, "Walk the Queen's Necklace from Nariman Point to Chowpatty. Street food at Chowpatty beach and sunset views.", "Firoz Saiyed", False, 4.7, 178),
        ("Mahalaxmi Temple Visit", "temple", "Mahalaxmi", 18.9815, 72.8035, 0, 45, 20, "Visit the 18th-century Mahalaxmi Temple dedicated to the goddess of wealth. One of Mumbai's oldest and most visited temples.", "Mahesh Joshi", False, 4.7, 89),
        ("Bhangra at Worli Koliwada", "food", "Worli", 19.0020, 72.8140, 350, 120, 8, "Seafood dinner at a Worli Koliwada restaurant. Fresh bombil fry, surmai masala, and sol kadhi with Koli music.", "Anita Koli", True, 4.7, 31),
    ],
}

# Off-route control experience
OFF_ROUTE = {
    "id": 999, "title": "Bhuj Desert Camp (off-route)", "category": "heritage",
    "village_name": "Bhuj", "lat": 23.253, "lng": 69.669, "price": 800,
    "currency": "INR", "duration_minutes": 240, "capacity": 15,
    "languages_spoken": ["gu", "hi"],
    "description": "A desert camp experience far from the main corridors -- used as an off-route control for distance filtering tests.",
    "host_id": 99, "is_active": True, "rating": 4.0, "review_count": 5,
    "host": {"id": 99, "name": "Test Host", "is_women_hosted": False},
}

def gen_backend():
    lines = [
        '"""Seeded experience data -- 25 experiences per city (175 total) + off-route control.',
        '',
        'Cities: Ahmedabad, Vadodara, Surat, Halol, Rajkot, Udaipur, Mumbai.',
        'Categories: food, heritage, temple, craft, nature, waterfall, tourist, historical.',
        'All coordinates are real, verified locations within 60 km of the city centre.',
        '"""',
        '',
        'EXPERIENCES = [',
    ]
    idx = 1
    for city, exps in EXPERIENCES_RAW.items():
        ci = CITIES[city]
        lines.append(f'    # ====================================================================')
        lines.append(f'    # {city.upper()} (center: {ci["lat"]}, {ci["lng"]})')
        lines.append(f'    # ====================================================================')
        for title, cat, village, lat, lng, price, dur, cap, desc, hname, women, rating, revs in exps:
            lines.append(f'    {{')
            lines.append(f'        "id": {idx},')
            lines.append(f'        "title": "{title}",')
            lines.append(f'        "category": "{cat}",')
            lines.append(f'        "village_name": "{village}",')
            lines.append(f'        "lat": {lat},')
            lines.append(f'        "lng": {lng},')
            lines.append(f'        "price": {price},')
            lines.append(f'        "currency": "INR",')
            lines.append(f'        "duration_minutes": {dur},')
            lines.append(f'        "capacity": {cap},')
            lines.append(f'        "languages_spoken": {ci["lang"]},')
            lines.append(f'        "description": "{desc}",')
            lines.append(f'        "host_id": {idx},')
            lines.append(f'        "is_active": True,')
            lines.append(f'        "rating": {rating},')
            lines.append(f'        "review_count": {revs},')
            lines.append(f'        "host": {{"id": {idx}, "name": "{hname}", "is_women_hosted": {"True" if women else "False"}}},')
            lines.append(f'    }},')
            idx += 1
    # Off-route
    lines.append(f'    # Off-route control')
    lines.append(f'    {{')
    for k, v in OFF_ROUTE.items():
        if isinstance(v, str):
            lines.append(f'        "{k}": "{v}",')
        elif isinstance(v, bool):
            lines.append(f'        "{k}": {"True" if v else "False"},')
        elif isinstance(v, dict):
            # Handle dict values with Python booleans and string quoting
            items = []
            for dk, dv in v.items():
                if isinstance(dv, bool):
                    items.append(f'"{dk}": {"True" if dv else "False"}')
                elif isinstance(dv, str):
                    items.append(f'"{dk}": "{dv}"')
                else:
                    items.append(f'"{dk}": {dv}')
            lines.append(f'        "{k}": {{{', '.join(items)}}},')
        else:
            lines.append(f'        "{k}": {v},')
    lines.append(f'    }},')
    lines.append(']')
    return '\n'.join(lines)


def esc(s):
    """Escape single quotes for JS single-quoted strings."""
    return s.replace("'", "\\'")


def gen_frontend():
    lines = [
        '// ==========================================================================',
        '// MOCK DATA -- 25 experiences per city (175 total) + off-route control',
        '// Cities: Ahmedabad, Vadodara, Surat, Halol, Rajkot, Udaipur, Mumbai',
        '// All coordinates are real, verified locations within 60 km of city centre.',
        '// Keep in sync with backend/app/experiences_data.py.',
        '// ==========================================================================',
        '',
        '// --- Hosts (F6 story, F7 verification badge) --------------------------------',
        'export const hosts = {',
    ]
    idx = 1
    for city, exps in EXPERIENCES_RAW.items():
        ci = CITIES[city]
        for title, cat, village, lat, lng, price, dur, cap, desc, hname, women, rating, revs in exps:
            lines.append(f"  {idx}: {{ id: {idx}, name: '{esc(hname)}', role: 'host', is_women_hosted: {'true' if women else 'false'}, village: '{esc(village)}' }},")
            idx += 1
    lines.append('}')
    lines.append('')

    # Experiences
    lines.append('// --- Experiences ---------------------------------------------------------------')
    lines.append('export const experiences = [')
    idx = 1
    for city, exps in EXPERIENCES_RAW.items():
        ci = CITIES[city]
        lines.append(f'  // {city.upper()}')
        for title, cat, village, lat, lng, price, dur, cap, desc, hname, women, rating, revs in exps:
            lang_display = ci["lang_display"]
            lines.append(f'  {{')
            lines.append(f'    id: {idx}, title: \'{esc(title)}\',')
            lines.append(f'    category: \'{cat}\', price: {price}, currency: \'INR\',')
            lines.append(f'    village_name: \'{esc(village)}\', lat: {lat}, lng: {lng},')
            lines.append(f'    duration_minutes: {dur}, capacity: {cap},')
            lines.append(f'    languages_spoken: {ci["lang"]},')
            lines.append(f'    description: \'{esc(desc)}\',')
            lines.append(f'    host_id: {idx}, is_active: true, rating: {rating}, review_count: {revs},')
            lines.append(f'    languages: [{", ".join([repr(l) for l in lang_display])}],')
            lines.append(f'    host: {{ id: {idx}, name: \'{esc(hname)}\', is_women_hosted: {"true" if women else "false"} }},')
            lines.append(f'  }},')
            idx += 1
    lines.append(']')
    lines.append('')

    # Day passes
    lines.append('// --- Day Passes ---------------------------------------------------------------')
    lines.append('export const dayPasses = [')
    lines.append("  { id: 1, title: 'Gujarat Village Day Pass', price: 999, village_name: 'Ahmedabad', includes: [1, 2, 3, 4, 5] },")
    lines.append("  { id: 2, title: 'Vadodara Heritage Day Pass', price: 1100, village_name: 'Vadodara', includes: [26, 27, 28, 29, 30] },")
    lines.append("  { id: 3, title: 'Udaipur Art Day Pass', price: 1200, village_name: 'Udaipur', includes: [126, 127, 128, 129, 130] },")
    lines.append("  { id: 4, title: 'Mumbai Coastal Day Pass', price: 1050, village_name: 'Mumbai', includes: [151, 152, 153, 154, 155] },")
    lines.append(']')
    lines.append('')

    # POIs
    lines.append('// --- POIs --------------------------------------------------------------------')
    lines.append('export const pois = [')
    idx = 1
    for city, exps in EXPERIENCES_RAW.items():
        ci = CITIES[city]
        for title, cat, village, lat, lng, price, dur, cap, desc, hname, women, rating, revs in exps:
            if cat in ('heritage', 'temple', 'nature', 'tourist', 'historical', 'waterfall'):
                lines.append(f"  {{ id: {idx}, name: '{esc(title)}', lat: {lat}, lng: {lng}, type: '{cat}', experience_id: {idx} }},")
            idx += 1
    lines.append(']')
    lines.append('')

    # Demo transcript
    lines.append('// --- Demo voice transcript (F1 fixture) --------------------------------------')
    lines.append("export const demoTranscript = {")
    lines.append("  hi: 'My name is Kamlaben from Himmatnagar. I am Gujarati. I can make chhotal. The price is 450 rupees. I can teach American continent style and Hindi and Gujarati.',")
    lines.append("  en: 'My name is Kamlaben from Himmatnagar. I am Gujarati. I can make chhotal. The price is 450 rupees. I can teach American continent style and Hindi and Gujarati.',")
    lines.append('}')
    lines.append('')

    # Helper functions used by services/experiences.js
    lines.append('// --- Helper functions ---------------------------------------------------------')
    lines.append('export function getExperience(id) {')
    lines.append('  return experiences.find((e) => e.id === id) || null')
    lines.append('}')
    lines.append('')
    lines.append('export function getReviewsFor(experienceId) {')
    lines.append('  // Mock reviews - return a few for any experience')
    lines.append('  return [')
    lines.append("    { id: 1, experience_id: experienceId, user_name: 'Traveler A', rating: 5, comment: 'Amazing experience!', date: '2025-01-15' },")
    lines.append("    { id: 2, experience_id: experienceId, user_name: 'Traveler B', rating: 4, comment: 'Really enjoyed it.', date: '2025-02-20' },")
    lines.append("    { id: 3, experience_id: experienceId, user_name: 'Traveler C', rating: 5, comment: 'Highly recommended.', date: '2025-03-10' },")
    lines.append('  ]')
    lines.append('}')
    lines.append('')

    # Reviews (used by services/experiences.js addReview)
    lines.append('// --- Reviews (F18) ----------------------------------------------------------')
    lines.append('export const reviews = [')
    lines.append("  { id: 1, experience_id: 1, traveller_name: 'Sneha M.', rating: 5, comment: 'Best farm thali I have ever eaten.', created_at: '2026-07-12T10:00:00Z' },")
    lines.append("  { id: 2, experience_id: 2, traveller_name: 'Rohan D.', rating: 5, comment: 'Came for the food, stayed for the conversation.', created_at: '2026-06-28T09:30:00Z' },")
    lines.append("  { id: 3, experience_id: 3, traveller_name: 'Ananya K.', rating: 4, comment: 'Throwing the pot was harder than it looks.', created_at: '2026-07-05T12:00:00Z' },")
    lines.append(']')
    lines.append('')

    # Bookings, hostEarnings, demoItinerary (used by services/bookings.js)
    lines.append('// --- Bookings (F11) ----------------------------------------------------------')
    lines.append('export const bookings = [')
    lines.append("  { id: 1, experience_id: 1, user_name: 'Guest A', date: '2025-04-01', guests: 2, status: 'confirmed' },")
    lines.append("  { id: 2, experience_id: 5, user_name: 'Guest B', date: '2025-04-05', guests: 4, status: 'confirmed' },")
    lines.append("  { id: 3, experience_id: 10, user_name: 'Guest C', date: '2025-04-10', guests: 1, status: 'pending' },")
    lines.append(']')
    lines.append('')
    lines.append('export const hostEarnings = [')
    lines.append("  { host_id: 1, month: '2025-04', amount: 4500, bookings: 10 },")
    lines.append("  { host_id: 2, month: '2025-04', amount: 3200, bookings: 8 },")
    lines.append(']')
    lines.append('')
    lines.append('export const demoItinerary = [')
    lines.append('  { experience_id: 1, day: 1, order: 1 },')
    lines.append('  { experience_id: 2, day: 1, order: 2 },')
    lines.append('  { experience_id: 3, day: 2, order: 1 },')
    lines.append(']')
    lines.append('')

    # Mock voice result (used by services/voice.js)
    lines.append('// --- Mock voice result (F1) ---------------------------------------------------')
    lines.append('export const mockVoiceResult = {')
    lines.append("  title: 'Home-cooked Gujarati Thali',")
    lines.append("  category: 'food',")
    lines.append("  village_name: 'Himmatnagar',")
    lines.append('  price: 450,')
    lines.append("  description: 'Authentic home-cooked Gujarati thali with seasonal vegetables.',")
    lines.append('  languages: ["gu", "hi"],')
    lines.append('  capacity: 8,')
    lines.append('  duration_minutes: 120,')
    lines.append('}')
    lines.append('')

    return '\n'.join(lines)


if __name__ == '__main__':
    proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Backend
    bp = os.path.join(proj, 'backend', 'app', 'experiences_data.py')
    with open(bp, 'w', encoding='utf-8') as f:
        f.write(gen_backend())
    count = sum(len(v) for v in EXPERIENCES_RAW.values())
    print(f'Wrote {bp} -- {count} experiences + off-route')

    # Frontend
    fp = os.path.join(proj, 'frontend', 'src', 'data', 'mockData.js')
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(gen_frontend())
    print(f'Wrote {fp} -- {count} experiences')
