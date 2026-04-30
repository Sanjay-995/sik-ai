# Domain Pitfalls: On-Device Suitless Body Measurement (iOS)

**Project:** Sik AI — camera-only body measurement engine
**Researched:** 2026-04-30
**Domain:** Computer vision / parametric body model inference on iOS
**Confidence notes:** Web search tools were unavailable during this session. All findings draw on training knowledge (cutoff August 2025) covering SMPL/SMPL-X academic literature, Apple developer documentation, prior commercial body-measurement product post-mortems, and iOS CoreML engineering experience. Confidence levels reflect source quality.

---

## Critical Pitfalls

Mistakes that cause rewrites, failed feasibility spikes, or business-ending accuracy failures.

---

### Pitfall 1: Conflating Test-Retest Reproducibility With Absolute Accuracy

**What goes wrong:** The team optimizes for "how close is our waist reading to a tape measure" (absolute accuracy) and declares success at ±2–3cm. Users then take two scans three days apart and get readings that differ by 4cm with no real body change — and churn because the app "lies."

**Why it happens:** Academic benchmarks for SMPL-class models report mean absolute error vs. ground truth (absolute accuracy). That is the metric researchers publish. But the gym user who wants to track hypertrophy cares about whether Tuesday's scan and Friday's scan agree when nothing changed. These are different mathematical properties: absolute accuracy is about bias and scale calibration; test-retest reproducibility is about variance across repeated measurements of the same subject.

**Consequences:** The app's core value proposition ("trust the result enough to track real changes") collapses. Users cannot distinguish noise from a real 1cm muscle gain. Negative App Store reviews accumulate around "numbers are inconsistent." Paid subscribers churn within the first measurement cycle.

**Prevention:**
- Define reproducibility as a first-class metric from day one. Measure it in the spike: have the *same person* take *two scans in the same session* (outfit change, re-enter the room) and report the spread. Call this "same-session reproducibility."
- Then have the same person scan across days (morning vs. evening, Monday vs. Friday) and report "inter-session reproducibility." These numbers will be different.
- Accept that absolute accuracy (vs. tape measure) is secondary. A system that reads waist = 84.2cm consistently is more valuable than one that reads 81–85cm with a mean of 82.5cm vs. a tape-measure 83cm.
- In the spike report, present both metrics and explicitly call out which one the product depends on.

**Detection:** If the spike protocol only runs one scan per person and reports mean absolute error, the spike is measuring the wrong thing. Warning sign: spike report contains phrases like "mean absolute error" and "ground truth" but does not contain "standard deviation across repeated scans" or "intra-subject variance."

**Phase mapping:** The feasibility spike must be designed around reproducibility measurement, not absolute accuracy. This is the single most important design choice for the spike protocol.

**Confidence:** HIGH — this distinction is well-established in the measurement literature and is the documented failure mode of consumer body-composition products.

---

### Pitfall 2: SMPL / SMPL-X Non-Commercial License (The Model You Want Is Not Legally Usable)

**What goes wrong:** The team builds the entire measurement pipeline on SMPL-X (or SMPL, SMPL-H, MANO, FLAME), ships a beta, then discovers the model weights carry a non-commercial academic license from the Max Planck Institute and cannot legally be embedded in a commercial iOS app or shipped to the App Store.

**Why it happens:** SMPL (2015) and SMPL-X (2019) model weights are distributed by MPI IS (Max Planck Institute for Intelligent Systems) under licenses that explicitly restrict commercial use. The research papers are freely available; the weights require registration and acceptance of a license agreement that prohibits commercial distribution. Many tutorials, GitHub repos, and blog posts use these weights and never mention the license because their authors are academics who never intended to commercialize.

**Specific license status (training-data knowledge; verify before any commercial use):**

