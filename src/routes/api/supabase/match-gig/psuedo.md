# 🎯 Gig Matcher Endpoint – Pseudocode Overview

This endpoint receives a request containing a start date, venue ID, and a list of band objects. It attempts to find a matching gig already in the Supabase `gigs` table based on venue and band overlap on the same day.

---

## 🔁 HTTP Method

**POST** `/api/supabase/match-gig`

---

## 📥 Expected Request Body (JSON)

- `startDate` – a valid ISO date string.
- `venueId` – string, venue identifier.
- `bandObjects` – array of band objects, each with at least a `bandname` string field.

---

## 📤 Response

- `{ matchId: string | null, reason?: string }` on success
- `{ error: string }` on validation, parsing, or internal failure

---

## ⚙️ Normalization Utility: `normalize(inputStr)`

1. Remove trailing parentheses and enclosed text (e.g. `"The Band (SYD)"` → `"The Band"`).
2. Convert to lowercase.
3. Remove all whitespace.
4. Remove all non-alphanumeric characters.

Returns a normalized string, or `''` if invalid.

---

## 🔍 Matching Logic

### Step 1 – Validate Input

- Ensure `startDate`, `venueId`, and `bandObjects` are present.
- Ensure `bandObjects` is an array.
- Ensure `venueId` is a string.
- If invalid, return `400 Bad Request`.

---

### Step 2 – Parse Date Range

- Convert `startDate` to a `Date` object.
- Set `dayStart` to 00:00 UTC of that date.
- Set `dayEnd` to 24 hours later.

---

### Step 3 – Query Supabase

Query the `gigs` table for rows where:

- `start_date >= dayStart`
- `start_date < dayEnd`

Select fields:

- `id`
- `start_date`
- `venue_id`
- `band_objects`

Return `500 Internal Error` if the query fails.

---

### Step 4 – Normalize Bands for Comparison

- Map `bandObjects` → `inputBands` as normalized names.
- Ignore missing or invalid names.

---

### Step 5 – Iterate Through Potential Matches

For each gig from Supabase:

1. Skip if:

   - `venue_id` is not a string
   - `band_objects` is not an array

2. Extract:

   - `matchVenueId` ← raw `venue_id` (no normalization)
   - `matchBands` ← normalized names from `band_objects`

3. If `matchVenueId !== venueId` → skip

4. If any `inputBand` matches any `matchBand`:
   - ✅ Return match: `{ matchId, reason: "Venue and band overlap" }`

---

### Step 6 – No Match Found

If no overlap found:

- Return `{ matchId: null, requested: reqBody, potentials: potentialMatches }`

---

## 🧯 Error Handling

- If the request body is not valid JSON → return `400 Invalid JSON`
- For all other exceptions → return `500 Internal error`

---

## 📝 Logging

- Logs errors from Supabase and JSON parsing
- Logs a celebratory message when a match is found:\
  `🥳 HOORAY!!!!!! GIG MATCH FOUND IN DATABASE 🥳`

---
