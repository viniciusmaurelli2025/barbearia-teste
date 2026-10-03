# BARBERIA — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Master Gate Mapping
1. **Default Deny Safety Net**: Any path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Admin Verification**: Admin privileges are granted ONLY if `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` OR (`request.auth.token.email == 'viniciusmaurelli2025@gmail.com' && request.auth.token.email_verified == true`).
3. **PII Isolation (`users/{userId}/private/{docId}`)**: Customer phone and email are isolated in a private subcollection. Only the verified owner (`request.auth.uid == userId`) or an Admin can read or write this document, and the parent `/users/$(userId)` document must exist (`Master Gate`).
4. **Strict Ownership (`appointments`, `saved_references`, `ai_generations`)**:
   - Every created document must bind `userId == request.auth.uid` and `createdAt == request.time`.
   - `list` queries are strictly constrained at the rule level (`resource.data.userId == request.auth.uid || isAdmin()`).
5. **Terminal State Locking (`appointments`)**: Once an appointment reaches `status == 'completed'` or `status == 'cancelled'`, non-admin users cannot update it further.
6. **Public Catalogs (`barbers`, `services`, `haircuts`, `business_settings`)**:
   - Readable via `get` if `isValidId(id)` and via `list` only when `resource.data.isPublic == true`.
   - Write access (`create`, `update`, `delete`) is restricted strictly to `isAdmin()` with full `isValid[Entity]` schema validation and `updatedAt == request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on UserProfile**: `{ uid: "u1", displayName: "João", favoriteCutIds: [], themePreference: "dark", isAdmin: true, createdAt: SERVER_TIME, updatedAt: SERVER_TIME }` -> **DENIED** by `hasOnly`.
2. **Identity Spoofing on Appointment Create**: Authenticated as `userA`, creating an appointment with `userId: "userB"` -> **DENIED** by `incoming().userId == request.auth.uid`.
3. **Unverified Email Admin Spoof**: Token has `email: "viniciusmaurelli2025@gmail.com"` but `email_verified: false` attempting to update `business_settings` -> **DENIED** by `email_verified == true`.
4. **PII Blanket Read Attack**: Authenticated `userB` attempting `get(/users/userA/private/contact)` -> **DENIED** by owner/admin check.
5. **Unfiltered List Scraping on Appointments**: Authenticated `userB` running `getDocs(collection(db, 'appointments'))` without `where('userId', '==', 'userB')` -> **DENIED** by `resource.data.userId == request.auth.uid`.
6. **Terminal State Reversal on Appointment**: `userA` attempting to change an appointment from `status: "cancelled"` back to `"confirmed"` -> **DENIED** by terminal state lock (`existing().status == 'confirmed'`).
7. **Update-Gap Value Poisoning**: `userA` updating `status` on an appointment to `"hacked_status"` -> **DENIED** by `isValidAppointment(incoming())`.
8. **Temporal Forgery**: `userA` creating a `saved_references` doc with a past `createdAt` timestamp instead of `serverTimestamp()` -> **DENIED** by `incoming().createdAt == request.time`.
9. **ID Poisoning Attack**: Creating a document with a 500-char or special-char ID -> **DENIED** by `isValidId()`.
10. **Array Exhaustion Attack**: Updating `favoriteCutIds` with 200 items -> **DENIED** by `data.favoriteCutIds.size() <= 50`.
11. **Unauthorized Catalog Mutation**: Regular verified user attempting to change `price` in `/services/corte` -> **DENIED** by `isAdmin()`.
12. **Immutable Field Mutation**: `userA` attempting to mutate `createdAt` or `userId` during an update on `/users/userA` -> **DENIED** by `affectedKeys().hasOnly(...)` and immutability check.