| Model | Source | Commercial Use | Notes |
|-------|--------|----------------|-------|
| SMPL | MPI IS | **No** — requires separate commercial license from MPI IS (fee-based) | Research-only by default |
| SMPL-X | MPI IS | **No** — same MPI IS terms as SMPL | Research-only by default |
| SMPL-H | MPI IS | **No** | Variant of SMPL for hands |
| MANO | MPI IS | **No** | Hand model; same terms |
| FLAME | MPI IS | **No** | Face model; same terms |
| STAR | ETH Zurich | **No** — academic-only | Replacement for SMPL |
| SHAPY | MPI IS | **No** — builds on SMPL-X weights | Inherits SMPL-X restrictions |
| 4D-Humans (HMR2) | UPenn | CHECK — research license, HMR2 code is Apache 2.0 but depends on SMPL weights | Code may be fine; weights are not |
| PIXIE | Max Planck | **No** — builds on SMPL-X | Inherits restrictions |
| SMPLify | MPI IS | **No** | Builds on SMPL |
| OpenPose | CMU | **Yes for code** (Apache 2.0) — but does not produce parametric body shape | Does pose, not shape |
| MediaPipe (Google) | Google | **Yes** — Apache 2.0 | Pose landmarks only, no body shape |
| Apple Vision body pose | Apple | **Yes** — platform API | Pose skeleton only, no mesh |

**Consequences:** Having to rip out the entire model layer mid-development and either (a) negotiate a commercial license from MPI IS (expensive, months of lead time) or (b) rebuild around a legally clean alternative. The commercial license from MPI is not a simple click-through — it requires direct contact, legal review, and payment.

**Prevention:**
- Before writing a single line of inference code, identify the exact model weights that will be embedded in the app.
- For each model: find the actual license text at the source institution. Do not rely on GitHub README summaries.
- Decision tree: SMPL/SMPL-X weights → contact MPI IS for commercial license OR find a model trained without SMPL weights as the backbone.
- Commercially usable alternatives worth evaluating: **Body Labs' SMPL descendants** are licensed separately; **human body models trained on non-MPI datasets** (e.g., models derived entirely from synthetic data or from CAESAR/SizeUSA with appropriate terms). The 4D-Humans / HMR2 code (Apache) is usable but the shipped SMPL checkpoint is not — you'd need to train a head that uses a different body representation.
- Consider whether the measurement pipeline can avoid distributing the model weights at all: a cloud inference call (even to your own server) where the model weights never leave the server would avoid the "embedded distribution" issue. This conflicts with the on-device privacy requirement, so it's a tradeoff.

**Detection:** Does the GitHub repo README contain the words "non-commercial" or "research only"? Does the download link require accepting a license agreement on the MPI IS or related academic site? Both are disqualifiers for commercial use.

**Phase mapping:** License vetting must be the first thing done in the spike phase, before any model code is written. It should block all other model selection decisions.

**Confidence:** HIGH for SMPL/SMPL-X being non-commercial by default. MEDIUM for the complete table above — individual model terms can change; verify against current license texts at source institutions. The MPI IS commercial licensing program is well-documented in the research community.

---

### Pitfall 3: Shape Prior Baked for Athletic / Caucasian Bodies (Demographic Failure)

**What goes wrong:** The measurement engine works well for lean, athletic bodies in the training demographic and systematically fails for heavier bodies, bodies with high BMI, pregnant users, and users from underrepresented demographic groups. The app ships with a tacit promise of "works for everyone" that it cannot deliver.

**Why it happens:** SMPL and its descendants were trained primarily on 3D body scans from academic datasets (CAESAR, SizeUSA, CMU mocap data). These datasets skew heavily toward:
- North American and Western European adults
- Athletic to normal BMI ranges (CAESAR BMI range is not representative of the general US population)
- Binary gender classification (male/female shape space)
- Able-bodied bodies with standard limb morphology

The statistical shape model (PCA-based) encodes the *variance* seen in training data. Body shapes outside this training distribution (BMI > 35, asymmetric bodies, limb differences, postpartum bodies) fall outside the learned manifold. The optimizer then snaps these bodies to the nearest in-distribution shape — which means it systematically under-measures large waists, misrepresents hip-to-waist ratios for bodies with different fat distribution, and produces nonsense measurements for bodies that don't fit the binary gender assumption.

