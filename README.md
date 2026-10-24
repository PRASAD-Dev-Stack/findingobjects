# Finders Keepers

1. PROJECT OVERVIEW

Build a fully functional, production-grade mobile game called "ObjectFinder Pro" — a Hidden Object / Spot-the-Difference style puzzle game with:

999 handcrafted puzzle levels with a smooth, scientifically-tuned difficulty curve

Buttery-smooth 60fps+ animations and premium UI/UX

Real-time Multiplayer mode (1v1, 1v1v1, 1v1v1v1 — up to 4 players) with unique Player IDs, invite/accept flow, and a turn-based 20-second countdown spotlight system

Cross-device responsiveness (phones, tablets, foldables, all screen densities)

High performance on low-end and high-end Android devices alike

Play Store submission-ready build (signed APK/AAB, privacy policy, permissions, icons, screenshots)

2. RECOMMENDED TECH STACK

Frontend / Game Client:

Flutter (Dart) — single codebase for Android + iOS, excellent for custom animations, GPU-accelerated rendering via Skia/Impeller, great for building pixel-perfect responsive UI at 60-120fps

Alternative: React Native + Skia + Reanimated 3 (if team prefers JS ecosystem)

Use flutter_animate, Rive, or Lottie for micro-interactions and character/object animations

flame game engine (Flutter) for object hit-detection, sprite layering, and particle effects (confetti, sparkles, highlight rings)

Backend (for Multiplayer, Auth, Leaderboards, Sync):

Node.js + TypeScript + Express for REST API

Socket.IO / WebSockets for real-time multiplayer sync (turn timer, object-found events, player state)

Firebase Authentication (or custom JWT) for unique Player ID generation & login

Firebase Firestore or PostgreSQL (with Prisma ORM) for user profiles, level progress, friend invites, leaderboards

Redis for real-time game-room state, matchmaking sessions, and countdown timer synchronization (low-latency, ephemeral state)

Firebase Cloud Messaging (FCM) for push notifications (invite received, your turn, friend online)

Hosting/Infra:

Backend on Render/Railway/Google Cloud Run (auto-scaling containers)

CDN (Cloudflare) for serving puzzle image assets fast globally

Firebase Storage / S3 for hidden-object scene images and audio assets

Build & Deployment:

Gradle-based Android build producing a signed .aab (Play Store) and .apk (sideload/testing)

Fastlane for automated screenshot generation, versioning, and Play Store metadata upload

ProGuard/R8 enabled for code shrinking & obfuscation → smaller APK size, faster load

3. CORE GAMEPLAY MECHANICS

3.1 Single Player Mode

Player is shown a richly illustrated scene (kitchen, forest, spaceship, city street, attic, underwater reef, etc.) containing a checklist of hidden objects

Player taps/clicks the object where it visually appears

Correct find → satisfying animation (glow burst, checkmark pop, sound chime, haptic feedback) + object added to "found" list with strikethrough

Wrong tap → subtle shake/negative feedback, small time or hint-point penalty (no hard fail, keeps flow going)

Timer per level (optional toggle: Relaxed Mode = no timer, Challenge Mode = timed with star rating)

Hint system: limited free hints per day + rewarded-ad or in-app-purchase hints (circle briefly highlights the object's zone)

Star rating per level (1–3 stars) based on time taken + hints used

Progress map/world screen showing all 100 levels as a winding path (like Candy Crush style) with lock/unlock progression

3.2 Difficulty Progression Across 100 Levels (Design Spec)

Structure levels into 10 Chapters of 10 levels each, each themed differently, with difficulty compounding both within a chapter and across chapters:

ChapterLevelsTheme ExampleObjects/LevelTime LimitNew Mechanic Introduced11–10Cozy House5–790sBasic tap-to-find211–20City Street7–985sSmall/partially-hidden objects321–30Enchanted Forest9–1180sCamouflaged objects (color-matched to background)431–40Underwater Reef11–1375sMoving/animated objects (fish swim, need to time the tap)541–50Haunted Mansion13–1570sDecoy objects (look similar, only one is correct)651–60Space Station15–1765sRotating/parallax scene (player must scroll/pan to find)761–70Ancient Temple17–1960sSilhouette-only object clues (no direct image, just shape/riddle)871–80Futuristic City19–2155sMulti-layered scenes (foreground/background depth toggle)981–90Carnival Night21–2350sDistraction elements (moving crowds, flashing lights)1091–100Master Vault (Finale)23–2545sCombination of ALL mechanics + bonus hidden "golden object"

Each level's object count, time limit, and visual complexity should scale via a difficulty algorithm (not hardcoded), so designers can regenerate/rebalance later: difficulty_score = (object_count * 1.0) + (camouflage_factor * 1.5) + (decoy_count * 2) + (movement_factor * 1.8) - (time_limit_seconds * 0.1)

Every 10th level = Boss Level with a unique full-screen animated scene and special reward (badge/skin/coins)

3.3 Puzzle Content Requirements

All scene artwork should be original, high-resolution (at least 2048×1536), optimized (WebP format) for fast load and small APK size

Dynamic object hitboxes stored as JSON polygon/coordinate data per scene (not hardcoded pixel guesses) so scenes scale correctly across all screen sizes/aspect ratios

Scene data structure (per level), e.g.:

json

{
  "levelId": 42,
  "chapter": 5,
  "sceneImage": "haunted_mansion_42.webp",
  "timeLimit": 70,
  "objects": [
    { "id": "obj1", "name": "Candle", "polygon": [[120,340],[160,340],[160,390],[120,390]] },
    { "id": "obj2", "name": "Key", "polygon": [[800,220],[840,220],[840,260],[800,260]] }
  ],
  "decoys": ["obj_fake_key"],
  "difficultyScore": 41.5
}

4. MULTIPLAYER MODE — DETAILED SPECIFICATION

4.1 Unique Player ID System

On first launch, every user is auto-assigned a unique Player ID (e.g., OF-7X9K2M) — short, human-shareable alphanumeric code, generated server-side and guaranteed unique

Player ID is visible on the Profile screen with a "Copy" and "Share" button (share via WhatsApp/SMS/any app)

Players can also set a display name and avatar linked to their ID

4.2 Starting a Multiplayer Match — Flow

Player taps "Multiplayer" from the main menu

Player selects match size: Play with 1 Friend (2 players total), Play with 2 Friends (3 players total), or Play with 3 Friends (4 players total)

Based on selection, the app dynamically renders N input fields for Friend Player ID(s):

1 friend → 1 input field

2 friends → 2 input fields

3 friends → 3 input fields

Host enters each friend's unique Player ID (with live validation — checks ID exists via API, shows friend's name/avatar preview once valid)