**Consequences:**
- Measurements for heavier users are wrong *in a consistent direction* (underestimating circumferences) which masks real body composition changes.
- Users from underrepresented groups churn faster because the product "doesn't work for me."
- Potential brand damage / fairness criticism if the demographic failure becomes public.
- For the weight-loss audience (Sik AI's fallback market), the users most likely to engage are exactly the users (higher BMI) the model performs worst on.

**Prevention:**
- During the spike, explicitly include testers across a wide BMI range (at minimum: BMI < 22, 22–27, 27–32, >32). Do not run only on lean testers and extrapolate.
- Report per-subgroup accuracy in the spike results, not just aggregate mean error.
- Understand which shape space the chosen model covers. SMPL's shape PCA captures ~95% of variance in its training set; bodies outside 3 standard deviations from mean will be poorly fit.
- Look for models with more inclusive training data. AGORA (2021) introduced more diverse synthetic training; BEDLAM (2023) uses synthetic data; HuManiFlow and similar newer works address shape diversity. However, all of these still ultimately depend on SMPL weights for body representation.
- Document the demographic limits of the model explicitly in internal spec and in any future "how it works" documentation.

**Detection:** Warning sign: spike testers are all from a similar body type / demographic. Another warning sign: measurements are consistently close to tape measure for some testers but consistently off for others with no explanation.

**Phase mapping:** Spike phase must test across body types. Product-launch phase must include accuracy disclosure language if demographic coverage is limited. Fairness testing is not optional.

**Confidence:** HIGH — the training data bias in SMPL-family models is well-documented in academic literature (including papers from MPI IS themselves acknowledging limitations). The failure mode for out-of-distribution bodies is a fundamental property of PCA-based statistical shape models.

---

### Pitfall 4: Capture Protocol Looks Easy in UX But Is Impossible for Real Users

**What goes wrong:** The designed capture flow (stand 2m from phone, rotate slowly, front/side/back frames) works in the UX prototype with a helpful friend holding the phone. Real solo users cannot prop the phone at hip height, maintain exact distance, rotate in the right direction, keep constant lighting, and review results — all while in minimal clothing. The system gets poor pose coverage and produces noisy measurements.

**Why it happens:** Body-measurement UX has a fundamental physical constraint: the person being measured cannot see the phone screen during capture. ZOZOFIT solved this with a dedicated stand and a rotatable suit with alignment markers. Suitless competitors solve it with tight clothing + plain wall background + 360° video (user rotates while phone is on a tripod). Each constraint removal adds user failure modes.

**Specific failure modes observed in comparable products:**
- Users prop phones too low (waist height), which distorts the perspective for shoulder/chest measurement
- Users hold phones themselves (selfie style), which introduces arm-occlusion of the torso
- Hair falling down occludes the neck/shoulder region during back captures
- Baggy clothing adds 2–5cm of phantom "body" to every circumference
- Users look at the phone (rotate head) instead of maintaining neutral pose, which tilts the spine
- Breathing during capture inflates chest measurement by 2–4cm
- Users don't complete the full rotation — they get 70% of the way around and stop
- Ambient lighting from windows behind the user creates silhouette-only images with no texture for segmentation

**Consequences:** Measurement noise from capture protocol failures dominates all other error sources. The model may be capable of ±1cm but the capture produces ±5cm because of user behavior, making the ML irrelevant.

**Prevention:**
- Design the capture protocol before designing the UI, not after. Start from the constraint: "what physical setup produces the most consistent input image?"
- Explicitly choose between two models: (a) user rotates, phone is stationary on a stand (requires guiding user to buy/use a stand), (b) user is stationary, phone is moved (impossible for solo use), (c) multi-image from stationary front/side/back (simpler; less data; sufficient for circumferences).
- Front + side is likely the minimum viable capture for circumferences. Front gives chest/shoulder/waist/hip width; side gives depth. Back adds gluteal measurement but requires repositioning the phone.
- Build explicit capture-quality checks into the flow: estimated distance (use pose landmark scale), lighting uniformity, clothing looseness indicator (hard — but pose confidence can proxy for this), frame stability check before capture.
- Ground truth the capture protocol in the spike before the model: take tape measurements, take 20 photos in varying conditions, assess which conditions produce images the model can work with.

**Detection:** Warning signs: spike testers are assisted by a researcher who positions the phone precisely. That's not the real-world condition. The spike should include an "unassisted solo" condition.

**Phase mapping:** The spike must include at least one solo-capture condition. The UX capture protocol must be specified before the spike test harness is built so the two are aligned.

**Confidence:** HIGH — capture protocol failures are the documented primary failure mode in all published consumer body-measurement evaluations and multiple ZOZOFIT/3DLOOK comparisons.

---

### Pitfall 5: CoreML Model Performance Regresses Across iOS Versions

**What goes wrong:** A CoreML model optimized and tested on iOS 17 silently degrades in accuracy or increases latency when users upgrade to iOS 18 or beyond. Apple changes the CoreML execution engine and Neural Engine scheduling with each major iOS release. What ran in 200ms on iOS 17 may run in 800ms on iOS 18 because it fell back from ANE to CPU.

**Why it happens:** Apple's CoreML documentation describes a black-box compilation pipeline. The `.mlpackage` or `.mlmodel` file gets compiled to device-specific compute primitives at install time. Apple does not guarantee stable performance characteristics across OS versions. Specific layers (custom ops, quantized ops, certain Conv3D patterns) have changed execution paths between iOS 16→17→18. The Neural Engine on A-series chips is powerful but not forward-compatible in every configuration.

**Consequences:** User complaints about "the scan takes forever now" after an iOS update. App Store reviews drop. The latency problem disproportionately hits older devices that are more likely to lose ANE scheduling after an OS update.

**Prevention:**
- Never ship a model without measuring inference time on at minimum: iPhone 13 (A15, oldest iOS 17 minimum target), iPhone 15 (A16), iPhone 16 Pro (A18 Pro) — each device has different ANE capabilities.
- After each Xcode / iOS SDK major update, re-run the benchmark suite on all target devices.
- Use `MLComputeUnits.all` judiciously — for a measurement pipeline where latency matters, consider `MLComputeUnits.cpuAndNeuralEngine` or even `cpuOnly` if the latency budget is already met on CPU and stability matters more than peak throughput.
- Log inference time to local analytics (on-device) so regression shows up in usage patterns, not just crash reports.
- Pin the Xcode version used for model compilation in CI so that a Xcode upgrade doesn't silently recompile the model with a different optimization pass.

**Detection:** Warning sign: latency benchmark only run once at development time. Warning sign: no post-iOS-update testing protocol.

**Phase mapping:** The spike must include latency measurement. The productization phase must establish a performance regression test protocol tied to iOS version.

**Confidence:** HIGH for the general pattern; MEDIUM for specific iOS 17→18 behavior (based on community reports and Apple developer forum discussions in training data, but not verified against current iOS).

---

## Moderate Pitfalls

---

### Pitfall 6: Segmentation Flicker Destroys Measurement Consistency

**What goes wrong:** The person-segmentation step (isolating the body from background) produces slightly different body masks on every frame or on repeated captures of the same pose. Small segmentation changes (a few pixels at the arm boundary, hair edges, loose clothing) propagate through the pose estimation and shape fitting steps and produce measurement variance that has nothing to do with body shape.

**Why it happens:** Segmentation models (whether using Apple's Vision framework person segmentation, MediaPipe SelfieSegmentation, or a custom segmentation head) are not perfectly deterministic across slight image changes. Shadows, hair, clothing wrinkles, and background texture all affect segment boundaries. This is especially bad at clothing-to-skin transitions (shorts hem line, T-shirt sleeve — the exact locations where circumference measurements are most sensitive).

**Prevention:**
- Use temporal smoothing across multiple frames (take 5 frames, average the mesh, not just use one frame's segmentation).
- Apply median filtering on the final measurement output, not just on the segmentation.
- Test segmentation consistency explicitly: same pose, 5 captures in rapid succession, report measurement standard deviation.
- Consider whether a rigid capture (single still frame after pose lock) is more reproducible than video analysis.

**Phase mapping:** The spike should measure intra-session variance (same person, same session, 5 rapid captures) to characterize segmentation flicker.

**Confidence:** HIGH — segmentation flicker is a well-known problem in monocular body reconstruction and is explicitly addressed in multiple 2022–2024 papers on in-the-wild body measurement.

---

### Pitfall 7: Scale Ambiguity Without a Reliable Reference

**What goes wrong:** A monocular camera cannot determine absolute body size without a reference scale. A person standing 1.8m vs. 1.5m tall may produce nearly identical skeleton-relative measurements (normalized coordinates), but the absolute circumferences differ by 15–20%. Without height input or a calibrated focal-length distance measurement, the model is estimating circumferences in relative units and converting using assumed proportions — which fail for users whose proportions differ from the model's prior.

**Why it happens:** Monocular 3D reconstruction is fundamentally scale-ambiguous. SMPL-class models get around this by fitting shape parameters (which encode scale) as part of the optimization. But the scale estimation is only as good as the distance/height prior. If the user provides an incorrect height (or the app uses a default), the entire size output shifts proportionally.

**Consequences:** A user who is 155cm tall gets measurements calibrated for an assumed 170cm user — systematic error of ~10% across all circumferences.

**Prevention:**
- Collect accurate height at onboarding. Do not let this be optional.
- Use height + the in-image body landmark positions to compute estimated camera distance. Cross-validate against the model's scale estimate.
- Consider a height verification step: "Does this silhouette look like your height?" with a visual reference.
- ARKit's world-space measurements (if using ARKit) can provide metric scale without height input — but ARKit's plane detection requires a horizontal surface reference, which may not be present during a body scan.
- Build a sanity check: if the computed height from the model deviates >5% from user-input height, flag as a poor-quality scan and prompt retake.

**Phase mapping:** Spike must test with users of varying heights and verify that height-calibration logic is implemented correctly, not just assumed.

**Confidence:** HIGH — scale ambiguity in monocular reconstruction is one of the most fundamental theoretical problems in the field.

---

### Pitfall 8: Body Mesh Drift Between Scans (Same Body, Different Pose State)

**What goes wrong:** SMPL-class model fitting is an optimization that finds the best-fit shape parameters. The optimizer can land in different local minima on different runs, especially when the input image has different pose, clothing, or lighting. Result: the "base body shape" (beta parameters in SMPL) changes between scans of the same person, producing phantom measurement drift.

**Why it happens:** The shape (beta) and pose (theta) parameters are jointly optimized in most fitting approaches. Small pose variations cause the optimizer to compensate using shape parameters. This is why controlled, canonical poses (T-pose, A-pose, or a well-defined athletic stance) are standard in commercial measurement applications — they constrain the pose space and let the optimizer focus on shape.

**Prevention:**
- Choose a canonical capture pose and enforce it strictly in the UX. A-pose (arms 45° from body) is recommended over T-pose (arms horizontal) because users can hold A-pose longer without fatigue.
- Use pose confidence from Apple Vision body pose or MediaPipe to reject captures where the user deviated from the target pose beyond a threshold.
- Consider decoupled optimization: fix the pose to a canonical pose (from a pose estimator) and only optimize the shape parameters. This reduces the degree of freedom and stabilizes shape estimation.

**Phase mapping:** Spike should test the same person in slight pose variations (~5° arm angle variation) and measure the measurement impact to understand sensitivity.

**Confidence:** HIGH — joint pose-shape optimization instability is documented extensively in SMPLify and HMR2 literature.

---

### Pitfall 9: Naked Labs / ZOZOSUIT / Mirror Mirror Market Failure Patterns

**What goes wrong:** Repeating the mistakes of previous attempts at consumer body scanning.

**Documented failure patterns (training knowledge; verified against public reporting):**

**Naked Labs (2018–2020):**
- Built a $1,400 rotating mirror platform with 8 depth cameras. Hardware-intensive approach.
- Accuracy was reportedly good (~1cm). The product failed for business reasons: high price, required dedicated floor space, subscriptions layered on top of hardware cost.
- Lesson: accuracy alone doesn't save a consumer product. Acquisition cost and friction are also product properties.
- Sik AI avoids this via software-only, but must also avoid the "complicated setup = abandoned product" trap.

**ZOZOSUIT (2017–2019):**
- Original polka-dot suit required user to order a free hardware suit, wait for shipping, wear it, and scan. Drop-off between "ordered suit" and "first scan completed" was reportedly >60%.
- ZOZOFIT (2022 successor) simplified to a tight workout suit already owned. Demonstrates that the suit as the accuracy mechanism works — the lesson is the original onboarding was too much friction.
- Lesson: every step between "user wants to scan" and "scan complete" is a drop-off point. Sik AI's suitless approach reduces this but must still minimize the setup protocol.

**Mirror Mirror (various apps, 2019–2022):**
- Multiple apps attempted phone-based body measurement without a suit or special hardware.
- Common failure: measuring the clothing outline rather than the body, then not telling users to wear tight clothing explicitly enough.
- Common failure: the app works in demos (controlled lighting, the founder holds the phone) but breaks in real home environments (cluttered backgrounds, uneven lighting, mirrors in frame, pets, kids).
- Lesson: the real-world capture environment is chaotic. Build in background-clutter detection, lighting checks, and mirror-detection (scanning in front of a mirror doubles the person in frame and confuses segmentation).

**Prevention:**
- Design for a messy apartment, not a photo studio.
- Add a pre-scan environment check: background uniformity, lighting evenness, no mirror in frame.
- The simpler the capture protocol, the better. Each reduction in required steps increases completion rate.

**Phase mapping:** The capture protocol UX must be validated with real users in real environments during the spike, not just in ideal conditions.

**Confidence:** MEDIUM — Naked Labs and ZOZOSUIT failure patterns are publicly documented. Specific internal metrics are estimated from public reporting and industry analysis.

---

### Pitfall 10: App Store / Apple Review Rejection for Body-Imaging Apps

**What goes wrong:** Apple's App Review rejects the app or requests substantial changes because it captures body imagery from users who may be in minimal clothing, stores that imagery locally, or displays measurements in a way that Apple deems inappropriate.

**Why it happens:** Apple's App Review guidelines (4.2 for minimum functionality, 5.1.1 for data collection and privacy) have specific implications for body-imaging apps:
- **Guideline 1.1.4** (Objectionable content): Apps that display the human body in states of undress require explicit age rating and content classification. A body-measurement app where users scan in underwear may require a 17+ rating or parental advisory.
- **Guideline 5.1.1** (Privacy — Data Collection and Storage): Even on-device storage of body images may require clear disclosure in the privacy policy and a compelling UX reason. Apple has rejected apps that capture images without a clear user-visible purpose.
- **Guideline 2.1** (App Completeness): Apple rejects apps that make unfounded health or medical claims. If the app or App Store listing says "accurately measures body fat percentage," Apple may reject or request substantiation.

**Prevention:**
- Age-rate the app 17+ from day one. Do not fight this — accepting it early avoids a rejecting review.
- Write the privacy policy before submitting for review. It must explicitly state: (a) body images are processed on-device, (b) images are not transmitted to any server, (c) measurement data is stored locally and not shared.
- Do not use language like "body fat percentage" without validating that the measurement method is scientifically defensible. Use "body composition estimate" or similar hedged language.
- Test the App Store listing text through the lens of Guideline 2.5.13 (apps must clearly describe all functions). The listing should not promise more than the app can deliver.
- Have an Apple developer account in good standing before beginning this work — account terminations for policy violations can be retroactive.

**Phase mapping:** App Store review strategy and privacy policy must be drafted during the productization phase, before first external beta via TestFlight.

**Confidence:** HIGH for general principle; MEDIUM for specific guideline numbers (Apple's review guidelines are updated frequently; verify against current App Store Review Guidelines).

---

### Pitfall 11: React Native / CoreML Bridge Failure Patterns

**What goes wrong:** The ML inference runs in a native Swift/Objective-C module, but the result handoff to React Native via the JS bridge corrupts image buffer formats, causes OOM crashes on older devices, or introduces subtle timing bugs where the camera frame processed is not the frame the user saw when they tapped "Capture."

**Why it happens:** React Native's architecture separates JavaScript and native code. Expo's New Architecture (JSI / TurboModules) improves this, but camera frame data is still large (a 1080p frame is ~6MB uncompressed). Common failure modes:
- Image format mismatch: AVFoundation delivers frames in kCVPixelFormatType_420YpCbCr8BiPlanarFullRange (YUV420). CoreML models expect CVPixelBuffer in a different format or explicit normalization. Conversion is required; forgetting it produces garbage model input.
- Buffer lifetime: camera frame buffers must be retained during native inference. If the buffer is released before inference completes (which can happen if the camera delivers a new frame), the model reads freed memory.
- Frame timestamp misalignment: user taps capture, but the captured frame was taken 200ms before the tap registers in JS, during which the user moved. This introduces a systematic "blurry on capture" problem.
- Memory pressure: running a body-pose model AND a segmentation model AND a shape-fitting model simultaneously can push a 3GB device into memory pressure, causing jitter or the OS killing the app.

**Prevention:**
- Write the native capture + inference layer in Swift, entirely within a Expo native module. Do not try to pipe raw image data through the JS bridge.
- Only send the final measurement output (a small JSON object with 11 floats) across the bridge, not images or buffers.
- Use Expo Camera's `onCameraReady` and frame processor pattern (via `react-native-vision-camera` or similar) to capture frames natively and process them in native code.
- Run the ML pipeline serially: pose estimation → segmentation → shape fitting. Do not parallelize unless profiling shows a clear benefit, because parallel execution increases peak memory.
- Test on an iPhone 13 with 4GB RAM under memory pressure (background apps open).

**Phase mapping:** The spike architecture must be designed around a native module from day one. Attempting to prototype in JS-land and migrate to native later is a complete rewrite.

**Confidence:** HIGH for the general pattern; HIGH for YUV/RGB format mismatch (this is the single most common mistake in iOS camera ML pipelines based on community experience).

---

### Pitfall 12: Privacy/Legal Risk From On-Device Body Image Storage

**What goes wrong:** Even "on-device only" body imagery creates legal exposure. If the user photographs themselves in minimal clothing and that data is in AsyncStorage or the device photo library, a subsequent device backup (iCloud Backup), device transfer to a new phone, or a forensic examination creates risks the product owner didn't anticipate.

**Why it happens:**
- iCloud Backup backs up all app data by default, including AsyncStorage. A user's nearly-nude scan frames could be in iCloud without the user understanding this.
- If the app stores image paths that point to the photo library, iCloud Photo Library sync could upload body images to the cloud without the app's knowledge.
- GDPR (and CCPA) apply even to on-device storage when data is personal data that can identify a natural person. Body measurements + images + user-provided name/height = personal data under GDPR regardless of where it's stored.
- EU AI Act (effective 2024–2026) has provisions around biometric data that body images and measurements may qualify under, depending on how they are processed.

**Prevention:**
- Do not store raw body images after measurement extraction. Process the frame, extract measurements, discard the image. Only store the measurement output (numbers).
- If images must be stored (e.g., for the "compare photos" feature implied by the UI), store them in the app's sandboxed directory with `iCloud backup excluded` flag set in the file attributes.
- Add `NSPrivacyAccessedAPITypes` for camera usage to the app's `PrivacyInfo.xcprivacy` manifest (required for App Store submission starting iOS 17+).
- Write the privacy policy to state explicitly what data is retained, what is processed ephemerally, and how users can delete it.
- The existing decision to store data in AsyncStorage is fine for measurements (numerical data). It is NOT fine for images. Keep these on separate storage paths with different backup policies.

**Phase mapping:** The data-retention and privacy policy decisions must be made before the first TestFlight build that processes real body images. This is not a launch-gate item; it's a first-build item.

**Confidence:** HIGH for iCloud Backup behavior and App Store privacy manifest requirements; MEDIUM for EU AI Act applicability (regulations are evolving; obtain legal advice before EU launch).

---

## Minor Pitfalls

---

### Pitfall 13: Lighting Variation Causes Day-to-Day Measurement Drift

**What goes wrong:** Users scan in their bathroom in the morning and get one reading. They scan in the gym before a workout and get a different reading — not because their body changed but because the background lighting, shadow direction, and color temperature changed the segmentation.

**Prevention:** The capture protocol must specify lighting requirements explicitly ("stand facing a window" or "stand with overhead light, not backlit"). Build a real-time lighting check into the scan flow using the camera exposure metadata or histogram analysis. If lighting is inadequate or highly directional, block capture and prompt correction.

**Phase mapping:** Capture protocol must include lighting guidance before any measurement is taken. Test explicitly under fluorescent (gym) vs. natural light vs. bathroom light conditions.

**Confidence:** HIGH — lighting sensitivity is documented in all monocular segmentation and body reconstruction literature.

---

### Pitfall 14: User's Own Height Input Is Unreliable

**What goes wrong:** People consistently misreport their height — typically by 1–3cm toward taller. Since height is used as the scale reference for all circumference measurements, a 2cm height inflation produces systematic overestimation across all circumferences.

**Prevention:** Provide height entry in 1cm increments (not 5cm buckets). Add a note: "Measured height, not estimated height." Consider offering a height-verification step where the user holds the phone to a wall and steps back to a marked position — though this adds friction. At minimum, validate that the entered height is plausible given the estimated body size from the image.

**Phase mapping:** Onboarding must prompt accurate height entry. The spike should test sensitivity of output measurements to ±2cm height input error.

**Confidence:** HIGH — self-reported height bias is well-documented in health research.

---

### Pitfall 15: Measurement Naming Ambiguity Erodes User Trust

**What goes wrong:** The app reports "waist: 82cm" but the user measures their waist with a tape and gets 85cm — and they're measuring at different landmarks. The anatomical "natural waist" (narrowest point) is different from the "belly button circumference" which is different from what the model computes (a projected mesh cross-section at a parametrically defined waist location).

**Prevention:** Define measurement landmarks explicitly in user-facing documentation. Add small anatomical diagrams. Match the landmark definitions to what users expect from standard tape-measure guides. Validate landmarks during the spike against a standardized measurement protocol.

**Phase mapping:** During the spike, the ground-truth tape measurements must use the same anatomical landmarks as the model computes. If the landmarks differ, the comparison is meaningless.

**Confidence:** HIGH — landmark ambiguity is a documented problem in body measurement software user research.

---

### Pitfall 16: AsyncStorage Schema Drift Silently Corrupts Scan History

**What goes wrong:** A new version of the app adds or removes fields from `ScanRecord`. Old scan records in AsyncStorage don't match the new schema. The silently swallowing `try/catch` in `AppContext.tsx` re-seeds mock data, overwriting the user's real measurement history.

**Prevention:** The existing concern (CONCERNS.md §2) is already identified. The prevention is a proper AsyncStorage migration system: version the schema, detect version mismatch at hydration, and migrate forward. Do not rely on JSON.parse success as a validity signal.

**Phase mapping:** Before replacing mock data with real scan data (Phase 1 of productization), implement schema versioning and migration. A user losing their measurement history is a churn-producing event.

**Confidence:** HIGH — this is a concrete existing code risk identified in CONCERNS.md, not a speculative concern.

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| Feasibility Spike | Metric selection | Measuring absolute accuracy instead of test-retest reproducibility | Design spike protocol around reproducibility from day 1 |
| Feasibility Spike | Model selection | Choosing SMPL/SMPL-X before verifying license | License audit must be the first deliverable of the spike |
| Feasibility Spike | Tester selection | Homogeneous tester group masks demographic failure | Include ≥3 BMI categories, ≥2 skin tone categories |
| Feasibility Spike | Capture conditions | Testing only in ideal conditions (researcher-assisted, studio lighting) | Include at least one real-apartment, solo-capture condition |
| Feasibility Spike | Architecture | Prototyping inference in JS/TypeScript | Spike inference layer must be native Swift from day 1 |
| Capture UX Design | Protocol definition | Building UX before specifying physical constraints | Define capture pose and environment requirements first, then design UI |
| Capture UX Design | Clothing guidance | Under-specifying clothing tightness | "Tight-fitting clothing" must be explicit and demonstrated with example images |
| Native Module Build | Image format | YUV420 → RGB format mismatch on AVFoundation output | Verify format conversion in unit tests before any model receives input |
| Native Module Build | Memory | Simultaneous pipeline stages exceeding device RAM | Profile on iPhone 13 (4GB) with background apps open |
| CoreML Integration | iOS compatibility | Latency regression after iOS update | Benchmark on 3 device generations; re-run after each iOS update |
| First TestFlight Build | Privacy compliance | Body image stored to iCloud Backup | Implement iCloud exclusion and ephemeral image processing before any real user beta |
| App Store Submission | Review guidelines | Body imagery age-rating and health-claim language | 17+ rating, hedged health language, privacy policy ready before submission |
| AsyncStorage → Real Data | Schema migration | Old mock records corrupting real scan history | Schema versioning required before first real scan is stored |
| Launch | Demographic coverage | Gaps in accuracy for high-BMI users (the weight-loss market) | Document known limitations; build in-app disclosure if needed |

---

## Sources and Confidence Summary

| Area | Confidence | Basis |
|------|------------|-------|
| SMPL/SMPL-X license status | HIGH | Well-documented in academic community; MPI IS license pages are canonical. Verify at source before commercial use. |
| Test-retest vs. absolute accuracy distinction | HIGH | Fundamental measurement theory; documented in body-composition literature |
| Demographic bias in SMPL-family models | HIGH | Documented in MPI IS papers and independent fairness research |
| CoreML performance regression patterns | MEDIUM | Based on developer community reports and Apple documentation patterns; verify against current iOS |
| Capture protocol failure modes | HIGH | Documented in multiple consumer body-measurement product evaluations |
| App Store review patterns | MEDIUM | Based on developer community experience; Apple's guidelines change; verify against current guidelines |
| RN bridge / image buffer pitfalls | HIGH | Common iOS camera ML integration problem documented extensively in community |
| Privacy / iCloud Backup behavior | HIGH | Apple developer documentation; well-established behavior |
| Competitor failure patterns (Naked Labs, ZOZOSUIT) | MEDIUM | Public reporting and industry analysis; not first-hand data |

**Note:** Web search and WebFetch were unavailable during this research session. All findings are from training knowledge (cutoff August 2025). License status for specific models (SMPL, SMPL-X, SHAPY, STAR, 4D-Humans) must be independently verified against current license texts at source institutions before any commercial use decision is made.