Host taps "Send Invite(s)"

Each invited Player ID receives a real-time push notification + in-app popup: "[Host Name] invited you to play ObjectFinder! [Accept] [Decline]"

Invite has a 60-second expiry window; host sees live status per invitee: Pending... / Accepted ✅ / Declined ❌

Once all invitees accept, the match auto-starts for everyone simultaneously (all players' screens transition into the Game Room together with a 3-2-1 countdown intro)

If any invitee declines or the invite times out, host is notified and can re-invite a different Player ID or start with fewer players

4.3 In-Match Turn-Based Gameplay ("Spotlight Countdown System")

All players see the same puzzle scene simultaneously and the same shared object checklist

Only one player is "active" at a time (has the "Spotlight") — clearly indicated with:

A glowing colored border around that player's avatar

A large circular 20-second countdown ring animating clockwise around their avatar/turn indicator

A banner: "[Player Name]'s Turn — Find an object!"

Active player: can tap objects in the scene to find them

Non-active players: scene is fully visible to them (they can watch and strategize/plan ahead) but their taps are disabled/ignored on the scene — UI clearly shows a "🔒 Waiting for your turn" overlay state on their controls (not blocking their view)

When the 20-second countdown reaches zero (or the active player successfully finds an object, ending their turn early — configurable rule), turn automatically passes to the next player in rotation order with a smooth transition animation (spotlight glides from current avatar to next avatar)

Turn order rotates in the order invites were accepted (or randomized at match start — configurable)

Scoring: each correct find = points (bonus for speed); each object found is locked for all players (can't be found twice) and visually marked as found on everyone's screen instantly via WebSocket sync

If time runs out on a player's turn with no find, 0 points that turn, and it passes to next player — no penalty beyond lost opportunity

Match ends when: all objects are found, OR a global match timer expires (e.g., 5 minutes) — whichever comes first

Winner = player with the most objects found / highest score; podium screen with confetti animation, XP/coin rewards, and "Rematch" / "Share Result" buttons

Real-time sync must use WebSocket events for: turn_start, turn_timer_tick, object_found, turn_end, match_end, player_disconnected (with graceful reconnect/resume-state handling if a player loses connection mid-match)

4.4 Multiplayer Edge Cases to Handle

Player disconnects mid-match → pause their turn slot, allow 30s reconnect grace period, else auto-skip

Invite sent to invalid/non-existent Player ID → immediate inline error, no wasted request

Player already in another active match → show "Busy" status, block duplicate invite

Duplicate Player ID entries in the same invite batch → validation blocks it

Host cancels invites before all accept → notify pending invitees invite was cancelled

5. UI/UX & ANIMATION REQUIREMENTS

Design system: soft rounded cards, vibrant gradient backgrounds per chapter theme, consistent 8px spacing grid, accessible color contrast (WCAG AA minimum)

Micro-animations everywhere: button press scale/bounce, screen transitions via shared-element/hero animation, level-unlock "pop and shine" effect, star-rating cascade animation, confetti burst on level complete

Object-found effect: radial glow + particle burst + satisfying "pop" sound + haptic tap (use HapticFeedback.lightImpact)

Loading states: skeleton loaders / shimmer effects — never a blank white screen

Responsive layout: use flexible layout system (Flutter's LayoutBuilder/MediaQuery, or RN's react-native-responsive-screen) so scenes and UI scale correctly across phone/tablet/foldable aspect ratios without distortion — puzzle scene should use BoxFit.contain-like scaling logic with coordinate-normalized hitboxes (store object polygons as % of image width/height, not raw pixels)

Dark mode support

Accessibility: scalable font sizes, colorblind-friendly object highlighting option, screen-reader labels

Sound design: ambient background music per chapter theme (toggleable), SFX for taps/finds/errors/turn-change, all preloaded/cached to avoid lag

6. PERFORMANCE REQUIREMENTS (Critical — "Too Fast on Any Device")

Target 60fps minimum, 120fps on capable devices, using GPU-accelerated rendering (Flutter Impeller / Skia)

Cold start time under 2 seconds — lazy-load chapters/levels, only preload current + next level's assets

Image assets served as compressed WebP, multiple resolution buckets (mdpi/xhdpi/xxhdpi) selected automatically per device

Object hit-detection must be instant (<16ms) — use spatial indexing (e.g., simple polygon-in-point check against pre-loaded coordinate data, no heavy per-frame recalculation)

Multiplayer real-time actions (object found, turn change) must sync with <200ms latency — use WebSocket over TCP with binary/compact JSON payloads, not polling

Memory management: dispose of off-screen level assets, use image caching with LRU eviction (cached_network_image or Flutter's built-in image cache tuning)

APK size optimization: split APKs by ABI (arm64-v8a, armeabi-v7a) and use Android App Bundle (.aab) for Play Store so users download only what their device needs — target under 80MB base size

Offline-first for single-player: all 100 levels' core data bundled or downloaded once and cached locally (SQLite/Hive/Isar) so single-player works with no internet; only multiplayer requires connectivity

Battery/thermal efficiency: throttle non-essential animations when device reports low battery/thermal throttling (Android PowerManager checks)

7. ADDITIONAL FEATURES TO INCLUDE (Recommended Enhancements)

Daily Challenge: a rotating special puzzle every 24 hours for bonus coins, separate from the 100-level campaign

Friends List: add friends by Player ID once, then quick-invite to multiplayer without re-typing ID each time

Leaderboards: global + friends-only leaderboards for total stars, fastest completion times, multiplayer win rate

Achievements/Badges: e.g., "Eagle Eye" (find object in under 2s), "No Hints Needed", "Multiplayer Champion"

Coin/Gem economy: earn coins from levels, spend on hints/skins/scene themes; optional rewarded video ads for bonus coins (non-intrusive, opt-in only)

Cosmetic customization: unlockable avatar frames, cursor/pointer skins, victory animations

Push notifications: "Your friend invited you to play!", "New daily challenge available", "Your turn in multiplayer match!"

Onboarding tutorial: interactive first-level walkthrough teaching tap-to-find + hint system

Analytics integration: Firebase Analytics / Amplitude to track level drop-off, difficulty tuning feedback loop

In-app purchases: remove ads, hint bundles, coin packs, "unlock all chapters" bundle

Localization-ready: text externalized into resource files for easy translation (start with English, structure for easy addition of Hindi, Spanish, etc.)

8. PLAY STORE READINESS CHECKLIST

Signed .aab build with proper versionCode/versionName strategy

App icon (adaptive icon: foreground + background layers), feature graphic, min. 4 screenshots per supported device type

Privacy Policy page (required — hosted URL) covering data collection (Player ID, analytics, ads)

Correct permissions declared only for what's used (Internet, Push Notifications, Vibration) — no unnecessary permissions

Content rating questionnaire completed (likely "Everyone" rating)

Target API level compliant with current Play Store requirements (latest required targetSdkVersion)

Crash reporting integrated (Firebase Crashlytics) before launch

Thoroughly tested on low-end device (2GB RAM) and high-end device profiles via Firebase Test Lab

9. DELIVERABLES EXPECTED FROM GENERATION

Complete Flutter (or React Native) project source code, organized in clean architecture (feature-based folder structure: /features/single_player, /features/multiplayer, /features/profile, /core/network, /core/theme)

Backend source code (Node.js/Express + Socket.IO + database schema/migrations)

Sample puzzle scene assets + JSON data for at least 10 fully playable levels (structure ready to scale to 100)

Signed, installable APK file for testing + AAB for Play Store submission

README with full setup, build, and deployment instructions

Basic admin/CMS reference (even a simple JSON-editing guide) for adding new levels without code changes

Instruction to the generation tool: Build this as a real, runnable, installable codebase — not a mockup or wireframe. Prioritize smooth performance and multiplayer real-time reliability above all else, while keeping the visual polish and animation quality at a premium/App-of-the-Day level. make sure to dont use static code in files, fetch the data from the backend, You are the Senior Architecture, senior Developer and Senior Designer. create best of day APK. mobile Apk. important note= make sure to use this UI Combination = Claymorphism + Cartoon , and cartoon should be 2D

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/845a5817-01bd-499d-a8f8-5d8804bbb5e0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
